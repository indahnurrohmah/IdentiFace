import face_recognition
import numpy as np

def detect_face(image_path: str):

    image = face_recognition.load_image_file(image_path)

    face_locations = face_recognition.face_locations(image, model="hog")
    # model="hog" itu berbasis CPU — cocok untuk development
    # nanti bisa diganti model="cnn" untuk akurasi lebih tinggi (butuh GPU)

    jumlah_wajah = len(face_locations)

    if jumlah_wajah == 0:
        return{"status": "gagal", "pesan": "Tidak ada wajah yang terdeteksi."}
    
    if jumlah_wajah > 1:
        return{"status": "gagal", "pesan": f"Terdeteksi {jumlah_wajah} wajah. Pastikan hanya satu wajah dalam gambar."}
    
    return {"status": "ok", "pesan": "1 wajah terdeteksi"}

def generate_embedding(image_path: str):
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image, model="hog")

    embeddings = face_recognition.face_encodings(image, face_locations)
    embedding = embeddings[0] 
    return embedding.tolist()