import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { useResource } from "../../shared/hooks/useResource.js";
import { listOrganizations } from "../../shared/organization/api.js";
import { createRole, listPermissions, listRoles } from "./api.js";

export function RolesPage() {
  const { session, hasPermission } = useAuth();
  const { onNotice } = useOutletContext();
  const { data: roles, loading, error, refresh } = useResource(listRoles, [session]);
  const [permissions, setPermissions] = useState([]); const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState(""); const [organizationId, setOrganizationId] = useState("");
  const [selected, setSelected] = useState([]); const [busy, setBusy] = useState(false);
  const canManage = hasPermission("core.role.manage"); const platformAdmin = session.user.user_type === "admin";
  useEffect(() => { listPermissions().then(setPermissions).catch((e) => onNotice(e.message)); if (platformAdmin) listOrganizations().then(setOrganizations).catch((e) => onNotice(e.message)); }, [onNotice, platformAdmin]);
  async function create(event) {
    event.preventDefault(); setBusy(true);
    try { await createRole(session.csrf_token, { name, organization_id: organizationId || null, permission_codes: selected }); setName(""); setSelected([]); await refresh(); }
    catch (cause) { onNotice(cause.message); } finally { setBusy(false); }
  }
  const groups = Object.groupBy ? Object.groupBy(permissions, (item) => item.module) : permissions.reduce((acc, item) => ((acc[item.module] ||= []).push(item), acc), {});
  return <section className="panel"><div className="panel-head"><div><h2>Roles and access</h2><p>Define permission bundles for people in this organization.</p></div><span className="count-pill">{roles.length} roles</span></div>
    {canManage && <form className="create-user" onSubmit={create}><label>Role name<input required minLength="2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Organization Admin" /></label>
      {platformAdmin && <label>Organization<select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}><option value="">Platform wide</option>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>}
      <fieldset className="permission-list"><legend>Permissions</legend>{Object.entries(groups).map(([module, items]) => <details key={module}><summary>{module.toUpperCase()}</summary>{items.map((permission) => <label className="permission-choice" key={permission.code}><input type="checkbox" checked={selected.includes(permission.code)} onChange={(e) => setSelected(e.target.checked ? [...selected, permission.code] : selected.filter((code) => code !== permission.code))} />{permission.description}</label>)}</details>)}</fieldset>
      <button className="primary" disabled={busy}>{busy ? "Saving…" : "Create role"}</button></form>}
    {error && <p className="notice error" role="alert">{error}</p>}{loading ? <p className="empty">Loading roles…</p> : <div className="table-wrap"><table><thead><tr><th>Role</th><th>Organization</th><th>Permissions</th></tr></thead><tbody>{roles.map((role) => <tr key={role.id}><td><strong>{role.name}</strong>{role.is_system && <small> System</small>}</td><td>{role.organization_id ? organizations.find((org) => org.id === role.organization_id)?.name || "Organization" : "Platform"}</td><td>{role.permissions.length}</td></tr>)}{!roles.length && <tr><td colSpan="3" className="empty">No roles found.</td></tr>}</tbody></table></div>}</section>;
}
