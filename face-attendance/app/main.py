from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from app.face_service import analyze_face
from app.database import get_connection

app = FastAPI()

allowed_origins = [
    "http://localhost:3000",     
    "http://localhost:5173",      
    "http://127.0.0.1:3000", 
    "https://identiface-backend-api-f3bse6gycfacb7au.southeastasia-01.azurewebsites.net"     
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],     
)

UPLOAD_FOLDER = "stored-faces"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MATCH_THRESHOLD = 0.6 # distance threshold (lower = stricter)

@app.get("/")
async def root():
    return {"status": "ok", "message": "IdentiFace AI Engine is running smoothly!"}

@app.post("/register-face/{nim:path}")
async def register_face(nim: str, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")
    
    temp_path = f"{UPLOAD_FOLDER}/temp_{nim.replace('/', '_')}.jpg"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = analyze_face(temp_path)
        if result["status"] != "ok":
            return {"status": "gagal", "pesan": result["pesan"]}

        embedding = result["embedding"]

        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT id_mahasiswa FROM mahasiswa WHERE nim = %s", (nim,))
            if cur.fetchone() is None:
                return {"status": "gagal", "pesan": f"NIM {nim} tidak ditemukan."}

            cur.execute(
                "UPDATE mahasiswa SET data_wajah_embed = %s WHERE nim = %s",
                (embedding, nim)
            )
            conn.commit()
            return {"status": "ok", "nim": nim, "pesan": "Wajah berhasil didaftarkan."}
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            cur.close()
            conn.close()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/verify-face")
async def verify_face(
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...)
):
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    temp_path = f"{UPLOAD_FOLDER}/temp_verify.jpg"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = analyze_face(temp_path)
        if result["status"] != "ok":
            return {
                "match": False,
                "status": result["status"],
                "pesan": result["pesan"]
            }

        embedding = result["embedding"]

        # Cari mahasiswa dengan wajah paling mirip
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT nim, nama_lengkap,
                       data_wajah_embed <-> %s::vector AS distance
                FROM mahasiswa
                WHERE data_wajah_embed IS NOT NULL
                ORDER BY distance ASC
                LIMIT 1;
            """, (embedding,))
            row = cur.fetchone()
        finally:
            cur.close()
            conn.close()

        if row is None:
            return {
                "match": False,
                "status": "no_data",
                "pesan": "Belum ada data wajah terdaftar di database"
            }

        nim, nama, distance = row
        similarity = round(1 - distance, 4)

        if distance < MATCH_THRESHOLD:
            return {
                "match": True,
                "status": "matched",
                "nim": nim,
                "nama": nama,
                "similarity": similarity,
                "pesan": f"Hai {nama}!"
            }
        else:
            return {
                "match": False,
                "status": "no_match",
                "similarity": similarity,
                "pesan": "Wajah tidak dikenali"
            }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)