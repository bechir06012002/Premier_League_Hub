"""Low-level SMTP send + markdown->HTML rendering for the daily digest email."""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import markdown as markdown_lib
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

_PAGE_STYLE = (
    "font-family: -apple-system, Segoe UI, Roboto, sans-serif; "
    "max-width: 680px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;"
)
_BANNER_STYLE = (
    "background: #37003c; color: #ffffff; padding: 16px 24px; border-radius: 8px; "
    "font-size: 20px; font-weight: bold; margin-bottom: 16px;"
)
_FOOTER_STYLE = "margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #888888; font-size: 12px;"


def _wrap_in_template(body_html: str) -> str:
    return f'<html><body style="{_PAGE_STYLE}">{body_html}</body></html>'


def markdown_to_html(markdown_text: str) -> str:
    body_html = markdown_lib.markdown(markdown_text, extensions=["extra"])
    return _wrap_in_template(body_html)


def digest_to_html(markdown_text: str) -> str:
    body_html = markdown_lib.markdown(markdown_text, extensions=["extra"])
    banner = f'<div style="{_BANNER_STYLE}">⚽ Premier League Hub</div>'
    footer = f'<div style="{_FOOTER_STYLE}">You are receiving this because you subscribed to Premier League Hub.</div>'
    return _wrap_in_template(banner + body_html + footer)


def send_email(subject: str, body_text: str, body_html: str, to_email: Optional[str] = None) -> None:
    my_email = os.getenv("MY_EMAIL")
    app_password = os.getenv("APP_PASSWORD")
    recipient = to_email or my_email

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = my_email
    message["To"] = recipient
    message.attach(MIMEText(body_text, "plain"))
    message.attach(MIMEText(body_html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(my_email, app_password)
        server.sendmail(my_email, recipient, message.as_string())
