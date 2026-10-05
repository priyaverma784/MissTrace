from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.face_embedding import get_face_embedding
from services.face_matching import compare_faces

import os
import json


search_routes = Blueprint("search_routes", __name__)


UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "search_images"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@search_routes.route("/api/search", methods=["POST"])
def search_missing_person():

    photo = request.files.get("photo")

    if not photo:
        return jsonify({
            "error": "Search photo is required"
        }), 400

    filename = photo.filename

    photo_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    photo.save(photo_path)

    # Generate embedding for search image
    embedding_result = get_face_embedding(photo_path)

    if not embedding_result["success"]:
        os.remove(photo_path)

        return jsonify({
            "error": embedding_result["message"]
        }), 400

    search_embedding = embedding_result["embedding"]

    # Get all missing persons
    connection = get_db_connection()

    persons = connection.execute("""
        SELECT *
        FROM missing_persons
        WHERE face_embedding IS NOT NULL
    """).fetchall()

    connection.close()

    matches = []

    # Compare search face with stored faces
    for person in persons:

        stored_embedding = json.loads(
            person["face_embedding"]
        )

        comparison = compare_faces(
            search_embedding,
            stored_embedding
        )

        if comparison["success"]:

            matches.append({
                "id": person["id"],
                "name": person["name"],
                "age": person["age"],
                "gender": person["gender"],
                "last_seen_location": person["last_seen_location"],
                "last_seen_date": person["last_seen_date"],
                "similarity": comparison["similarity"],
                "potential_match": comparison["potential_match"]
            })

    # Sort highest similarity first
    matches.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    return jsonify({
        "message": "Search completed successfully",
        "matches": matches
    }), 200