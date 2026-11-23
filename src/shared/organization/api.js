import { request } from "../api/client.js";

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
