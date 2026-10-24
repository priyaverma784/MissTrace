from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database.db import get_db_connection
from services.face_service import process_face
from werkzeug.utils import secure_filename
import os
import json
import uuid

person_routes = Blueprint("person_routes", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "missing_persons"
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ADD MISSING PERSON
@person_routes.route("/api/persons", methods=["POST"])
@jwt_required()
def add_missing_person():
    name = request.form.get("name")
    age = request.form.get("age")
    gender = request.form.get("gender")
    last_seen_location = request.form.get("last_seen_location")
    last_seen_date = request.form.get("last_seen_date")
    photo = request.files.get("photo")

    if not name or not name.strip():
        return jsonify({"error": "Name is required"}), 400

    if not photo or not photo.filename:
        return jsonify({"error": "Photo is required"}), 400

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
        face_result = process_face(photo_path)

        if not face_result["success"]:
            os.remove(photo_path)
            return jsonify({"error": face_result["message"]}), 400

        embedding = face_result["embedding"]

        connection = get_db_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO missing_persons
                (
                    name, age, gender, photo_path,
                    last_seen_location, last_seen_date, face_embedding
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    name.strip(),
                    age or None,
                    gender or None,
                    photo_path,
                    last_seen_location or None,
                    last_seen_date or None,
                    json.dumps(embedding),
                ),
            )

            connection.commit()
            person_id = cursor.lastrowid

        finally:
            connection.close()

        return jsonify({
            "message": "Missing person added successfully",
            "person_id": person_id,
            "face_detected": True,
            "face_count": face_result["face_count"],
        }), 201

    except Exception:
        if os.path.exists(photo_path):
            os.remove(photo_path)

        return jsonify({
            "error": "Unable to save the missing-person record"
        }), 500


# GET ALL MISSING PERSONS
@person_routes.route("/api/persons", methods=["GET"])
@jwt_required()
def get_missing_persons():
    connection = get_db_connection()

    try:
        persons = connection.execute(
            """
            SELECT
                id, name, age, gender, photo_path,
                last_seen_location, last_seen_date
            FROM missing_persons
            ORDER BY id DESC
            """
        ).fetchall()

        result = [
            {
                "id": person["id"],
                "name": person["name"],
                "age": person["age"],
                "gender": person["gender"],
                "photo_path": person["photo_path"],
                "last_seen_location": person["last_seen_location"],
                "last_seen_date": person["last_seen_date"],
            }
            for person in persons
        ]

        return jsonify(result), 200

    finally:
        connection.close()


# UPDATE MISSING PERSON
@person_routes.route("/api/persons/<int:person_id>", methods=["PUT"])
@jwt_required()
def update_missing_person(person_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    connection = get_db_connection()

    try:
        person = connection.execute(
            "SELECT * FROM missing_persons WHERE id = ?",
            (person_id,),
        ).fetchone()

        if person is None:
            return jsonify({"error": "Missing person not found"}), 404

        name = data.get("name", person["name"])

        if not isinstance(name, str) or not name.strip():
            return jsonify({"error": "A valid name is required"}), 400

        age = data.get("age", person["age"])

        if age is not None:
            try:
                age = int(age)
                if age < 0 or age > 150:
                    raise ValueError
            except (TypeError, ValueError):
                return jsonify({"error": "Age must be between 0 and 150"}), 400

        gender = data.get("gender", person["gender"])
        last_seen_location = data.get(
            "last_seen_location", person["last_seen_location"]
        )
        last_seen_date = data.get(
            "last_seen_date", person["last_seen_date"]
        )

        connection.execute(
            """
            UPDATE missing_persons
            SET name = ?, age = ?, gender = ?,
                last_seen_location = ?, last_seen_date = ?
            WHERE id = ?
            """,
            (
                name.strip(),
                age,
                gender,
                last_seen_location,
                last_seen_date,
                person_id,
            ),
        )

        connection.commit()

        return jsonify({
            "message": "Missing person updated successfully",
            "person_id": person_id,
        }), 200

    finally:
        connection.close()


# DELETE MISSING PERSON
@person_routes.route("/api/persons/<int:person_id>", methods=["DELETE"])
@jwt_required()
def delete_missing_person(person_id):
    connection = get_db_connection()

    try:
        person = connection.execute(
            "SELECT * FROM missing_persons WHERE id = ?",
            (person_id,),
        ).fetchone()

        if person is None:
            return jsonify({"error": "Missing person not found"}), 404

        connection.execute(
            "DELETE FROM missing_persons WHERE id = ?",
            (person_id,),
        )

        connection.commit()

    finally:
        connection.close()

    photo_path = person["photo_path"]

    if photo_path and os.path.exists(photo_path):
        try:
            os.remove(photo_path)
        except OSError:
            pass

    return jsonify({
        "message": "Missing person deleted successfully",
        "person_id": person_id,
    }), 200
