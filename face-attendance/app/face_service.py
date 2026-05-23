import face_recognition

def analyze_face(image_path: str):

    image = face_recognition.load_image_file(image_path)

    face_locations = face_recognition.face_locations(image, model="hog")
    # model="hog" itu berbasis CPU — cocok untuk development
    # nanti bisa diganti model="cnn" untuk akurasi lebih tinggi (butuh GPU)

    if len(face_locations) == 0:
        return {"status": "No face",
                "pesan": "Tidak ada wajah yang terdeteksi."
                }
    
    if len(face_locations) > 1:
        return{
            "status": "multiple faces",
            "pesan": f"Terdeteksi {len(face_locations)} wajah. Pastikan hanya satu wajah."
        }
    
    top, right, bottom, left = face_locations[0]
    face_width = right - left
    face_height = bottom - top

    if face_width < 100 or face_height < 100:
        return {
            "status": "face too small",
            "pesan": f"Wajah terlalu kecil. Dekatkan wajahmu ke kamera."
        }
    
    embeddings = face_recognition.face_encodings(image, face_locations)
    if not embeddings:
        return{
            "status": "encoding failed",
            "pesan": "Gagal generate embedding."
        }
    return {
        "status" : "ok",
        "embedding": embeddings[0].tolist()
    }
                