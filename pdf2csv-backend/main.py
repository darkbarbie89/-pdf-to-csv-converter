from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
from extract import extract_tables

app = FastAPI()

# ✅ Add your allowed origins
origins = [
    "https://psd2csv-frontend.onrender.com",  # your deployed frontend
    "http://localhost:3000",                  # local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # use list instead of regex
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/convert")
async def convert_pdf(file: UploadFile = File(...)):
    try:
        temp_dir = tempfile.mkdtemp()
        pdf_path = os.path.join(temp_dir, file.filename)
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        csv_path = extract_tables(pdf_path)
        if not csv_path or not os.path.exists(csv_path):
            return JSONResponse(status_code=400, content={"error": "No tables detected"})

        return FileResponse(csv_path, filename="converted.csv", media_type="text/csv")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
