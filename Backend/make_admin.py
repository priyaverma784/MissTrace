import sqlite3

ADMIN_EMAIL = "priyaverma90177@gmail.com"

connection = sqlite3.connect("instance/misstrace.db")

cursor = connection.execute(
    "UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER(?)",
    (ADMIN_EMAIL,),
)
connection.commit()
print("Users updated:", cursor.rowcount)

print("\nUsers now:")
for row in connection.execute("SELECT id, name, email, role FROM users"):
    print(row)

connection.close()