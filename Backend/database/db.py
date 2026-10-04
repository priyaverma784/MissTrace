import sqlite3
import os


DATABASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "instance",
    "misstrace.db"
)


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection
