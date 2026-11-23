# ERP React

React frontend for the ERP API. The frontend uses cookie-based sessions and reads the signed-in user's permissions to show the users and departments screens.

## Frontend structure

`src/app` owns the route tree and top-level providers. `src/shared` owns the API client, session context, permission guard, shared layout, and reusable hooks. Each business area lives under `src/modules/<module>` and owns its pages, workflows, and lazy-loaded route entry. Add a module route in that module's `routes.jsx`, register it in `src/app/App.jsx`, and add its permission-checked navigation entry in `src/shared/layout/AuthenticatedLayout.jsx`.

## Run locally

1. Start the backend on `http://127.0.0.1:8000` and complete its database migration and seed setup. The backend README contains those commands.
2. Install frontend dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

3. Open the Vite URL (normally `http://localhost:5173`) and sign in with a seeded account.

Vite proxies `/api/*` and `/health` to `http://127.0.0.1:8000`, so browser requests and the `httpOnly` session cookie use the same origin. Set `VITE_BACKEND_URL` in a local `.env` file if the backend listens elsewhere. For a direct API connection, set `VITE_API_BASE_URL` to the API base URL; the backend CORS origins must then include the frontend origin.

## Connected endpoints

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, and `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password` for first login password changes
- `GET/POST /api/v1/departments` and `PATCH /api/v1/departments/{id}`
- `GET/POST /api/v1/users` and `POST /api/v1/users/{id}/reset-password`
- `GET /api/v1/roles` for user creation role assignments

Write requests include the CSRF token returned by login or `/auth/me`. The backend remains authoritative for permissions and account access.
