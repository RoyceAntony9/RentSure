
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import pymupdf

from app.ml.analyzer import analyze_agreement as run_analysis

app = FastAPI(
    title="RentSure API",
    description="AI-powered rental agreement analysis",
    version="1.0.0"
)

# Allow requests from our React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextAnalysisRequest(BaseModel):
    text: str
    title: str = "Pasted Rental Agreement"


@app.get("/")
def home():
    return {
        "message": "Welcome to RentSure API",
        "status": "Backend is running"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/samples/{filename}")
def download_sample_pdf(filename: str):
    base_dir = Path(__file__).resolve().parent.parent.parent
    sample_path = base_dir / "frontend" / "public" / "samples" / filename
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample PDF not found.")
    return FileResponse(
        path=str(sample_path),
        filename=filename,
        media_type="application/pdf"
    )


@app.post("/api/analyze-text")
def analyze_text_endpoint(req: TextAnalysisRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Agreement text cannot be empty."
        )

    try:
        analysis = run_analysis(req.text)
        return {
            "filename": req.title or "Custom Text Agreement",
            "pages": 1,
            "extracted_text": req.text,
            "analysis": analysis,
            "message": "Custom text analyzed successfully."
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Text analysis failed: {str(error)}"
        )


@app.post("/api/analyze")
async def analyze_agreement(file: UploadFile = File(...)):

    # Check file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    # Read uploaded PDF
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB."
        )

    try:
        # Extract text using PyMuPDF
        document = pymupdf.open(
            stream=content,
            filetype="pdf"
        )

        extracted_text = ""

        for page in document:
            extracted_text += page.get_text() + "\n"

        page_count = len(document)
        document.close()

        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text found. This PDF may be scanned."
            )

        # Run RentSure clause analysis
        analysis = run_analysis(extracted_text)

        return {
            "filename": file.filename,
            "pages": page_count,
            "extracted_text": extracted_text,
            "analysis": analysis,
            "message": "PDF uploaded and analyzed successfully."
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Agreement analysis failed: {str(error)}"
        )
