FROM anaconda/miniconda3
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN conda install -c conda-forge dlib -y

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install git+https://github.com/ageitgey/face_recognition_models
RUN pip install --no-cache-dir --no-deps face_recognition

COPY app/ ./app/
RUN mkdir -p stored-faces

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
