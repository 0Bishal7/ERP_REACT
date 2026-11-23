import { useAuth } from "../../shared/auth/AuthProvider.jsx";
import { request } from "../../shared/api/client.js";
import { useResource } from "../../shared/hooks/useResource.js";

export function DashboardPage() {
  const { session, hasPermission } = useAuth();
  const departmentsResource = useResource(
    () => hasPermission("core.department.view") ? request("/departments") : Promise.resolve([]),
    [session, hasPermission],
  );
  const departments = departmentsResource.data;
  return <>
    <section className="welcome-banner"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>Hello, {session.user.full_name.split(" ")[0]}</h2><p>Your account is connected to the ERP backend.</p></div><div className="banner-symbol">E</div></section>
    <section className="stats-grid"><article className="stat-card"><span>Account type</span><strong>{session.user.user_type}</strong><small>Active account</small></article><article className="stat-card"><span>Departments</span><strong>{hasPermission("core.department.view") ? departments.length : "—"}</strong><small>{hasPermission("core.department.view") ? "Available to your account" : "No department access"}</small></article><article className="stat-card"><span>Permissions</span><strong>{session.permissions.length}</strong><small>Granted to your account</small></article></section>
    <section className="panel"><div className="panel-head"><div><h2>Account details</h2><p>Identity and access for this session</p></div></div><div className="detail-grid"><div><span>Name</span><strong>{session.user.full_name}</strong></div><div><span>Email</span><strong>{session.user.email}</strong></div><div><span>Department</span><strong>{session.user.department?.name || "Not assigned"}</strong></div><div><span>Roles</span><strong>{session.user.roles?.map((role) => role.name).join(", ") || session.user.user_type}</strong></div></div></section>
  </>;
}
