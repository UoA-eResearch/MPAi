#!/usr/bin/env python3

import os
from typing import Annotated, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import zipfile
import io
from glob import glob
import dotenv
dotenv.load_dotenv()

app = FastAPI(root_path="/MPAi_API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

correct_password = os.getenv("password")
retrieval_password = os.getenv("retrieval_password")

def make_safe_filename(s):
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"
    return "".join(safe_char(c) for c in s).rstrip("_")

@app.post("/")
def upload(file: Annotated[bytes, File()], participant_id:str, password:str):
  if password == correct_password:
    # 10MB max
    if len(file) < 10 * 1024 * 1024:
      timestamp = datetime.now().strftime("%Y-%m-%d-%H_%M_%S")
      os.makedirs("uploads", exist_ok=True)
      open(f"uploads/{make_safe_filename(participant_id)}_{timestamp}.wav", "wb").write(file)
      return {"status": "success"}
    else:
      raise HTTPException(status_code=413, detail="File too large")
  else:
    raise HTTPException(status_code=403, detail="Incorrect password")

@app.get("/")
def retrieve(password: str, participant_id: Optional[str] = None):
    if password == retrieval_password:
        mem_zip = io.BytesIO()

        files = glob("uploads/*.wav")
        output_filename = "wavs.zip"
        if participant_id:
            files = [f for f in files if participant_id in os.path.basename(f)]
            output_filename = f"{make_safe_filename(participant_id)}_wavs.zip"

        with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for file_path in files:
                zf.write(file_path, arcname=os.path.basename(file_path))

        mem_zip.seek(0)

        return StreamingResponse(
            mem_zip,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )
    else:
        raise HTTPException(status_code=403, detail="Incorrect password")