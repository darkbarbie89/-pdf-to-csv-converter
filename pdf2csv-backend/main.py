from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
import os
import tempfile
from extract import extract_tables

app = FastAPI()

@app.post("/convert")
async def convert_pdf(file: UploadFile = File(...)):
    try:
        # Save temporary file
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
