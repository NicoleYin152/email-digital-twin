import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_reply(email_text: str, pdf_text: str, tone: str = "Professional", strategy: str = "Standard") -> str:
    if strategy == "Summarize PDF before replying":
        prompt = f"""
You're an assistant that first summarizes the attached PDF, then replies to the email using the tone: {tone}.

Step 1: Summarize PDF.
Step 2: Generate a thoughtful reply to the email using both the email and summarized PDF.

Email:
{email_text}

PDF:
{pdf_text}
"""

    elif strategy == "Concise reply":
        prompt = f"""
Reply to the following email concisely, using the tone: {tone}.
Attached PDF content may help, but keep your response short and effective.

Email:
{email_text}

PDF:
{pdf_text}
"""

    elif strategy == "Elaborate reply":
        prompt = f"""
Generate a detailed and thoughtful reply to the following email. Use the tone: {tone} and draw insights from the PDF when helpful.

Email:
{email_text}

PDF:
{pdf_text}
"""

    elif strategy == "Use email only (ignore PDF)":
        prompt = f"""
Write a reply using only the email content below. Ignore the PDF entirely. Tone: {tone}

Email:
{email_text}
"""

    else:  # Standard
        prompt = f"""
You're a helpful assistant generating smart and personalized email replies.

Use the tone: {tone}

Email thread:
{email_text}

PDF content:
{pdf_text}

Write a reply in the specified tone that continues the conversation naturally.
"""


    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"
