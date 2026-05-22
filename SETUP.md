# EduLearn — Login Branch (Auth Only)

Authentication module only. Dashboard UIs live on other branches (e.g. `Teacher-Dashboard`).

## Post-login redirect paths

Configured in `frontend/src/config/roleRedirects.js`:

| Role    | Redirect path          |
|---------|------------------------|
| student | `/student-dashboard`   |
| teacher | `/teacher-dashboard`   |
| admin   | `/admin-dashboard`     |

These routes are **not implemented** on this branch. After login/register, the app navigates there for merge compatibility; the dashboard branch will supply the pages.

## Setup

```bash
# Backend
cd backend && cp .env.example .env && npm install
npm run seed:admin && npm run dev

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Admin (seeded, no register page)

- Email: `admin@edtech.com`
- Password: `Admin@12345`
- Login at `/login` with role **Admin**

## API (auth only)

- `POST /api/auth/register/student`
- `POST /api/auth/register/teacher`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT)

## Merge notes

1. Keep `roleRedirects.js` paths aligned with dashboard branch routes.
2. Wrap dashboard routes with `ProtectedRoute` from `src/routes/ProtectedRoute.jsx`.
3. Re-use `AuthProvider`, `authApi`, and backend `authRoutes` as-is.
