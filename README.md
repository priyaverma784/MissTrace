# MissTrace

**Find hope. Reconnect.**

MissTrace is a web app that helps reconnect missing people with their families. Users can search for a missing person by uploading a photograph, and the system compares the face with registered records using face recognition. People can also report a missing person or someone they have found.

> Face matches are suggestions, not confirmed identities. Every potential match must be independently verified.

## Features

- **Face search:** upload a photo and see potential matches with a similarity score (only matches of 50% or higher are shown).
- **Report a missing person:** submit a report with a photo, last-seen details and contact information.
- **Report a found person:** any registered user can report someone they have found.
- **Report from search results:** if nothing matches, or the match is wrong, users can report the person directly.
- **Authentication:** sign up and log in with JWT-based sessions.
- **Admin panel:** admins can view, edit, delete and review missing-person records.
- **Map directions:** results link to the last-known location.

## Tech Stack

| Part     | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend  | Python, Flask, Flask-JWT-Extended, Flask-CORS, Flask-Bcrypt |
| Database | SQLite                                                |
| Face AI  | InsightFace (`buffalo_l` model), OpenCV, NumPy        |

## Project Structure

```
missing-person-AI/
├── Backend/
│   ├── app.py                 # Flask app entry point
│   ├── database/              # Database connection and setup
│   ├── routes/                # auth, person, found-person and search APIs
│   ├── services/              # Face detection, embedding and matching
│   ├── instance/              # SQLite database (not committed)
│   ├── uploads/               # Uploaded photos (not committed)
│   └── requirements.txt
└── Frontend/
    └── src/
        ├── pages/             # Home, Search, Results, AddMissingPerson, ...
        ├── components/        # Navbar, ImageUploader, ProtectedRoute, ...
        └── layouts/
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer

### 1. Backend

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `Backend/`:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

If the database tables do not exist yet, create them:

```bash
python database/setup_db.py
```

Start the server:

```bash
python app.py
```

The API runs at `http://127.0.0.1:5000`. On the first run, InsightFace downloads its model files, so the start can take a while.

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Creating an Admin

New accounts are normal users. To make an account an admin, update its role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Admins see a **Missing Persons** link in the navbar, which opens `/missing-persons`.

## Main API Endpoints

| Method | Endpoint                      | Access        | Purpose                        |
| ------ | ----------------------------- | ------------- | ------------------------------ |
| POST   | `/api/auth/signup`            | Public        | Create an account              |
| POST   | `/api/auth/login`             | Public        | Log in and get a token         |
| GET    | `/api/auth/me`                | Logged in     | Current user                   |
| POST   | `/api/search`                 | Logged in     | Search by photo                |
| POST   | `/api/persons`                | Logged in     | Report a missing person        |
| POST   | `/api/found-persons`          | Logged in     | Report a found person          |
| GET    | `/api/persons`                | Admin         | List missing-person records    |
| GET    | `/api/persons/<id>/photo`     | Logged in     | View a record's photo          |
| PUT    | `/api/persons/<id>`           | Admin         | Update a record                |
| PATCH  | `/api/persons/<id>/review`    | Admin         | Approve or reject a report     |
| DELETE | `/api/persons/<id>`           | Admin         | Delete a record                |

## Privacy and Safety

- Never commit `.env`, the database, or the `uploads/` folder. They contain secrets and photographs of real people.
- Reporter contact details are private and must not appear in public search results.
- Reports should be reviewed before being relied on, and matches verified by authorized personnel.
- MissTrace supports community reporting. It does not replace official police procedures or identity verification.

## Disclaimer

This is a project for helping reconnect missing people. Similarity scores are estimates and are not proof of identity.
