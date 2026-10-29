import sqlite3
import os


DATABASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "instance",
    "misstrace.db"
)


def get_db_connection():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        # Add report columns to the existing missing-person table.
        table = connection.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name = 'missing_persons'
            """
        ).fetchone()

        if table:
            existing_columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(missing_persons)"
                ).fetchall()
            }

            new_columns = {
                "last_seen_time": "TEXT",
                "clothing_description": "TEXT",
                "identifying_marks": "TEXT",
                "reporter_name": "TEXT",
                "reporter_relationship": "TEXT",
                "reporter_contact": "TEXT",
                "status": "TEXT NOT NULL DEFAULT 'approved'",
            }

            for column_name, column_definition in new_columns.items():
                if column_name not in existing_columns:
                    connection.execute(
                        f"""
                        ALTER TABLE missing_persons
                        ADD COLUMN {column_name} {column_definition}
                        """
                    )

        # Create a separate table for found-person reports.
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS found_person_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT NOT NULL,
                age INTEGER,
                gender TEXT,

                photo_path TEXT NOT NULL,
                face_embedding TEXT,

                found_location TEXT NOT NULL,
                found_date TEXT NOT NULL,
                found_time TEXT,

                clothing_description TEXT,
                identifying_marks TEXT,

                reporter_name TEXT,
                reporter_contact TEXT,

                authority_name TEXT NOT NULL,
                case_reference TEXT,
                additional_notes TEXT,

                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (
                        status IN (
                            'pending',
                            'approved',
                            'rejected',
                            'matched',
                            'resolved'
                        )
                    ),

                matched_missing_person_id INTEGER,

                reviewed_by TEXT,
                reviewed_at TEXT,

                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (matched_missing_person_id)
                    REFERENCES missing_persons(id)
                    ON DELETE SET NULL
            )
            """
        )

        # Add indexes to support report retrieval and review.
        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_found_person_reports_status
            ON found_person_reports(status)
            """
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_found_person_reports_created_at
            ON found_person_reports(created_at)
            """
        )

        connection.commit()

    except Exception:
        connection.rollback()
        connection.close()
        raise

    return connection