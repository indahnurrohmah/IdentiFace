from fastapi import FastAPI, UploadFile, File
import shutil
import os
from app.face_service import detect_face, generate_embedding

app = FastAPI()

UPLOAD_FOLDER = "stored-faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/register-face/{user_id}")
async def register_face(user_id: str, file: UploadFile = File(...)):
    temp_path = f"{UPLOAD_FOLDER}/temp_{user_id}.jpg"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    #Deteksi dulu — apakah ada tepat 1 wajah?
    hasil_deteksi = detect_face(temp_path)
    if hasil_deteksi["status"] == "gagal":
        os.remove(temp_path)
        return hasil_deteksi
    
    embedding = generate_embedding(temp_path)

    os.remove(temp_path)

    return {
        "status": "ok",
        "user_id": user_id,
        "pesan": "Wajah berhasil dideteksi",
        "embedding": embedding
    }