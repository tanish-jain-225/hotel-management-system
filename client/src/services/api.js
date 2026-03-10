import { helper } from "./helper";
const API_URL = helper.API_URL;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

// Menu API
export const menuApi = {
  getAll: () => request("/menu"),
  add: (item) => request("/menu", { method: "POST", body: JSON.stringify(item) }),
  checkExists: (name) => request("/menu/check", { method: "POST", body: JSON.stringify({ name }) }),
  delete: (id) => request(`/menu/${id}`, { method: "DELETE" }),
};

// Cart API
export const cartApi = {
  getItems: (sessionId) => request(`/cart?sessionId=${encodeURIComponent(sessionId)}`),
  addItem: (item) => request("/cart", { method: "POST", body: JSON.stringify(item) }),
  removeItem: (id, sessionId) =>
    request(`/cart/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ sessionId }),
    }),
  clear: (sessionId) =>
    request("/cart/clear", {
      method: "DELETE",
      body: JSON.stringify({ sessionId }),
    }),
};

// Order API
export const orderApi = {
  place: (orderData) => request("/orders", { method: "POST", body: JSON.stringify(orderData) }),
  getAll: (sessionId) => request(`/orders${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ""}`),
  complete: (id) => request(`/orders/${id}`, { method: "DELETE" }),
};

// Admin API
export const adminApi = {
  login: (credentials) => request("/admin/login", { method: "POST", body: JSON.stringify(credentials) }),
  updateCredentials: (data) => request("/admin/credentials", { method: "PUT", body: JSON.stringify(data) }),
};
