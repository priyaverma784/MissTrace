from datetime import date
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from database.db import get_db_connection
from services.face_service import process_face
import os
import json
import uuid
import traceback


found_person_routes = Blueprint(
    "found_person_routes",
    __name__,
)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "found_persons",
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024

REQUIRED_COLUMNS = {
    "name": "TEXT",
    "age": "INTEGER",
    "gender": "TEXT",
    "photo_path": "TEXT",
    "face_embedding": "TEXT",
    "found_location": "TEXT",
    "found_date": "TEXT",
    "found_time": "TEXT",
    "clothing_description": "TEXT",
    "identifying_marks": "TEXT",
    "reporter_name": "TEXT",
    "reporter_contact": "TEXT",
    "authority_name": "TEXT",
    "case_reference": "TEXT",
    "additional_notes": "TEXT",
    "status": "TEXT DEFAULT 'pending'",
}


def ensure_table(connection):
    """Create the table if missing and add any missing columns."""
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS found_person_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    existing = {
        row[1]
        for row in connection.execute(
            "PRAGMA table_info(found_person_reports)"
        ).fetchall()
    }

    for column, definition in REQUIRED_COLUMNS.items():
        if column not in existing:
            connection.execute(
                f"ALTER TABLE found_person_reports "
                f"ADD COLUMN {column} {definition}"
            )

    connection.commit()


def to_json_safe(value):
    """json.dumps fallback for numpy arrays and numpy scalars."""
    if hasattr(value, "tolist"):
        return value.tolist()
    if hasattr(value, "item"):
        return value.item()
    return float(value)


@found_person_routes.route(
    "/api/found-persons",
    methods=["POST"],
)
@jwt_required()
def add_found_person():
    name = request.form.get("name", "").strip()
    age = request.form.get("age") or None
    gender = request.form.get("gender", "").strip() or None

    found_location = request.form.get(
        "found_location", ""
    ).strip()

    found_date = request.form.get(
        "found_date", ""
    ).strip()

    found_time = request.form.get(
        "found_time", ""
    ).strip() or None

    clothing_description = request.form.get(
        "clothing_description", ""
    ).strip() or None

    identifying_marks = request.form.get(
        "identifying_marks", ""
    ).strip() or None

    reporter_name = request.form.get(
        "reporter_name", ""
    ).strip() or None

    reporter_contact = request.form.get(
        "reporter_contact", ""
    ).strip() or None

    # FIX: the database column authority_name is NOT NULL,
    # so use an empty string instead of None when it is blank.
    authority_name = request.form.get(
        "authority_name", ""
    ).strip()

    case_reference = request.form.get(
        "case_reference", ""
    ).strip() or None

    additional_notes = request.form.get(
        "additional_notes", ""
    ).strip() or None

    photo = request.files.get("photo")

    # Validate required fields.
    if not name:
        return jsonify({
            "error": 'Person name is required. Use "Unknown" if not known.'
        }), 400

    if not found_location:
        return jsonify({
            "error": "Found location is required"
        }), 400

    if not found_date:
        return jsonify({
            "error": "Found date is required"
        }), 400

    if not photo or not photo.filename:
        return jsonify({
            "error": "A photograph is required"
        }), 400

    # Validate the found date.
    try:
        parsed_date = date.fromisoformat(found_date)

        if parsed_date > date.today():
            return jsonify({
                "error": "Found date cannot be in the future"
            }), 400

    except ValueError:
        return jsonify({
            "error": "Found date must be in YYYY-MM-DD format"
        }), 400

    # Validate age.
    if age is not None:
        try:
            age = int(age)

            if not 0 <= age <= 150:
                raise ValueError

        except (TypeError, ValueError):
            return jsonify({
                "error": "Age must be between 0 and 150"
            }), 400

    # Validate the uploaded photograph.
    original_name = secure_filename(photo.filename)
    extension = os.path.splitext(original_name)[1].lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "error": "Upload a JPG, JPEG, PNG, or WEBP image"
        }), 400

    # Check file size.
    photo.stream.seek(0, os.SEEK_END)
    file_size = photo.stream.tell()
    photo.stream.seek(0)

    if file_size == 0:
        return jsonify({
            "error": "The uploaded photograph is empty"
        }), 400

    if file_size > MAX_FILE_SIZE:
        return jsonify({
            "error": "Photograph must be smaller than 5 MB"
        }), 400

    filename = f"{uuid.uuid4().hex}{extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, filename)

    report_saved = False

    try:
        # Save the uploaded photograph.
        photo.save(photo_path)

        # Generate the face embedding.
        face_result = process_face(photo_path)

        if not face_result or not face_result.get("success"):
            return jsonify({
                "error": (face_result or {}).get(
                    "message",
                    "Face processing failed",
                )
            }), 400

        embedding = face_result.get("embedding")

        if embedding is None:
            return jsonify({
                "error": "Face embedding could not be generated"
            }), 400

        embedding_json = json.dumps(embedding, default=to_json_safe)

        # Save the found-person report.
        connection = get_db_connection()

        try:
            ensure_table(connection)

            cursor = connection.execute(
                """
                INSERT INTO found_person_reports (
                    name,
                    age,
                    gender,
                    photo_path,
                    face_embedding,
                    found_location,
                    found_date,
                    found_time,
                    clothing_description,
                    identifying_marks,
                    reporter_name,
                    reporter_contact,
                    authority_name,
                    case_reference,
                    additional_notes,
                    status
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?
                )
                """,
                (
                    name,
                    age,
                    gender,
                    photo_path,
                    embedding_json,
                    found_location,
                    found_date,
                    found_time,
                    clothing_description,
                    identifying_marks,
                    reporter_name,
                    reporter_contact,
                    authority_name,
                    case_reference,
                    additional_notes,
                    "pending",
                ),
            )

            connection.commit()
            report_id = cursor.lastrowid
            report_saved = True

        finally:
            connection.close()

        return jsonify({
            "message": (
                "Found-person report submitted successfully "
                "and is awaiting review"
            ),
            "report_id": report_id,
            "status": "pending",
            "face_detected": True,
            "face_count": face_result.get("face_count", 1),
        }), 201

    except Exception as error:
        traceback.print_exc()
        body = {"error": "Unable to save the found-person report"}

        if current_app.debug:
            body["details"] = f"{type(error).__name__}: {error}"

        return jsonify(body), 500

    finally:
        # Remove the photo if the report was not saved.
        if not report_saved and os.path.isfile(photo_path):
            try:
                os.remove(photo_path)
            except OSError:
                pass