from db import get_db_connection


def setup_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS missing_persons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            photo_path TEXT,
            last_seen_location TEXT,
            last_seen_date TEXT,
            face_embedding TEXT
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()

    print("Database setup completed successfully.")
    print("Missing persons and users tables are ready.")


if __name__ == "__main__":
    setup_database()
