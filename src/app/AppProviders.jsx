import { AuthProvider } from "../shared/auth/AuthProvider.jsx";

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
