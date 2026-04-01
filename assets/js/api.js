const API_BASE = '/api';

const ACELERA_API = {
  getToken() { return localStorage.getItem('acelera_token'); },
  setToken(t) { localStorage.setItem('acelera_token', t); },
  clearToken() { localStorage.removeItem('acelera_token'); localStorage.removeItem('acelera_user'); },
  getUser() { try { return JSON.parse(localStorage.getItem('acelera_user')); } catch { return null; } },
  setUser(u) { localStorage.setItem('acelera_user', JSON.stringify(u)); },

  async request(path, options = {}) {
    const token = this.getToken();
    const res = await fetch(API_BASE + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (res.status === 401) { this.clearToken(); window.location.href = '/login.html'; return; }
    return res.json();
  },

  login: (email, password) => ACELERA_API.request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => ACELERA_API.request('/auth/logout', { method: 'POST' }),
  getDashboard: () => ACELERA_API.request('/dashboard'),
  getNotifications: () => ACELERA_API.request('/notifications'),
  markNotificationRead: (id) => ACELERA_API.request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => ACELERA_API.request('/notifications/read-all', { method: 'PUT' }),
  getFeedbacks: () => ACELERA_API.request('/feedbacks'),
  createFeedback: (data) => ACELERA_API.request('/feedbacks', { method: 'POST', body: data }),
  getOneonones: () => ACELERA_API.request('/oneonones'),
  createOneonone: (data) => ACELERA_API.request('/oneonones', { method: 'POST', body: data }),
  updateOneonone: (id, data) => ACELERA_API.request(`/oneonones/${id}`, { method: 'PUT', body: data }),
  getUsers: () => ACELERA_API.request('/users'),
  getReports: () => ACELERA_API.request('/reports'),
  generateReport: (type) => ACELERA_API.request('/reports/generate', { method: 'POST', body: { type } }),
  getHotspots: () => ACELERA_API.request('/hotspots'),
  getHotspot: (id) => ACELERA_API.request(`/hotspots/${id}`),
  deleteOneonone: (id) => ACELERA_API.request(`/oneonones/${id}`, { method: 'DELETE' }),
  deleteFeedback: (id) => ACELERA_API.request(`/feedbacks/${id}`, { method: 'DELETE' }),
  updateFeedback: (id, data) => ACELERA_API.request(`/feedbacks/${id}`, { method: 'PUT', body: data }),
  createReport: (data) => ACELERA_API.request('/reports', { method: 'POST', body: data }),
};
