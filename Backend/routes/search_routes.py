from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database.db import get_db_connection
from services.face_embedding import get_face_embedding
from services.face_matching import compare_faces
from werkzeug.utils import secure_filename
import os
import json
import uuid
import traceback

search_routes = Blueprint("search_routes", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "search_images",
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Minimum similarity (in percent) for a record to be shown.
MIN_SIMILARITY = 50


def build_query(table, location_col, date_col, time_col, filters):
    """Build the SELECT for either missing_persons or found_person_reports."""
    conditions = ["status IN ('approved', 'pending')"]
    parameters = []

    if filters["name"]:
        conditions.append("LOWER(name) LIKE LOWER(?)")
        parameters.append(f"%{filters['name']}%")

    if filters["age"]:
        conditions.append("age = ?")
        parameters.append(int(filters["age"]))

    if filters["gender"]:
        conditions.append("LOWER(gender) = LOWER(?)")
        parameters.append(filters["gender"])

    if filters["location"]:
        conditions.append(f"LOWER({location_col}) LIKE LOWER(?)")
        parameters.append(f"%{filters['location']}%")

    if filters["last_seen_date"]:
        conditions.append(f"{date_col} = ?")
        parameters.append(filters["last_seen_date"])

    query = f"""
        SELECT
            id,
            name,
            age,
            gender,
            {location_col} AS location,
            {date_col} AS seen_date,
            {time_col} AS seen_time,
            clothing_description,
            identifying_marks,
            face_embedding
        FROM {table}
        WHERE {" AND ".join(conditions)}
    """

    return query, parameters


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

    if not any([has_photo, name, age, gender, location, last_seen_date]):
        return jsonify({
            "error": "Provide a photo or at least one search detail"
        }), 400

    if age:
        try:
            age_value = int(age)
            if age_value < 0 or age_value > 130:
                raise ValueError
        except ValueError:
            return jsonify({
                "error": "Age must be a number between 0 and 130"
            }), 400

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

        filters = {
            "name": name,
            "age": age,
            "gender": gender,
            "location": location,
            "last_seen_date": last_seen_date,
        }

        persons = []
        connection = get_db_connection()

        try:
            # Missing-person reports
            query, params = build_query(
                "missing_persons",
                "last_seen_location",
                "last_seen_date",
                "last_seen_time",
                filters,
            )
            persons.extend(connection.execute(query, params).fetchall())

            # Found-person reports
            query, params = build_query(
                "found_person_reports",
                "found_location",
                "found_date",
                "found_time",
                filters,
            )
            persons.extend(connection.execute(query, params).fetchall())

        finally:
            connection.close()

        print(f"[search] rows found in database: {len(persons)}")

        matches = []

        for person in persons:
            similarity = None
            potential_match = None

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

                    similarity = round(
                        max(0.0, comparison["similarity"]) * 100, 1
                    )
                    potential_match = comparison["potential_match"]

                    # Show only results with 50% similarity or higher.
                    if similarity < MIN_SIMILARITY:
                        continue

                except (ValueError, TypeError, KeyError):
                    continue

            matches.append({
                "id": person["id"],
                "name": person["name"],
                "age": person["age"],
                "gender": person["gender"],
                "last_seen_location": person["location"],
                "last_seen_date": person["seen_date"],
                "last_seen_time": person["seen_time"],
                "clothing_description": person["clothing_description"],
                "identifying_marks": person["identifying_marks"],
                "similarity": similarity,
                "potential_match": potential_match,
            })

        print(f"[search] matches returned: {len(matches)}")

        if has_photo:
            matches.sort(
                key=lambda match: (
                    match["similarity"]
                    if match["similarity"] is not None
                    else -1
                ),
                reverse=True,
            )

        search_type = (
            "photo_and_details"
            if has_photo and any([
                name, age, gender, location, last_seen_date
            ])
            else "photo"
            if has_photo
            else "details"
        )

        return jsonify({
            "message": "Search completed successfully",
            "matches": matches,
            "total_matches": len(matches),
            "search_type": search_type,
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({
            "error": "An unexpected error occurred during search"
        }), 500

    finally:
        if photo_path and os.path.isfile(photo_path):
            try:
                os.remove(photo_path)
            except OSError:
                pass