import { request } from "../../shared/api/client.js";
export const listRoles = () => request("/roles");
export const listPermissions = () => request("/permissions");
export const createRole = (csrfToken, role) => request("/roles", { method: "POST", csrfToken, body: JSON.stringify(role) });
