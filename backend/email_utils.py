import os
import resend
from dotenv import load_dotenv
load_dotenv()

resend.api_key = os.environ.get("RESEND_API_KEY")

async def send_verification_email(to_email: str, verify_link: str):
    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY not set")

    resend.Emails.send({
        "from": "PortfolioAI <no-reply@portfolioai.site>",  
        "to": [to_email],
        "subject": "Verify your email",
        "html": f"""
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify your email</h2>
          <p>Thanks for signing up! Click the button below to verify your account:</p>
          <p>
            <a href="{verify_link}" 
               style="display:inline-block;padding:12px 20px;background:#38bdf8;color:#000;text-decoration:none;border-radius:6px;">
              Verify Email
            </a>
          </p>
          <p>If you didn’t create this account, you can ignore this email.</p>
        </div>
        """
    })

async def send_contact_email(
    to_email: str,
    sender_name: str,
    sender_email: str,
    message: str
):
    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY not set")

    resend.Emails.send({
        "from": "PortfolioAI <no-reply@portfolioai.site>",
        "to": [to_email],
        "subject": f"New message from {sender_name}",
        "html": f"""
        <div style="font-family: Arial, sans-serif;">
          <h2>New Portfolio Message</h2>

          <p><strong>Name:</strong> {sender_name}</p>
          <p><strong>Email:</strong> {sender_email}</p>

          <p><strong>Message:</strong></p>
          <div style="padding:12px;background:#f3f4f6;border-radius:6px;">
            {message}
          </div>

          <hr style="margin:20px 0;" />

          <p>You received this message from your public portfolio.</p>
        </div>
        """
    })    