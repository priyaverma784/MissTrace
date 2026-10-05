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

    connection.commit()
    connection.close()

    print("Database setup completed successfully.")


if __name__ == "__main__":
    setup_database()