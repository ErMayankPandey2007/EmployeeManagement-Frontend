const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("apex_token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const api = {
  // Auth
  login: (userId, password) => request("POST", "/auth/login", { userId, password }),
  getMe: () => request("GET", "/auth/me"),

  // Employees
  getEmployees: () => request("GET", "/employees"),
  createEmployee: (data) => request("POST", "/employees", data),
  deleteEmployee: (id) => request("DELETE", `/employees/${id}`),
  updateRating: (id, rating) => request("PATCH", `/employees/${id}/rating`, { rating }),

  // Tasks
  getTasks: () => request("GET", "/tasks"),
  createTask: (data) => request("POST", "/tasks", data),
  updateTask: (id, data) => request("PUT", `/tasks/${id}`, data),
  updateStatus: (id, status) => request("PATCH", `/tasks/${id}/status`, { status }),
  deleteTask: (id) => request("DELETE", `/tasks/${id}`),

  // Reports
  getReports: () => request("GET", "/reports"),
  createReport: (data) => request("POST", "/reports", data),
  reviewReport: (id, data) => request("PATCH", `/reports/${id}/review`, data),

  // Notifications
  getNotifications: () => request("GET", "/notifications"),
  markAllRead: () => request("PATCH", "/notifications/mark-all-read"),
};
