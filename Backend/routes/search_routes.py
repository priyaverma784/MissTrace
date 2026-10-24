from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database.db import get_db_connection
from services.face_embedding import get_face_embedding
from services.face_matching import compare_faces
from werkzeug.utils import secure_filename
import os
import json
import uuid

search_routes = Blueprint("search_routes", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "search_images"
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# SEARCH MISSING PERSON
@search_routes.route("/api/search", methods=["POST"])
@jwt_required()
def search_missing_person():
    photo = request.files.get("photo")

    if not photo or not photo.filename:
        return jsonify({"error": "Search photo is required"}), 400

    filename = secure_filename(photo.filename)

    if not filename:
        return jsonify({"error": "Invalid photo filename"}), 400

    extension = os.path.splitext(filename)[1].lower()

    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        return jsonify({"error": "Unsupported image format"}), 400

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    photo.save(photo_path)

    try:
        embedding_result = get_face_embedding(photo_path)

        if not embedding_result["success"]:
            return jsonify({
                "error": embedding_result["message"]
            }), 400

        search_embedding = embedding_result["embedding"]

        connection = get_db_connection()

        try:
            persons = connection.execute(
                """
                SELECT *
                FROM missing_persons
                WHERE face_embedding IS NOT NULL
                """
            ).fetchall()

        finally:
            connection.close()

        matches = []

        for person in persons:
            try:
                stored_embedding = json.loads(person["face_embedding"])

                comparison = compare_faces(
                    search_embedding,
                    stored_embedding,
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
                        "potential_match": comparison["potential_match"],
                    })

            except (ValueError, TypeError, KeyError):
                continue

        matches.sort(
            key=lambda item: item["similarity"],
            reverse=True,
        )

        return jsonify({
            "message": "Search completed successfully",
            "matches": matches,
        }), 200

    finally:
        if os.path.exists(photo_path):
            try:
                os.remove(photo_path)
            except OSError:
                pass
