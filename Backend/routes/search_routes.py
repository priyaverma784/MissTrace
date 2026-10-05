from flask import Blueprint, jsonify
from database.db import get_db_connection


search_routes = Blueprint("search_routes", __name__)


@search_routes.route("/api/persons", methods=["GET"])
def get_missing_persons():
    connection = get_db_connection()

    persons = connection.execute("""
        SELECT *
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
            "last_seen_date": person["last_seen_date"],
            "face_embedding": person["face_embedding"]
        })

    return jsonify(result), 200