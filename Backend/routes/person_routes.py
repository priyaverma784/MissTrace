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

# get all the missing person details 

@person_routes.route("/api/persons", methods=["GET"])
def get_missing_persons():

    connection = get_db_connection()

    persons = connection.execute("""
        SELECT
            id,
            name,
            age,
            gender,
            photo_path,
            last_seen_location,
            last_seen_date
        FROM missing_persons
    """).fetchall()

    connection.close()

    result = []

    for person in persons:
        result.append({
            "id": person["id"],
            "name": person["name"],
            "age": person["age"],
            "gender": person["gender"],
            "photo_path": person["photo_path"],
            "last_seen_location": person["last_seen_location"],
            "last_seen_date": person["last_seen_date"]
        })

    return jsonify(result), 200

# update the missing person details

@person_routes.route("/api/persons/<int:person_id>", methods=["PUT"])
def update_missing_person(person_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    connection = get_db_connection()

    person = connection.execute("""
        SELECT *
        FROM missing_persons
        WHERE id = ?
    """, (person_id,)).fetchone()

    if person is None:
        connection.close()

        return jsonify({
            "error": "Missing person not found"
        }), 404

    name = data.get("name", person["name"])
    age = data.get("age", person["age"])
    gender = data.get("gender", person["gender"])
    last_seen_location = data.get(
        "last_seen_location",
        person["last_seen_location"]
    )
    last_seen_date = data.get(
        "last_seen_date",
        person["last_seen_date"]
    )

    connection.execute("""
        UPDATE missing_persons
        SET
            name = ?,
            age = ?,
            gender = ?,
            last_seen_location = ?,
            last_seen_date = ?
        WHERE id = ?
    """, (
        name,
        age,
        gender,
        last_seen_location,
        last_seen_date,
        person_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Missing person updated successfully",
        "person_id": person_id
    }), 200

# Delete a missing person by ID

@person_routes.route("/api/persons/<int:person_id>", methods=["DELETE"])
def delete_missing_person(person_id):

    connection = get_db_connection()

    person = connection.execute("""
        SELECT *
        FROM missing_persons
        WHERE id = ?
    """, (person_id,)).fetchone()

    if person is None:
        connection.close()

        return jsonify({
            "error": "Missing person not found"
        }), 404

    # Delete database record
    connection.execute("""
        DELETE FROM missing_persons
        WHERE id = ?
    """, (person_id,))

    connection.commit()
    connection.close()

    # Delete uploaded photo
    photo_path = person["photo_path"]

    if photo_path and os.path.exists(photo_path):
        os.remove(photo_path)

    return jsonify({
        "message": "Missing person deleted successfully",
        "person_id": person_id
    }), 200