from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from database.db import get_db_connection

auth_routes = Blueprint("auth_routes", __name__)
bcrypt = Bcrypt()


# ENSURE ROLE COLUMN EXISTS
def ensure_role_column():
    connection = get_db_connection()

    try:
        columns = connection.execute(
            "PRAGMA table_info(users)"
        ).fetchall()

        if not any(column["name"] == "role" for column in columns):
            connection.execute("""
                ALTER TABLE users
                ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
            """)
            connection.commit()
    finally:
        connection.close()


ensure_role_column()


# SIGNUP API
@auth_routes.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not isinstance(name, str) or not isinstance(email, str):
        return jsonify({"error": "Invalid name or email"}), 400

    if not isinstance(password, str):
        return jsonify({"error": "Invalid password"}), 400

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email, and password are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must be at least 8 characters"
        }), 400

    connection = get_db_connection()

    try:
        existing_user = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if existing_user:
            return jsonify({
                "error": "Email is already registered"
            }), 409

        password_hash = bcrypt.generate_password_hash(
            password
        ).decode("utf-8")

        cursor = connection.execute("""
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        """, (name, email, password_hash))

        connection.commit()
        user_id = cursor.lastrowid

    finally:
        connection.close()

    return jsonify({
        "message": "Account created successfully",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "user"
        }
    }), 201


# LOGIN API
@auth_routes.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid email or password"}), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    connection = get_db_connection()

    try:
        user = connection.execute("""
            SELECT id, name, email, password_hash, role
            FROM users
            WHERE email = ?
        """, (email,)).fetchone()
    finally:
        connection.close()

    if not user or not bcrypt.check_password_hash(
        user["password_hash"], password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    token = create_access_token(identity=str(user["id"]))

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


# CURRENT USER API
@auth_routes.route("/api/auth/me", methods=["GET"])
@jwt_required()
def current_user():
    user_id = get_jwt_identity()

    connection = get_db_connection()

    try:
        user = connection.execute("""
            SELECT id, name, email, role
            FROM users
            WHERE id = ?
        """, (user_id,)).fetchone()
    finally:
        connection.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200