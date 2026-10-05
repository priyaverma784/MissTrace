from flask import Flask
from flask_cors import CORS

from routes.person_routes import person_routes
from routes.search_routes import search_routes

app = Flask(__name__)

CORS(app)
app.register_blueprint(person_routes)
app.register_blueprint(search_routes)

@app.route("/")
def home():
    return {
        "message": "MissTrace Backend is running"
    }


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
