#!/usr/bin/env python3

import os
from typing import Annotated
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile

app = FastAPI(root_path="/MPAi_API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

password = open("password.txt").read().strip()

@app.post("/")
def upload(file: Annotated[bytes, File()], participant_id:str, password:str):
  if password == password:
    timestamp = datetime.now().strftime("%Y-%m-%d-%H_%M_%S")
    os.makedirs("uploads", exist_ok=True)
    open(f"uploads/{participant_id}_{timestamp}.wav", "wb").write(file)
    return {"status": "success"}
  else:
    raise HTTPException(status_code=403, detail="Incorrect password")