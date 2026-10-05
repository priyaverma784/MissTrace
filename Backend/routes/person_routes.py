from flask import Blueprint, request, jsonify
from database.db import get_db_connection


person_routes = Blueprint("person_routes", __name__)


@person_routes.route("/api/persons", methods=["POST"])
def add_missing_person():
    data = request.get_json()

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    last_seen_location = data.get("last_seen_location")
    last_seen_date = data.get("last_seen_date")

    if not name:
        return jsonify({
            "error": "Name is required"
        }), 400

    connection = get_db_connection()

    cursor = connection.execute("""
        INSERT INTO missing_persons
        (name, age, gender, last_seen_location, last_seen_date)
        VALUES (?, ?, ?, ?, ?)
    """, (
        name,
        age,
        gender,
        last_seen_location,
        last_seen_date
    ))

    connection.commit()

    person_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Missing person added successfully",
        "person_id": person_id
    }), 201