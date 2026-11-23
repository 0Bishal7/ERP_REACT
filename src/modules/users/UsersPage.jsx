import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { createUser, listRoles, listUsers, resetUserPassword } from "./api.js";
import { listDepartments } from "../../shared/organization/api.js";
import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { useResource } from "../../shared/hooks/useResource.js";

export function UsersPage() {
  const { session, hasPermission } = useAuth();
  const { onNotice } = useOutletContext();
  const { data: users, loading, error, refresh } = useResource(() => listUsers(), [session]);
  const { data: departments } = useResource(() => hasPermission("core.department.view") ? listDepartments() : Promise.resolve([]), [session]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false); const [busy, setBusy] = useState(false); const [query, setQuery] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", department_id: "", role_id: "" });
  const canCreate = hasPermission("core.user.create");
  const canReset = hasPermission("core.user.reset_password");

  useEffect(() => {
    if (!canCreate) return;
    listRoles().then(setRoles).catch((cause) => onNotice(cause.message));
  }, [canCreate, onNotice]);

  async function create(event) {
    event.preventDefault(); setBusy(true);
    try {
      await createUser(session.csrf_token, { full_name: form.full_name, email: form.email, password: form.password, department_id: form.department_id || null, role_ids: form.role_id ? [form.role_id] : [], must_change_password: true });
      setForm({ full_name: "", email: "", password: "", department_id: "", role_id: "" }); setShowForm(false); await refresh();
    } catch (cause) { onNotice(cause.message); }
    finally { setBusy(false); }
  }

  async function resetPassword(user) {
    const password = window.prompt(`Set a temporary password for ${user.full_name} (at least 10 characters):`);
    if (!password) return;
    try {
      await resetUserPassword(session.csrf_token, user.id, password);
      onNotice(`Temporary password set for ${user.email}.`);
    } catch (cause) { onNotice(cause.message); }
  }

  const filtered = users.filter((user) => `${user.full_name} ${user.email} ${user.department?.name || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel">
    <div className="panel-head"><div><h2>People</h2><p>Manage user accounts and department access.</p></div><div className="head-actions"><input className="search" aria-label="Search users" placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />{canCreate && <button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "Add user"}</button>}</div></div>
    {showForm && <form className="create-user" onSubmit={create}><label>Full name<input required minLength="2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input required minLength="10" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label>Department<select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="">No department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label>Role<select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}><option value="">No role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><button className="primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button></form>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {loading ? <p className="empty">Loading users…</p> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th>{canReset && <th />}</tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="person-cell"><span className="avatar small">{user.full_name.slice(0, 1).toUpperCase()}</span><strong>{user.full_name}</strong></div></td><td>{user.email}</td><td>{user.department?.name || "—"}</td><td>{user.roles?.map((role) => role.name).join(", ") || user.user_type}</td><td><span className={`status-pill ${user.is_active ? "active" : "inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>{canReset && <td><button className="text-button" onClick={() => resetPassword(user)}>Reset password</button></td>}</tr>)}{filtered.length === 0 && <tr><td colSpan={canReset ? 6 : 5} className="empty">No matching users.</td></tr>}</tbody></table></div>}
  </section>;
}
