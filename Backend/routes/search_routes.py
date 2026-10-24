from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
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
    "search_images",
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


# CHECK ADMIN PERMISSIONS
def admin_required():
    user_id = get_jwt_identity()
    connection = get_db_connection()

    try:
        user = connection.execute(
            "SELECT role FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user["role"] != "admin":
            return jsonify({
                "error": "Administrator access required"
            }), 403

        return None

    finally:
        connection.close()


# SEARCH FOR MISSING PERSON
@search_routes.route("/api/search", methods=["POST"])
@jwt_required()
def search_missing_person():
    permission_error = admin_required()

    if permission_error:
        return permission_error

    photo = request.files.get("photo")

    if not photo or not photo.filename:
        return jsonify({
            "error": "Search photo is required"
        }), 400

    filename = secure_filename(photo.filename)
    extension = os.path.splitext(filename)[1].lower()

    if not filename or extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "error": "Upload a JPG, JPEG, PNG, or WEBP image"
        }), 400

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    photo.save(photo_path)

    try:
        embedding_result = get_face_embedding(photo_path)

        if not embedding_result.get("success"):
            return jsonify({
                "error": embedding_result.get(
                    "message",
                    "Could not process the uploaded face",
                )
            }), 400

        search_embedding = embedding_result["embedding"]

        connection = get_db_connection()

        try:
            persons = connection.execute(
                """
                SELECT id, name, age, gender, last_seen_location,
                       last_seen_date, face_embedding
                FROM missing_persons
                WHERE face_embedding IS NOT NULL
                """
            ).fetchall()
        finally:
            connection.close()

        matches = []

        for person in persons:
            try:
                stored_embedding = json.loads(
                    person["face_embedding"]
                )

                comparison = compare_faces(
                    search_embedding,
                    stored_embedding,
                )

                if not comparison.get("success"):
                    continue

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
            key=lambda match: match["similarity"],
            reverse=True,
        )

        return jsonify({
            "message": "Search completed successfully",
            "matches": matches,
        }), 200

    except Exception:
        return jsonify({
            "error": "An unexpected error occurred during face search"
        }), 500

    finally:
        if os.path.isfile(photo_path):
            try:
                os.remove(photo_path)
            except OSError:
                pass