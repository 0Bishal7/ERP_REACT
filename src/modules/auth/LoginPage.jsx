import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { apiBase, request } from "../../shared/api/client.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await login(email, password); navigate("/", { replace: true }); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="login-card">
    <div className="brand-mark">E</div><p className="eyebrow">ERP WORKSPACE</p><h1>Welcome back</h1>
    <p className="muted">Sign in with your company account.</p>
    <form onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="primary full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form><p className="api-hint">Connected to <code>{apiBase}</code></p>
  </section></main>;
}

export function ChangePasswordPage() {
  const { session, restoreSession } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(""); const [next, setNext] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await request("/auth/change-password", { method: "POST", csrfToken: session.csrf_token, body: JSON.stringify({ current_password: current, new_password: next }) });
      await restoreSession();
      navigate("/", { replace: true });
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="login-card">
    <p className="eyebrow">ACCOUNT SECURITY</p><h1>Change your password</h1>
    <p className="muted">Your account requires a new password before you continue.</p>
    <form onSubmit={submit}>
      <label>Current password<input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
      <label>New password<input type="password" autoComplete="new-password" minLength="10" required value={next} onChange={(e) => setNext(e.target.value)} /></label>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="primary full" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  </section></main>;
}
