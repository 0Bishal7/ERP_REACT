import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { createDepartment, listDepartments, updateDepartment } from "./api.js";
import { listOrganizations } from "../../shared/organization/api.js";
import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { useResource } from "../../shared/hooks/useResource.js";

export function DepartmentsPage() {
  const { session, hasPermission } = useAuth();
  const { onNotice } = useOutletContext();
  const { data: departments, loading, error, refresh } = useResource(listDepartments, [session]);
  const [organizations, setOrganizations] = useState([]); const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState(""); const [code, setCode] = useState(""); const [busy, setBusy] = useState(false);
  const canManage = hasPermission("core.department.manage");
  useEffect(() => { if (session.user.user_type === "admin") listOrganizations().then(setOrganizations).catch((e) => onNotice(e.message)); }, [session, onNotice]);

  async function create(event) {
    event.preventDefault(); setBusy(true);
    try {
      await createDepartment(session.csrf_token, { name, code: code.toLowerCase().replace(/[^a-z0-9_]/g, "_"), organization_id: organizationId || null });
      setName(""); setCode(""); await refresh();
    } catch (cause) { onNotice(cause.message); }
    finally { setBusy(false); }
  }
  async function toggle(department) {
    try { await updateDepartment(session.csrf_token, department.id, { is_active: !department.is_active }); await refresh(); }
    catch (cause) { onNotice(cause.message); }
  }

  return <section className="panel">
    <div className="panel-head"><div><h2>Company departments</h2><p>Departments available to users and role assignments.</p></div><span className="count-pill">{departments.length} total</span></div>
    {canManage && <form className="inline-form" onSubmit={create}>{session.user.user_type === "admin" && <label>Organization<select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}><option value="">Platform</option>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>}<label>Department name<input required minLength="2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer Support" /></label><label>Code<input required minLength="2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="customer_support" /></label><button className="primary" disabled={busy}>{busy ? "Adding…" : "Add department"}</button></form>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {loading ? <p className="empty">Loading departments…</p> : <div className="table-wrap"><table><thead><tr><th>Department</th><th>Code</th><th>Status</th>{canManage && <th />}</tr></thead><tbody>{departments.map((department) => <tr key={department.id}><td><strong>{department.name}</strong></td><td><code>{department.code}</code></td><td><span className={`status-pill ${department.is_active ? "active" : "inactive"}`}>{department.is_active ? "Active" : "Inactive"}</span></td>{canManage && <td><button className="text-button" onClick={() => toggle(department)}>{department.is_active ? "Deactivate" : "Activate"}</button></td>}</tr>)}{departments.length === 0 && <tr><td colSpan={canManage ? 4 : 3} className="empty">No departments found.</td></tr>}</tbody></table></div>}
  </section>;
}
