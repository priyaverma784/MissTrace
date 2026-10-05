from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from services.face_service import process_face

import os
import json


person_routes = Blueprint("person_routes", __name__)


UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads",
    "missing_persons"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@person_routes.route("/api/persons", methods=["POST"])
def add_missing_person():

    name = request.form.get("name")
    age = request.form.get("age")
    gender = request.form.get("gender")
    last_seen_location = request.form.get("last_seen_location")
    last_seen_date = request.form.get("last_seen_date")

    photo = request.files.get("photo")

    if not name:
        return jsonify({
            "error": "Name is required"
        }), 400

    if not photo:
        return jsonify({
            "error": "Photo is required"
        }), 400

    # Create a unique filename
    filename = photo.filename

    photo_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    photo.save(photo_path)

    # Generate face embedding
    face_result = process_face(photo_path)

    if not face_result["success"]:
        os.remove(photo_path)

        return jsonify({
            "error": face_result["message"]
        }), 400

    embedding = face_result["embedding"]

    # Store person information and embedding
    connection = get_db_connection()

    cursor = connection.execute("""
        INSERT INTO missing_persons
        (
            name,
            age,
            gender,
            photo_path,
            last_seen_location,
            last_seen_date,
            face_embedding
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        age,
        gender,
        photo_path,
        last_seen_location,
        last_seen_date,
        json.dumps(embedding)
    ))

    connection.commit()

    person_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Missing person added successfully",
        "person_id": person_id,
        "face_detected": True,
        "face_count": face_result["face_count"]
    }), 201