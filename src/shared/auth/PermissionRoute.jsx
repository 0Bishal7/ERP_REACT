import { Navigate } from "react-router";
import { useAuth } from "./AuthProvider.jsx";

export function PermissionRoute({ permission, children }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : <Navigate to="/" replace />;
}
