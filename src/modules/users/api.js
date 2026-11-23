import { request } from "../../shared/api/client.js";

export async function listUsers({ page = 1, pageSize = 100 } = {}) {
  const result = await request(`/users?page=${page}&page_size=${pageSize}`);
  return result.items || [];
}

export const listRoles = () => request("/roles");

export const createUser = (csrfToken, user) => request("/users", {
  method: "POST",
  csrfToken,
  body: JSON.stringify(user),
});

export const resetUserPassword = (csrfToken, userId, newPassword) => request(`/users/${userId}/reset-password`, {
  method: "POST",
  csrfToken,
  body: JSON.stringify({ new_password: newPassword, must_change_password: true }),
});
