import { Navigate, Outlet, Route, Routes } from "react-router";
import { useAuth } from "../shared/auth/AuthProvider.jsx";
import { AuthenticatedLayout } from "../shared/layout/AuthenticatedLayout.jsx";
import { ChangePasswordPage, LoginPage } from "../modules/auth/LoginPage.jsx";
import { dashboardRoute } from "../modules/dashboard/routes.jsx";
import { departmentsRoute } from "../modules/departments/routes.jsx";
import { usersRoute } from "../modules/users/routes.jsx";
import { organizationsRoute } from "../modules/organizations/routes.jsx";
import { rolesRoute } from "../modules/roles/routes.jsx";

function PublicOnly() {
  const { session, loading } = useAuth();
  if (loading) return <main className="loading">Connecting to ERP…</main>;
  return session ? <Navigate to="/" replace /> : <LoginPage />;
}

function RequireAuth() {
  const { session, loading } = useAuth();
  if (loading) return <main className="loading">Connecting to ERP…</main>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequirePasswordChanged() {
  const { session } = useAuth();
  return session.user.must_change_password ? <Navigate to="/change-password" replace /> : <Outlet />;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<PublicOnly />} />
    <Route element={<RequireAuth />}>
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route element={<RequirePasswordChanged />}>
        <Route element={<AuthenticatedLayout />}>
          {dashboardRoute}
          {usersRoute}
          {departmentsRoute}
          {organizationsRoute}
          {rolesRoute}
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
