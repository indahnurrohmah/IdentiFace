FROM continuumio/miniconda3
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    git \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN conda install -c conda-forge dlib -y

RUN /opt/conda/bin/pip install --no-cache-dir setuptools

COPY requirements.txt .
RUN /opt/conda/bin/pip install --no-cache-dir -r requirements.txt

COPY face_recognition_models/ ./face_recognition_models_repo/
RUN /opt/conda/bin/pip install --no-cache-dir --no-deps ./face_recognition_models_repo/
RUN /opt/conda/bin/pip install --no-cache-dir --no-deps face_recognition==1.3.0

RUN /opt/conda/bin/python -c "import face_recognition_models; print('models OK')"
RUN /opt/conda/bin/python -c "import face_recognition; print('face_recognition OK')"

COPY app/ ./app/
RUN mkdir -p stored-faces

EXPOSE 8000
CMD ["/opt/conda/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]