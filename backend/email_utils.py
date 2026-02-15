import os
import aiosmtplib
from email.message import EmailMessage
from pathlib import Path
from dotenv import load_dotenv

# Force load .env from backend folder
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

async def send_verification_email(to_email: str, verify_link: str):
    msg = EmailMessage()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = "Verify your PortfolioAI account"
    msg.set_content(f"""
Hi 👋

Thanks for signing up to PortfolioAI!

Please verify your email by clicking the link below:

{verify_link}

If you didn’t create this account, you can ignore this email.

– PortfolioAI Team
""")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USER,
        password=SMTP_PASS,
    )
