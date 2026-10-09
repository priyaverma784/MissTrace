from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta
import os

from routes.person_routes import person_routes
from routes.search_routes import search_routes
from routes.auth_routes import auth_routes


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)


app.register_blueprint(person_routes)
app.register_blueprint(search_routes)
app.register_blueprint(auth_routes)


@app.route("/")
def home():
    return {"message": "MissTrace Backend is running"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
