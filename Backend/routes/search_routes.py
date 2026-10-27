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
    "search_images",
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@search_routes.route("/api/search", methods=["POST"])
@jwt_required()
def search_missing_person():
    photo = request.files.get("photo")

    name = request.form.get("name", "").strip()
    age = request.form.get("age", "").strip()
    gender = request.form.get("gender", "").strip()
    location = request.form.get("last_seen_location", "").strip()
    last_seen_date = request.form.get("last_seen_date", "").strip()

    has_photo = bool(photo and photo.filename)

    # Require at least one search criterion.
    if not any([has_photo, name, age, gender, location, last_seen_date]):
        return jsonify({
            "error": "Provide a photo or at least one search detail"
        }), 400

    # Validate age when supplied.
    if age:
        try:
            age_value = int(age)
            if age_value < 0 or age_value > 130:
                raise ValueError
        except ValueError:
            return jsonify({
                "error": "Age must be a number between 0 and 130"
            }), 400

    # Validate the uploaded photo when supplied.
    photo_path = None
    search_embedding = None

    if has_photo:
        filename = secure_filename(photo.filename)
        extension = os.path.splitext(filename)[1].lower()

        if not filename or extension not in ALLOWED_EXTENSIONS:
            return jsonify({
                "error": "Upload a JPG, JPEG, PNG, or WEBP image"
            }), 400

        unique_filename = f"{uuid.uuid4().hex}{extension}"
        photo_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    try:
        # Generate a face embedding only when a photo is supplied.
        if has_photo:
            photo.save(photo_path)

            embedding_result = get_face_embedding(photo_path)

            if not embedding_result.get("success"):
                return jsonify({
                    "error": embedding_result.get(
                        "message",
                        "Could not process the uploaded face",
                    )
                }), 400

            search_embedding = embedding_result["embedding"]

        # Build the database query using the supplied details.
        conditions = []
        parameters = []

        if name:
            conditions.append("LOWER(name) LIKE LOWER(?)")
            parameters.append(f"%{name}%")

        if age:
            conditions.append("age = ?")
            parameters.append(int(age))

        if gender:
            conditions.append("LOWER(gender) = LOWER(?)")
            parameters.append(gender)

        if location:
            conditions.append(
                "LOWER(last_seen_location) LIKE LOWER(?)"
            )
            parameters.append(f"%{location}%")

        if last_seen_date:
            conditions.append("last_seen_date = ?")
            parameters.append(last_seen_date)

        query = """
            SELECT
                id,
                name,
                age,
                gender,
                last_seen_location,
                last_seen_date,
                face_embedding
            FROM missing_persons
        """

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        connection = get_db_connection()

        try:
            persons = connection.execute(
                query,
                parameters,
            ).fetchall()
        finally:
            connection.close()

        matches = []

        for person in persons:
            similarity = None
            potential_match = None

            # If a photo was supplied, require a successful face
            # comparison for the person to appear in the results.
            if has_photo:
                if not person["face_embedding"]:
                    continue

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

                    similarity = comparison["similarity"]
                    potential_match = comparison["potential_match"]

                except (ValueError, TypeError, KeyError):
                    continue

            matches.append({
                "id": person["id"],
                "name": person["name"],
                "age": person["age"],
                "gender": person["gender"],
                "last_seen_location": person["last_seen_location"],
                "last_seen_date": person["last_seen_date"],
                "similarity": similarity,
                "potential_match": potential_match,
            })

        # Rank results by face similarity when a photo was supplied.
        if has_photo:
            matches.sort(
                key=lambda match: (
                    match["similarity"]
                    if match["similarity"] is not None
                    else -1
                ),
                reverse=True,
            )

        return jsonify({
            "message": "Search completed successfully",
            "matches": matches,
            "total_matches": len(matches),
            "search_type": (
                "photo_and_details"
                if has_photo and any([
                    name, age, gender, location, last_seen_date
                ])
                else "photo"
                if has_photo
                else "details"
            ),
        }), 200

    except Exception:
        return jsonify({
            "error": "An unexpected error occurred during search"
        }), 500

    finally:
        if photo_path and os.path.isfile(photo_path):
            try:
                os.remove(photo_path)
            except OSError:
                pass
