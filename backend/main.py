from fastapi import FastAPI, UploadFile, File
from parser import extract_email_and_pdf
from responder import generate_reply

app = FastAPI()

@app.post("/generate-reply")
async def generate(file: UploadFile = File(...)):
    pdf_text, email_thread = await extract_email_and_pdf(file)
    reply = generate_reply(pdf_text, email_thread)
    return {"reply": reply}
