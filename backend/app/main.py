from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

# comment out when using test
# from backend.app.parser import extract_texts
# from backend.app.responder import generate_reply
# from backend.app.parser import extract_texts
# from backend.app.responder import client


from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from typing import Optional

# uncomment when using the test
from app.parser import extract_texts
from app.responder import generate_reply
from app.parser import extract_texts
from app.responder import client


app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]  # Temporarily open for all origins
,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.post("/generate-reply")
@limiter.limit("5/minute")
async def generate_reply_endpoint(
    request: Request,
    pdf: Optional[UploadFile] = File(None),
    email: Optional[UploadFile] = File(None),
    tone: str = Form("Professional"),
    strategy: str = Form("Standard")
):
    pdf_text = await extract_texts(pdf) if pdf else ""
    email_text = await extract_texts(email) if email else ""
    if not pdf_text and not email_text:
        return {"reply": "No input provided!"}
    
    reply = generate_reply(email_text=email_text, pdf_text=pdf_text, tone=tone)
    return {"reply": reply}

@app.post("/preview-text")
async def preview_text(file: UploadFile = File(...)):
    content = await extract_texts(file)
    return {"text": content}


@app.post("/summarize-pdf")
@limiter.limit("5/minute")
async def summarize_pdf(request: Request,pdf: UploadFile = File(...)):
    
    pdf_text = await extract_texts(pdf)

    if not pdf_text.strip():
        return {"summary": "No text found in the uploaded PDF."}

    prompt = f"""
Summarize the following document in 2-3 concise sentences for quick understanding:

{pdf_text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary}
    except Exception as e:
        return {"summary": f"Error: {str(e)}"}


@app.post("/summarize-email")
@limiter.limit("5/minute")
async def summarize_email(request: Request,email: UploadFile = File(...)):
    email_text = await extract_texts(email)

    if not email_text.strip():
        return {"summary": "No text found in the uploaded email."}

    prompt = f"""
Summarize the following email thread into 2-3 concise sentences:

{email_text}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary}
    except Exception as e:
        return {"summary": f"Error: {str(e)}"}


class FollowupRequest(BaseModel):
    previous: str
    prompt: str

@app.post("/followup-reply")
@limiter.limit("5/minute")
async def followup_reply(request: Request,data: FollowupRequest):
    prompt = f"""
You previously wrote this email reply:

\"\"\"{data.previous}\"\"\"

Now the user has a follow-up request:

\"\"\"{data.prompt}\"\"\"

Please revise the email reply accordingly.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return {"reply": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}