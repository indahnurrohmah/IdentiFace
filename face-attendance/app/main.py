from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
from app.face_service import detect_face, generate_embedding
from app.database import get_connection

app = FastAPI()

UPLOAD_FOLDER = "stored-faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/register-face/{nim}")
async def register_face(nim: str, file: UploadFile = File(...)):
    temp_path = f"{UPLOAD_FOLDER}/temp_{nim}.jpg"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    #Deteksi wajah
    hasil_deteksi = detect_face(temp_path)
    if hasil_deteksi["status"] == "gagal":
        os.remove(temp_path)
        return hasil_deteksi
    
    embedding = generate_embedding(temp_path)
    os.remove(temp_path)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id_mahasiswa FROM mahasiswa WHERE nim = %s", (nim,))
        result = cur.fetchone()

        if result is None:
            return {
                "status": "gagal",
                "pesan": f"NIM {nim} tidak ditemukan di database."
            }
        
        cur.execute(
            "UPDATE mahasiswa SET data_wajah_embed = %s WHERE nim = %s",
            (embedding, nim)
        )
        conn.commit()

        return {
            "status": "ok",
            "nim": nim,
            "pesan": "Wajah berhasil dideteksi",
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cur.close()
        conn.close()