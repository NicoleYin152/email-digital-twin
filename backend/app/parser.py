import fitz  # PyMuPDF
from fastapi import UploadFile

async def extract_texts(file: UploadFile) -> str:
    content = await file.read()
    if file.filename.endswith(".pdf"):
        with fitz.open(stream=content, filetype="pdf") as doc:
            return "\n".join(page.get_text() for page in doc)
    else:
        return content.decode("utf-8", errors="ignore")
