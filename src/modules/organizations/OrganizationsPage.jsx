import { useState } from "react";
import { useOutletContext } from "react-router";
import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { useResource } from "../../shared/hooks/useResource.js";
import { createOrganization, listOrganizations, updateOrganization } from "../../shared/organization/api.js";

export function OrganizationsPage() {
  const { session } = useAuth();
  const { onNotice } = useOutletContext();
  const { data: organizations, loading, error, refresh } = useResource(listOrganizations, [session]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event) {
    event.preventDefault(); setBusy(true);
    try {
      await createOrganization(session.csrf_token, { name, code: code.toLowerCase().replace(/[^a-z0-9_]/g, "_") });
      setName(""); setCode(""); await refresh();
    } catch (cause) { onNotice(cause.message); }
    finally { setBusy(false); }
  }

  async function toggle(org) {
    try { await updateOrganization(session.csrf_token, org.id, { is_active: !org.is_active }); await refresh(); }
    catch (cause) { onNotice(cause.message); }
  }

  return <section className="panel">
    <div className="panel-head"><div><h2>Organizations</h2><p>Create separate workspaces for each organization.</p></div><span className="count-pill">{organizations.length} total</span></div>
    <form className="inline-form" onSubmit={create}>
      <label>Organization name<input required minLength="2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northwind Trading" /></label>
      <label>Code<input required minLength="2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="northwind" /></label>
      <button className="primary" disabled={busy}>{busy ? "Creating…" : "Create organization"}</button>
    </form>
    {error && <p className="notice error" role="alert">{error}</p>}
    {loading ? <p className="empty">Loading organizations…</p> : <div className="table-wrap"><table><thead><tr><th>Organization</th><th>Code</th><th>Status</th><th /></tr></thead><tbody>
      {organizations.map((org) => <tr key={org.id}><td><strong>{org.name}</strong></td><td><code>{org.code}</code></td><td><span className={`status-pill ${org.is_active ? "active" : "inactive"}`}>{org.is_active ? "Active" : "Inactive"}</span></td><td><button className="text-button" onClick={() => toggle(org)}>{org.is_active ? "Deactivate" : "Activate"}</button></td></tr>)}
      {organizations.length === 0 && <tr><td colSpan="4" className="empty">No organizations yet.</td></tr>}
    </tbody></table></div>}
  </section>;
}
