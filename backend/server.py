from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx
import razorpay
from PyPDF2 import PdfReader
import io
from openai import OpenAI
import json
import os
from email_utils import send_verification_email
import cloudinary
import cloudinary.uploader
from fastapi import Form


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)


# Razorpay client
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# OpenAI client
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")

client_llm = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    subscription_plan: str = "free"  # free or pro
    created_at: datetime

class SessionExchange(BaseModel):
    session_id: str

class Project(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    link: Optional[str] = None
    github_link: Optional[str] = None

class Education(BaseModel):
    degree: str
    institution: str
    year: str

class Experience(BaseModel):
    title: str
    company: str
    duration: str
    description: str

class Portfolio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    portfolio_id: str
    user_id: str
    name: str
    bio: str
    role: str
    skills: List[str]
    projects: List[Project]
    education: List[Education]
    experience: List[Experience]
    template: str = "minimal"  # minimal, modern, creative
    theme_color: str = "#4F46E5"
    is_published: bool = False
    slug: Optional[str] = None
    github_username: Optional[str] = None
    profile_image: Optional[str] = None   # ✅ ADD THIS
    created_at: datetime
    updated_at: datetime

class PortfolioCreate(BaseModel):
    name: str
    bio: str = ""
    role: str = ""
    skills: List[str] = []
    projects: List[Project] = []
    education: List[Education] = []
    experience: List[Experience] = []
    template: str = "minimal"
    theme_color: str = "#4F46E5"
    github_username: Optional[str] = None

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Project]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    template: Optional[str] = None
    theme_color: Optional[str] = None
    github_username: Optional[str] = None

class AIGenerateRequest(BaseModel):
    context: str
    type: str  # about, project, skills

class RazorpayOrder(BaseModel):
    amount: int  # in paise

class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# Health check route (for UptimeRobot / monitoring)
@app.get("/health")
def health():
    return {"status": "ok"}

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

async def get_current_user(request: Request) -> User:
    # Check cookie first, then Authorization header
    session_token = request.cookies.get('session_token')
    if not session_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.split(' ')[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert datetime fields
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup")
async def signup(user_data: UserSignup):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    verification_token = uuid.uuid4().hex

    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "picture": None,
        "subscription_plan": "free",
        "is_verified": False,
        "verification_token": verification_token,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.users.insert_one(user_doc)

    verify_link = f"{os.environ.get('FRONTEND_URL')}/verify?token={verification_token}"

    # Send email
    await send_verification_email(user_data.email, verify_link)

    return {"message": "Account created. Please check your email to verify your account."}


@api_router.get("/auth/verify")
async def verify_email(token: str):
    user = await db.users.find_one({"verification_token": token})

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    if user.get("is_verified"):
        return {"message": "Account already verified"}

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {"is_verified": True},
            "$unset": {"verification_token": ""}
        }
    )

    return {"message": "Email verified successfully. You can now log in."}


@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user_doc.get("is_verified"):
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )

    user_response = {k: v for k, v in user_doc.items() if k not in ["_id", "password_hash", "verification_token"]}
    if isinstance(user_response.get('created_at'), str):
        user_response['created_at'] = datetime.fromisoformat(user_response['created_at'])

    return {"user": User(**user_response), "session_token": session_token}

@api_router.post("/auth/session")
async def exchange_session(data: SessionExchange, response: Response):
    # Call Emergent Auth API
    async with httpx.AsyncClient() as http_client:
        try:
            resp = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": data.session_id}
            )
            resp.raise_for_status()
            session_data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to exchange session: {str(e)}")
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
    
    if user_doc:
        # Update existing user
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {
                "name": session_data["name"],
                "picture": session_data.get("picture")
            }}
        )
        user_id = user_doc["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": session_data["email"],
            "name": session_data["name"],
            "picture": session_data.get("picture"),
            "subscription_plan": "free",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session with Emergent's session_token
    session_token = session_data["session_token"]
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
         key="session_token",
    value=session_token,
    httponly=True,
    secure=True,        # ✅ allow on http
    samesite="none",      # ✅ works on cross-site
    path="/",
    max_age=7*24*60*60
    )
    
    user_response = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(user_response.get('created_at'), str):
        user_response['created_at'] = datetime.fromisoformat(user_response['created_at'])
    
    return {"user": User(**user_response), "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============ PORTFOLIO ROUTES ============

@api_router.get("/portfolios", response_model=List[Portfolio])
async def get_portfolios(current_user: User = Depends(get_current_user)):
    portfolios = await db.portfolios.find({"user_id": current_user.user_id}, {"_id": 0}).to_list(100)
    for p in portfolios:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return portfolios


@api_router.post("/portfolios", response_model=Portfolio)
async def create_portfolio(
    data: str = Form(...),                 # JSON string
    profile_image: UploadFile = File(None),
    current_user: User = Depends(get_current_user)
):
    # Check free plan limit
    if current_user.subscription_plan == "free":
        count = await db.portfolios.count_documents({"user_id": current_user.user_id})
        if count >= 1:
            raise HTTPException(status_code=403, detail="Free plan allows only 1 portfolio. Upgrade to Pro.")
    
    # Check pro plan limit
    if current_user.subscription_plan == "pro":
        count = await db.portfolios.count_documents({"user_id": current_user.user_id})
        if count >= 5:  # 👈 set your desired limit
            raise HTTPException(status_code=403, detail="Pro plan allows only 5 portfolios.")    

    try:
        portfolio_data = json.loads(data)
    except:
        raise HTTPException(status_code=400, detail="Invalid portfolio data")

    portfolio_id = f"portfolio_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)

    image_url = None

    if profile_image:
         # ✅ Read file
        contents = await profile_image.read()

        # ✅ Size check (1 MB max)
        MAX_SIZE = 1 * 1024 * 1024  # 1 MB
        if len(contents) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="Image too large. Max size is 1MB.")
         
        # ✅ Upload to Cloudinary (optionally limit dimensions too)
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="portfolio_profiles",
            public_id=portfolio_id,
            overwrite=True,
            resource_type="image",
            width=1024,
            height=1024,
            crop="limit",
            quality="auto",
            fetch_format="auto"
        )
        image_url = upload_result.get("secure_url")

    portfolio_doc = {
        **portfolio_data,
        "portfolio_id": portfolio_id,
        "user_id": current_user.user_id,
        "profile_image": image_url,   # ✅ Cloud URL
        "is_published": False,
        "slug": None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

    await db.portfolios.insert_one(portfolio_doc)

    portfolio_doc["created_at"] = now
    portfolio_doc["updated_at"] = now

    return Portfolio(**portfolio_doc)


@api_router.get("/portfolios/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(portfolio_id: str, current_user: User = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one(
        {"portfolio_id": portfolio_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if isinstance(portfolio.get('created_at'), str):
        portfolio['created_at'] = datetime.fromisoformat(portfolio['created_at'])
    if isinstance(portfolio.get('updated_at'), str):
        portfolio['updated_at'] = datetime.fromisoformat(portfolio['updated_at'])
    
    return Portfolio(**portfolio)

@api_router.put("/portfolios/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(
    portfolio_id: str,
    portfolio_data: PortfolioUpdate,
    current_user: User = Depends(get_current_user)
):
    # Check ownership
    existing = await db.portfolios.find_one(
        {"portfolio_id": portfolio_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Update
    update_data = {k: v for k, v in portfolio_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.portfolios.update_one(
        {"portfolio_id": portfolio_id},
        {"$set": update_data}
    )
    
    updated = await db.portfolios.find_one({"portfolio_id": portfolio_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Portfolio(**updated)

@api_router.delete("/portfolios/{portfolio_id}")
async def delete_portfolio(portfolio_id: str, current_user: User = Depends(get_current_user)):
    result = await db.portfolios.delete_one(
        {"portfolio_id": portfolio_id, "user_id": current_user.user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"message": "Portfolio deleted"}

@api_router.post("/portfolios/{portfolio_id}/publish")
async def publish_portfolio(portfolio_id: str, current_user: User = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one(
        {"portfolio_id": portfolio_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Generate slug from name
    slug = portfolio['name'].lower().replace(' ', '-').replace('_', '-')
    slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    await db.portfolios.update_one(
        {"portfolio_id": portfolio_id},
        {"$set": {"is_published": True, "slug": slug, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Portfolio published", "slug": slug}

# ============ AI ROUTES ============

@api_router.post("/ai/generate")
async def generate_ai_content(request: AIGenerateRequest, current_user: User = Depends(get_current_user)):
    if current_user.subscription_plan == "free":
        raise HTTPException(status_code=403, detail="AI features require Pro subscription")

    try:
        if request.type == "about":
            prompt = f"Write a professional 'About Me' section for a portfolio based on this context: {request.context}. Make it 2-3 paragraphs, highlighting skills and passion."
        elif request.type == "project":
            prompt = f"Rewrite this project description professionally and concisely: {request.context}. Focus on impact and technologies used."
        elif request.type == "skills":
            prompt = f"Create a compelling skills summary based on these skills: {request.context}. Make it one paragraph highlighting expertise."
        else:
            raise HTTPException(status_code=400, detail="Invalid type")

        completion = client_llm.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional portfolio content writer. Create compelling, concise, and recruiter-friendly content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        content = completion.choices[0].message.content
        return {"content": content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@api_router.post("/ai/extract-resume")
async def extract_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.subscription_plan == "free":
        raise HTTPException(status_code=403, detail="Resume parsing requires Pro subscription")

    try:
        content = await file.read()
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)

        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""

        prompt = f"""Extract from this resume:
{text}

Return JSON with: name, role, bio (2 sentences), skills (array), projects (array with title, description), education (array with degree, institution, year), experience (array with title, company, duration, description)."""

        completion = client_llm.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": "Extract structured portfolio data from resume text. Return JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        result = completion.choices[0].message.content

        return {
            "extracted_text": text,
            "structured_data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume extraction failed: {str(e)}")



# ============ GITHUB ROUTES ============

@api_router.get("/github/repos/{username}")
async def get_github_repos(username: str, current_user: User = Depends(get_current_user)):
    try:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "PortfolioAI",
        }

        github_token = os.getenv("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"Bearer {github_token}"

        async with httpx.AsyncClient() as http_client:
            resp = await http_client.get(
                f"https://api.github.com/users/{username}/repos",
                params={"sort": "updated", "per_page": 10},
                headers=headers
            )
            resp.raise_for_status()
            repos = resp.json()
            
            # Format for portfolio
            projects = []
            for repo in repos:
                if not repo.get('fork'):  # Skip forked repos
                    projects.append({
                        "title": repo["name"],
                        "description": repo["description"] or "No description",
                        "tech_stack": [repo.get("language")] if repo.get("language") else [],
                        "link": repo["html_url"],
                        "github_link": repo["html_url"],
                    })
            
            return {"projects": projects}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch GitHub repos: {str(e)}")


# ============ SUBSCRIPTION ROUTES ============

@api_router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    try:
        # Verify webhook signature
        razorpay_client.utility.verify_webhook_signature(
            payload.decode(),
            signature,
            os.getenv("RAZORPAY_WEBHOOK_SECRET")
        )

        data = json.loads(payload)

        print("📩 Webhook received:", data.get("event"))

        if data.get("event") == "payment.captured":
            payment = data["payload"]["payment"]["entity"]
            order_id = payment["order_id"]

            # Fetch order details from Razorpay to get notes
            order = razorpay_client.order.fetch(order_id)
            user_id = order.get("notes", {}).get("user_id")

            print("👤 User ID from order notes:", user_id)

            if user_id:
                result = await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_plan": "pro"}}
                )
                print("📝 DB update result:", result.raw_result)

        return {"status": "ok"}

    except Exception as e:
        print("❌ Webhook verification failed:", str(e))
        raise HTTPException(status_code=400, detail="Invalid webhook")
    

@api_router.post("/subscription/create-order")
async def create_subscription_order(order_data: RazorpayOrder, current_user: User = Depends(get_current_user)):
    try:
        razor_order = razorpay_client.order.create({
            "amount": order_data.amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": str(current_user.user_id)  # 👈 attach user id here
            }
        })

        print("✅ Order created:", razor_order.get("id"))
        return razor_order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

@api_router.post("/subscription/verify")
async def verify_subscription_payment(verify_data: RazorpayVerify, current_user: User = Depends(get_current_user)):
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': verify_data.razorpay_order_id,
            'razorpay_payment_id': verify_data.razorpay_payment_id,
            'razorpay_signature': verify_data.razorpay_signature
        })
        
        # Update user subscription
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"subscription_plan": "pro"}}
        )
        
        return {"message": "Payment verified, subscription upgraded to Pro"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")


@api_router.get("/subscription/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    return {"plan": current_user.subscription_plan}

# ============ PUBLIC ROUTES ============

@api_router.get("/public/portfolio/{slug}")
async def get_public_portfolio(slug: str):
    portfolio = await db.portfolios.find_one(
        {"slug": slug, "is_published": True},
        {"_id": 0, "user_id": 0}
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if isinstance(portfolio.get('created_at'), str):
        portfolio['created_at'] = datetime.fromisoformat(portfolio['created_at'])
    if isinstance(portfolio.get('updated_at'), str):
        portfolio['updated_at'] = datetime.fromisoformat(portfolio['updated_at'])
    
    return portfolio

# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "https://resumebuilderai-6rps.onrender.com", # 👈 your frontend Render URL
        "https://portfolioai.site",  # 👈 your frontend Custom Domain URL
        "https://www.portfolioai.site"  # 👈 your frontend Custom Domain URL
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()