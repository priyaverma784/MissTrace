import os
import cv2
import numpy as np
from insightface.app import FaceAnalysis

# Models are stored in <project_root>/models
MODEL_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models"
)

_face_app = None


def _get_app():
    """Load the model once, on the first request (keeps startup fast and light)."""
    global _face_app
    if _face_app is None:
        _face_app = FaceAnalysis(
            name="buffalo_sc",  # smallest pack (~15 MB): detection + recognition
            root=MODEL_ROOT,
            allowed_modules=["detection", "recognition"],
            providers=["CPUExecutionProvider"],
        )
        _face_app.prepare(ctx_id=0, det_size=(320, 320))
    return _face_app


def get_face_embedding(image_path):
    """
    Detect the face and generate a normalized face embedding
    from an image file.
    """
    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "message": "Unable to read image"
        }

    # Shrink large images to save memory
    h, w = image.shape[:2]
    if max(h, w) > 800:
        scale = 800 / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)))

    faces = _get_app().get(image)

    if len(faces) == 0:
        return {
            "success": False,
            "message": "No face detected"
        }

    # Use the largest face in the image
    face = max(
        faces,
        key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])
    )

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