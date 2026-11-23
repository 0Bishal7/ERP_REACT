import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

async function api(path, { csrfToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("Cannot reach the backend. Make sure it is running on port 8000.");
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.detail?.message || `Request failed (${response.status})`);
  return body;
}

function Login({ onLogin, error, busy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="auth-page">
      <section className="login-card">
        <div className="brand-mark">E</div>
        <p className="eyebrow">ERP WORKSPACE</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in with your company account.</p>
        <form onSubmit={(event) => { event.preventDefault(); onLogin(email, password); }}>
          <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="notice error" role="alert">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="api-hint">Connected to <code>{API_BASE}</code></p>
      </section>
    </main>
  );
}

function PasswordChange({ csrfToken, onChanged, onCancel }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api("/auth/change-password", { method: "POST", csrfToken, body: JSON.stringify({ current_password: current, new_password: next }) });
      onChanged();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="login-card"><p className="eyebrow">ACCOUNT SECURITY</p><h1>Change your password</h1><p className="muted">Your account requires a new password before you continue.</p><form onSubmit={submit}><label>Current password<input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label><label>New password<input type="password" autoComplete="new-password" minLength="10" required value={next} onChange={(e) => setNext(e.target.value)} /></label>{error && <p className="notice error">{error}</p>}<button className="primary full" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>{onCancel && <button className="quiet full" type="button" onClick={onCancel}>Cancel</button>}</form></section></main>;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("overview");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notice, setNotice] = useState("");
  const permissions = new Set(session?.permissions || []);
  const can = (code) => permissions.has(code);

  const loadSession = useCallback(async () => {
    try { const me = await api("/auth/me"); setSession(me); }
    catch { setSession(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadSession(); }, [loadSession]);

  const refreshDepartments = useCallback(async () => {
    if (!can("core.department.view")) return;
    try { setDepartments(await api("/departments")); } catch (e) { setNotice(e.message); }
  }, [session]);
  const refreshUsers = useCallback(async () => {
    if (!can("core.user.view")) return;
    try {
      const result = await api("/users?page=1&page_size=100");
      setUsers(result.items || []);
    } catch (e) { setNotice(e.message); }
  }, [session]);
  useEffect(() => { if (session) { refreshDepartments(); refreshUsers(); } }, [session, refreshDepartments, refreshUsers]);

  async function login(email, password) {
    setBusy(true); setError("");
    try { setSession(await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function logout() {
    try { await api("/auth/logout", { method: "POST", csrfToken: session?.csrf_token }); }
    catch (e) { setNotice(e.message); }
    finally { setSession(null); setUsers([]); setDepartments([]); }
  }
  if (loading) return <main className="loading">Connecting to ERP…</main>;
  if (!session) return <Login onLogin={login} error={error} busy={busy} />;
  if (session.user.must_change_password) return <PasswordChange csrfToken={session.csrf_token} onChanged={loadSession} />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setView("overview")}><span className="brand-mark">E</span><span>ERP Platform</span></a>
        <p className="nav-label">WORKSPACE</p>
        <button className={`nav-item ${view === "overview" ? "selected" : ""}`} onClick={() => setView("overview")}>Overview</button>
        {can("core.user.view") && <button className={`nav-item ${view === "users" ? "selected" : ""}`} onClick={() => setView("users")}>Users <span>{users.length}</span></button>}
        {can("core.department.view") && <button className={`nav-item ${view === "departments" ? "selected" : ""}`} onClick={() => setView("departments")}>Departments <span>{departments.length}</span></button>}
        <div className="sidebar-bottom"><span className="avatar">{session.user.full_name?.slice(0, 1).toUpperCase()}</span><div className="identity"><strong>{session.user.full_name}</strong><small>{session.user.email}</small></div><button className="icon-button" title="Sign out" onClick={logout}>↗</button></div>
      </aside>
      <main className="content">
        <header className="content-head"><div><p className="eyebrow">ERP PLATFORM / {view.toUpperCase()}</p><h1>{view === "overview" ? "Overview" : view === "users" ? "Users" : "Departments"}</h1></div><span className="secure-badge"><i /> Session active</span></header>
        {notice && <p className="notice" role="status">{notice}<button className="dismiss" onClick={() => setNotice("")}>Dismiss</button></p>}
        {view === "overview" && <>
          <section className="welcome-banner"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>Hello, {session.user.full_name.split(" ")[0]}</h2><p>Your account is connected to the ERP backend.</p></div><div className="banner-symbol">E</div></section>
          <section className="stats-grid"><article className="stat-card"><span>Account type</span><strong>{session.user.user_type}</strong><small>{session.user.is_active ? "Active account" : "Inactive account"}</small></article><article className="stat-card"><span>Departments</span><strong>{can("core.department.view") ? departments.length : "—"}</strong><small>{can("core.department.view") ? "Available to your account" : "No department access"}</small></article><article className="stat-card"><span>Permissions</span><strong>{session.permissions.length}</strong><small>Granted to your account</small></article></section>
          <section className="panel"><div className="panel-head"><div><h2>Account details</h2><p>Identity and access for this session</p></div></div><div className="detail-grid"><div><span>Name</span><strong>{session.user.full_name}</strong></div><div><span>Email</span><strong>{session.user.email}</strong></div><div><span>Department</span><strong>{session.user.department?.name || "Not assigned"}</strong></div><div><span>Roles</span><strong>{session.user.roles?.map((role) => role.name).join(", ") || session.user.user_type}</strong></div></div></section>
        </>}
        {view === "departments" && <Departments departments={departments} canManage={can("core.department.manage")} csrfToken={session.csrf_token} onRefresh={refreshDepartments} onError={setNotice} />}
        {view === "users" && <Users users={users} departments={departments} roles={roles} setRoles={setRoles} canCreate={can("core.user.create")} canReset={can("core.user.reset_password")} csrfToken={session.csrf_token} onRefresh={refreshUsers} onError={setNotice} />}
      </main>
    </div>
  );
}

function Departments({ departments, canManage, csrfToken, onRefresh, onError }) {
  const [name, setName] = useState(""); const [code, setCode] = useState(""); const [busy, setBusy] = useState(false);
  async function create(event) {
    event.preventDefault(); setBusy(true);
    try { await api("/departments", { method: "POST", csrfToken, body: JSON.stringify({ name, code: code.toLowerCase().replace(/[^a-z0-9_]/g, "_") }) }); setName(""); setCode(""); await onRefresh(); }
    catch (e) { onError(e.message); } finally { setBusy(false); }
  }
  async function toggle(dept) {
    try { await api(`/departments/${dept.id}`, { method: "PATCH", csrfToken, body: JSON.stringify({ is_active: !dept.is_active }) }); await onRefresh(); }
    catch (e) { onError(e.message); }
  }
  return <section className="panel"><div className="panel-head"><div><h2>Company departments</h2><p>Departments available to users and role assignments.</p></div><span className="count-pill">{departments.length} total</span></div>{canManage && <form className="inline-form" onSubmit={create}><label>Department name<input required minLength="2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer Support" /></label><label>Code<input required minLength="2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="customer_support" /></label><button className="primary" disabled={busy}>{busy ? "Adding…" : "Add department"}</button></form>}<div className="table-wrap"><table><thead><tr><th>Department</th><th>Code</th><th>Status</th>{canManage && <th />}</tr></thead><tbody>{departments.map((dept) => <tr key={dept.id}><td><strong>{dept.name}</strong></td><td><code>{dept.code}</code></td><td><span className={`status-pill ${dept.is_active ? "active" : "inactive"}`}>{dept.is_active ? "Active" : "Inactive"}</span></td>{canManage && <td><button className="text-button" onClick={() => toggle(dept)}>{dept.is_active ? "Deactivate" : "Activate"}</button></td>}</tr>)}{departments.length === 0 && <tr><td colSpan={canManage ? 4 : 3} className="empty">No departments found.</td></tr>}</tbody></table></div></section>;
}

function Users({ users, departments, roles, setRoles, canCreate, canReset, csrfToken, onRefresh, onError }) {
  const [showForm, setShowForm] = useState(false); const [busy, setBusy] = useState(false); const [query, setQuery] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", department_id: "", role_id: "" });
  useEffect(() => { if (canCreate && roles.length === 0) api("/roles").then(setRoles).catch((e) => onError(e.message)); }, [canCreate, roles.length, setRoles, onError]);
  async function create(event) {
    event.preventDefault(); setBusy(true);
    try { await api("/users", { method: "POST", csrfToken, body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password, department_id: form.department_id || null, role_ids: form.role_id ? [form.role_id] : [], must_change_password: true }) }); setForm({ full_name: "", email: "", password: "", department_id: "", role_id: "" }); setShowForm(false); await onRefresh(); }
    catch (e) { onError(e.message); } finally { setBusy(false); }
  }
  async function reset(user) {
    const password = window.prompt(`Set a temporary password for ${user.full_name} (at least 10 characters):`);
    if (!password) return;
    try { await api(`/users/${user.id}/reset-password`, { method: "POST", csrfToken, body: JSON.stringify({ new_password: password, must_change_password: true }) }); onError(`Temporary password set for ${user.email}.`); }
    catch (e) { onError(e.message); }
  }
  const filtered = users.filter((user) => `${user.full_name} ${user.email} ${user.department?.name || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel"><div className="panel-head"><div><h2>People</h2><p>Manage user accounts and department access.</p></div><div className="head-actions"><input className="search" aria-label="Search users" placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />{canCreate && <button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "Add user"}</button>}</div></div>{showForm && <form className="create-user" onSubmit={create}><label>Full name<input required minLength="2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input required minLength="10" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label>Department<select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="">No department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label>Role<select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}><option value="">No role</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label><button className="primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button></form>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th>{canReset && <th />}</tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="person-cell"><span className="avatar small">{user.full_name.slice(0, 1).toUpperCase()}</span><strong>{user.full_name}</strong></div></td><td>{user.email}</td><td>{user.department?.name || "—"}</td><td>{user.roles?.map((r) => r.name).join(", ") || user.user_type}</td><td><span className={`status-pill ${user.is_active ? "active" : "inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>{canReset && <td><button className="text-button" onClick={() => reset(user)}>Reset password</button></td>}</tr>)}{filtered.length === 0 && <tr><td colSpan={canReset ? 6 : 5} className="empty">No matching users.</td></tr>}</tbody></table></div></section>;
}

export default App;
