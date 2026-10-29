from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
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
    "missing_persons",
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


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


def get_person_by_id(connection, person_id):
    return connection.execute(
        "SELECT * FROM missing_persons WHERE id = ?",
        (person_id,),
    ).fetchone()


def is_safe_photo_path(photo_path):
    if not photo_path:
        return False

    try:
        upload_root = os.path.realpath(UPLOAD_FOLDER)
        resolved_path = os.path.realpath(photo_path)

        return (
            os.path.commonpath([upload_root, resolved_path]) == upload_root
            and os.path.isfile(resolved_path)
        )
    except (OSError, ValueError):
        return False


# SUBMIT A MISSING-PERSON REPORT
# Any authenticated user can submit a report.
@person_routes.route("/api/persons", methods=["POST"])
@jwt_required()
def add_missing_person():
    name = request.form.get("name", "").strip()
    age = request.form.get("age") or None
    gender = request.form.get("gender") or None
    location = request.form.get("last_seen_location", "").strip() or None
    last_seen_date = request.form.get("last_seen_date") or None
    last_seen_time = request.form.get("last_seen_time") or None
    clothing_description = (
        request.form.get("clothing_description", "").strip() or None
    )
    identifying_marks = (
        request.form.get("identifying_marks", "").strip() or None
    )

    # Private reporter information
    reporter_name = request.form.get("reporter_name", "").strip() or None
    reporter_relationship = (
        request.form.get("reporter_relationship", "").strip() or None
    )
    reporter_contact = (
        request.form.get("reporter_contact", "").strip() or None
    )

    photo = request.files.get("photo")

    if not name:
        return jsonify({"error": "Missing person's name is required"}), 400

    if not photo or not photo.filename:
        return jsonify({"error": "A photograph is required"}), 400

    if not location:
        return jsonify({"error": "Last-seen location is required"}), 400

    if age is not None:
        try:
            age = int(age)
            if not 0 <= age <= 150:
                raise ValueError
        except (TypeError, ValueError):
            return jsonify({
                "error": "Age must be between 0 and 150"
            }), 400

    original_name = secure_filename(photo.filename)
    extension = os.path.splitext(original_name)[1].lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "error": "Upload a JPG, JPEG, PNG, or WEBP image"
        }), 400

    filename = f"{uuid.uuid4().hex}{extension}"
    photo_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        photo.save(photo_path)

        face_result = process_face(photo_path)

        if not face_result.get("success"):
            return jsonify({
                "error": face_result.get(
                    "message",
                    "Face processing failed",
                )
            }), 400

        connection = get_db_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO missing_persons (
                    name,
                    age,
                    gender,
                    photo_path,
                    last_seen_location,
                    last_seen_date,
                    face_embedding,
                    last_seen_time,
                    clothing_description,
                    identifying_marks,
                    reporter_name,
                    reporter_relationship,
                    reporter_contact,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    name,
                    age,
                    gender,
                    photo_path,
                    location,
                    last_seen_date,
                    json.dumps(face_result["embedding"]),
                    last_seen_time,
                    clothing_description,
                    identifying_marks,
                    reporter_name,
                    reporter_relationship,
                    reporter_contact,
                    "pending",
                ),
            )

            connection.commit()
            person_id = cursor.lastrowid

        finally:
            connection.close()

        return jsonify({
            "message": "Report submitted successfully and is awaiting review",
            "person_id": person_id,
            "status": "pending",
            "face_detected": True,
            "face_count": face_result.get("face_count", 1),
        }), 201

    except Exception:
        return jsonify({
            "error": "Unable to save the missing-person report"
        }), 500

    finally:
        # Remove the uploaded photo if the record was not saved.
        if os.path.isfile(photo_path):
            connection = get_db_connection()
            try:
                saved = connection.execute(
                    "SELECT id FROM missing_persons WHERE photo_path = ?",
                    (photo_path,),
                ).fetchone()
            finally:
                connection.close()

            if not saved:
                try:
                    os.remove(photo_path)
                except OSError:
                    pass


# VIEW ALL RECORDS - ADMIN ONLY
@person_routes.route("/api/persons", methods=["GET"])
@jwt_required()
def get_missing_persons():
    permission_error = admin_required()
    if permission_error:
        return permission_error

    connection = get_db_connection()

    try:
        persons = connection.execute(
            """
            SELECT
                id,
                name,
                age,
                gender,
                last_seen_location,
                last_seen_date,
                last_seen_time,
                clothing_description,
                identifying_marks,
                status
            FROM missing_persons
            ORDER BY id DESC
            """
        ).fetchall()

        return jsonify([dict(person) for person in persons]), 200

    finally:
        connection.close()


# PHOTO ACCESS - ANY LOGGED-IN USER (rejected reports are hidden)
# CHANGED: the admin check was removed so search results can show photos.
@person_routes.route(
    "/api/persons/<int:person_id>/photo",
    methods=["GET"],
)
@jwt_required()
def get_person_photo(person_id):
    connection = get_db_connection()

    try:
        person = get_person_by_id(connection, person_id)

        if person is None or person["status"] == "rejected":
            return jsonify({"error": "Missing person not found"}), 404

        photo_path = person["photo_path"]

    finally:
        connection.close()

    if not is_safe_photo_path(photo_path):
        return jsonify({"error": "Photo not found"}), 404

    return send_file(photo_path, conditional=True)


# REVIEW REPORT - ADMIN ONLY
@person_routes.route(
    "/api/persons/<int:person_id>/review",
    methods=["PATCH"],
)
@jwt_required()
def review_missing_person(person_id):
    permission_error = admin_required()
    if permission_error:
        return permission_error

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in ("approved", "rejected"):
        return jsonify({
            "error": "Status must be approved or rejected"
        }), 400

    connection = get_db_connection()

    try:
        person = get_person_by_id(connection, person_id)

        if person is None:
            return jsonify({"error": "Missing person not found"}), 404

        connection.execute(
            "UPDATE missing_persons SET status = ? WHERE id = ?",
            (status, person_id),
        )
        connection.commit()

        return jsonify({
            "message": f"Report {status} successfully",
            "person_id": person_id,
            "status": status,
        }), 200

    finally:
        connection.close()


# UPDATE RECORD - ADMIN ONLY
@person_routes.route(
    "/api/persons/<int:person_id>",
    methods=["PUT"],
)
@jwt_required()
def update_missing_person(person_id):
    permission_error = admin_required()
    if permission_error:
        return permission_error

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "error": "A JSON request body is required"
        }), 400

    allowed_fields = {
        "name",
        "age",
        "gender",
        "last_seen_location",
        "last_seen_date",
        "last_seen_time",
        "clothing_description",
        "identifying_marks",
    }

    updates = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    if "name" in updates and (
        not isinstance(updates["name"], str)
        or not updates["name"].strip()
    ):
        return jsonify({"error": "A valid name is required"}), 400

    if "age" in updates:
        age = updates["age"]
        if age not in (None, ""):
            try:
                age = int(age)
                if not 0 <= age <= 150:
                    raise ValueError
                updates["age"] = age
            except (TypeError, ValueError):
                return jsonify({
                    "error": "Age must be between 0 and 150"
                }), 400
        else:
            updates["age"] = None

    if "name" in updates:
        updates["name"] = updates["name"].strip()

    connection = get_db_connection()

    try:
        person = get_person_by_id(connection, person_id)

        if person is None:
            return jsonify({"error": "Missing person not found"}), 404

        set_clause = ", ".join(
            f"{field} = ?" for field in updates
        )
        values = list(updates.values()) + [person_id]

        connection.execute(
            f"UPDATE missing_persons SET {set_clause} WHERE id = ?",
            values,
        )
        connection.commit()

        return jsonify({
            "message": "Missing-person record updated successfully",
            "person_id": person_id,
        }), 200

    finally:
        connection.close()


# DELETE RECORD - ADMIN ONLY
@person_routes.route(
    "/api/persons/<int:person_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_missing_person(person_id):
    permission_error = admin_required()
    if permission_error:
        return permission_error

    connection = get_db_connection()

    try:
        person = get_person_by_id(connection, person_id)

        if person is None:
            return jsonify({"error": "Missing person not found"}), 404

        photo_path = person["photo_path"]

        connection.execute(
            "DELETE FROM missing_persons WHERE id = ?",
            (person_id,),
        )
        connection.commit()

    finally:
        connection.close()

    if is_safe_photo_path(photo_path):
        try:
            os.remove(photo_path)
        except OSError:
            pass

    return jsonify({
        "message": "Missing-person record deleted successfully",
        "person_id": person_id,
    }), 200