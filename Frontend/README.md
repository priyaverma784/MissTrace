# MissTrace Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the MissTrace missing-person identification platform.

## Run

```bash
npm install
npm run dev
```

Set the backend URL in `.env` (default shown):

```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

The Flask backend must allow CORS from `http://localhost:5173` (e.g. `flask-cors`).

## Backend endpoints used

| Action | Request |
| --- | --- |
| Register person | `POST /api/persons` (multipart: name, age, gender, last_seen_location, last_seen_date, photo) |
| List persons | `GET /api/persons` |
| Update person | `PUT /api/persons/:id` (JSON) |
| Delete person | `DELETE /api/persons/:id` |
| AI search | `POST /api/search` (multipart: photo) |

## Structure

```
src/
├── api/         axios instance, typed endpoint functions, response normalizers
├── components/  reusable UI (Button, Input, Modal, ImageUploader, PersonCard, ...)
├── context/     toast, role (placeholder auth) and search state
├── hooks/       usePersons, useDeletePerson, useImageFile
├── layouts/     UserLayout, AdminLayout
├── pages/       landing, user/*, admin/*
├── routes/      RequireRole guard
├── types/       shared TypeScript types
└── utils/       formatting + local usage counters
```

## Notes

- If your backend uses different JSON field names, adjust only `src/api/normalizers.ts`.
- Person photos are loaded from `VITE_API_BASE_URL` + the path/URL the backend returns.
- Dashboard "Searches Performed" / "Potential Matches" are counted in the browser, because the backend has no stats endpoint.
- Authentication is a placeholder (`src/context/AuthContext.tsx`) ready to be replaced.
