import { request } from "../api/client.js";

export const getCurrentSession = () => request("/auth/me");

export const login = (email, password) => request("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

export const logout = (csrfToken) => request("/auth/logout", {
  method: "POST",
  csrfToken,
});

export const changePassword = (csrfToken, currentPassword, newPassword) => request("/auth/change-password", {
  method: "POST",
  csrfToken,
  body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
});
