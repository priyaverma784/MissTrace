from services.face_detection import detect_face
from services.face_embedding import get_face_embedding


def process_face(image_path):
    """
    Detect a face and generate its embedding.
    """

    # Step 1: Detect face
    detection_result = detect_face(image_path)

    if not detection_result["success"]:
        return detection_result

    # Step 2: Generate face embedding
    embedding_result = get_face_embedding(image_path)

    if not embedding_result["success"]:
        return embedding_result

    return {
        "success": True,
        "face_count": detection_result["face_count"],
        "embedding": embedding_result["embedding"]
    }
