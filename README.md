# ERP React

React frontend for the ERP API. The frontend uses cookie-based sessions and reads the signed-in user's permissions to show the users and departments screens.

## Frontend structure

`src/app` owns the route tree and top-level providers. `src/shared` owns the API client, session context, permission guard, shared layout, and reusable hooks. Each business area lives under `src/modules/<module>` and owns its pages, workflows, and lazy-loaded route entry. Add a module route in that module's `routes.jsx`, register it in `src/app/App.jsx`, and add its permission-checked navigation entry in `src/shared/layout/AuthenticatedLayout.jsx`.

## Run locally

1. Start the backend on `http://127.0.0.1:8000` and complete its database migration and seed setup. The backend README contains those commands.
2. Install frontend dependencies and start Vite:

   ```sh
   npm install
   npm run build
   npm run dev
   ```

3. .env file add VITE_BACKEND_URL=http://127.0.0.1:8000
