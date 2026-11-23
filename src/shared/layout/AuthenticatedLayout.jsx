import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useState } from "react";

export function AuthenticatedLayout() {
  const { session, logout, hasPermission } = useAuth();
  const [notice, setNotice] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const view = location.pathname === "/users" ? "users" : location.pathname === "/departments" ? "departments" : "overview";
  const user = session.user;

  async function signOut() {
    try { await logout(); navigate("/login", { replace: true }); }
    catch (cause) { setNotice(cause.message); }
  }

  return <div className="shell">
    <aside className="sidebar">
      <NavLink className="brand" to="/"><span className="brand-mark">E</span><span>ERP Platform</span></NavLink>
      <p className="nav-label">WORKSPACE</p>
      <NavLink end className={({ isActive }) => `nav-item ${isActive ? "selected" : ""}`} to="/">Overview</NavLink>
      {hasPermission("core.user.view") && <NavLink className={({ isActive }) => `nav-item ${isActive ? "selected" : ""}`} to="/users">Users</NavLink>}
      {hasPermission("core.department.view") && <NavLink className={({ isActive }) => `nav-item ${isActive ? "selected" : ""}`} to="/departments">Departments</NavLink>}
      <div className="sidebar-bottom"><span className="avatar">{user.full_name?.slice(0, 1).toUpperCase()}</span><div className="identity"><strong>{user.full_name}</strong><small>{user.email}</small></div><button className="icon-button" title="Sign out" onClick={signOut}>↗</button></div>
    </aside>
    <main className="content">
      <header className="content-head"><div><p className="eyebrow">ERP PLATFORM / {view.toUpperCase()}</p><h1>{view === "overview" ? "Overview" : view === "users" ? "Users" : "Departments"}</h1></div><span className="secure-badge"><i /> Session active</span></header>
      {notice && <p className="notice" role="status">{notice}<button className="dismiss" onClick={() => setNotice("")}>Dismiss</button></p>}
      <Outlet context={{ onNotice: setNotice }} />
    </main>
  </div>;
}
