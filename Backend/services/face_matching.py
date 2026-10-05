import numpy as np


def calculate_similarity(embedding1, embedding2):
    """
    Calculate cosine similarity between two face embeddings.
    """

    vector1 = np.array(embedding1, dtype=np.float32)
    vector2 = np.array(embedding2, dtype=np.float32)

    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)

    if norm1 == 0 or norm2 == 0:
        return {
            "success": False,
            "message": "Invalid face embedding"
        }

    # Normalize both embeddings
    vector1 = vector1 / norm1
    vector2 = vector2 / norm2

    # Cosine similarity
    similarity = float(np.dot(vector1, vector2))

    return {
        "success": True,
        "similarity": similarity
    }


def compare_faces(embedding1, embedding2, threshold=0.5):
    """
    Compare two face embeddings and determine
    whether they are a potential match.
    """

    result = calculate_similarity(embedding1, embedding2)

    if not result["success"]:
        return result

    similarity = result["similarity"]

    return {
        "success": True,
        "similarity": similarity,
        "potential_match": similarity >= threshold
    }