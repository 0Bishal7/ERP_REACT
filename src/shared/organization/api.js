import { request } from "../api/client.js";

export const listOrganizations = () => request("/organizations");

export const createOrganization = (csrfToken, organization) => request("/organizations", {
  method: "POST", csrfToken, body: JSON.stringify(organization),
});

export const updateOrganization = (csrfToken, organizationId, changes) => request(`/organizations/${organizationId}`, {
  method: "PATCH", csrfToken, body: JSON.stringify(changes),
});

// Departments are shared organization data used by account administration and modules.
export const listDepartments = () => request("/departments");

export const createDepartment = (csrfToken, department) => request("/departments", {
  method: "POST",
  csrfToken,
  body: JSON.stringify(department),
});

export const updateDepartment = (csrfToken, departmentId, changes) => request(`/departments/${departmentId}`, {
  method: "PATCH",
  csrfToken,
  body: JSON.stringify(changes),
});
