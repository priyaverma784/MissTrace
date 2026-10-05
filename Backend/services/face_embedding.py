import cv2
import numpy as np
from insightface.app import FaceAnalysis

face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

def get_face_embedding(image_path):
    """
    Detect the face and generate a face embedding
    from an image file.
    """

    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "message": "Unable to read image"
        }

    faces = face_app.get(image)

    if len(faces) == 0:
        return {
            "success": False,
            "message": "No face detected"
        }

    face = faces[0]

    embedding = face.embedding

    norm = np.linalg.norm(embedding)

    if norm == 0:
        return {
            "success": False,
            "message": "Unable to generate face embedding"
        }

    embedding = embedding / norm

    return {
        "success": True,
        "embedding": embedding.tolist()
    }