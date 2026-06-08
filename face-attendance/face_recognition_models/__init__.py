import os

models_dir = os.path.join(os.path.dirname(__file__), "models")

def pose_predictor_model_location():
    return os.path.join(models_dir, "shape_predictor_68_face_landmarks.dat")

def pose_predictor_five_point_model_location():
    return os.path.join(models_dir, "shape_predictor_5_face_landmarks.dat")

def face_recognition_model_location():
    return os.path.join(models_dir, "dlib_face_recognition_resnet_model_v1.dat")

def cnn_face_detector_model_location():
    return os.path.join(models_dir, "mmod_human_face_detector.dat")