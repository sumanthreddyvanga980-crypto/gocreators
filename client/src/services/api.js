const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('gocreators_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('gocreators_token', token);
  } else {
    localStorage.removeItem('gocreators_token');
  }
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Network request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (formData) => request('/auth/register', { method: 'POST', body: formData }),
  sendOtp: (email) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  getSmtpStatus: () => request('/auth/smtp-status'),
  updateSmtpConfig: (config) => request('/auth/smtp-config', { method: 'POST', body: JSON.stringify(config) }),
  getMe: () => request('/auth/me'),

  // Crew & Discovery
  getCrew: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/crew${query ? `?${query}` : ''}`);
  },
  getCategoryCounts: () => request('/crew/categories/counts'),
  getCrewMember: (id) => request(`/crew/${id}`),
  reportUser: (id, payload) => request(`/crew/${id}/report`, { method: 'POST', body: JSON.stringify(payload) }),
  uploadPortfolio: (formData) => request('/crew/portfolio/upload', { method: 'POST', body: formData }),

  // Connections & Privacy
  getConnections: () => request('/connections'),
  sendConnectionRequest: (recipientId, note) => request('/connections/request', {
    method: 'POST',
    body: JSON.stringify({ recipientId, note })
  }),
  respondToConnection: (connectionId, action) => request(`/connections/${connectionId}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ action })
  }),
  removeConnection: (connectionId) => request(`/connections/${connectionId}`, { method: 'DELETE' }),

  // Projects & Feedback
  getProjects: () => request('/projects'),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}/update`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProjectBudget: (id, data) => request(`/projects/${id}/budget`, { method: 'PUT', body: JSON.stringify(data) }),
  addProjectCrew: (id, userId, role) => request(`/projects/${id}/crew`, { method: 'POST', body: JSON.stringify({ userId, role }) }),
  removeProjectCrew: (id, userId) => request(`/projects/${id}/crew/${userId}`, { method: 'DELETE' }),
  getProjectMessages: (id) => request(`/projects/${id}/messages`),
  sendProjectMessage: (id, text) => request(`/projects/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  submitFeedback: (feedbackId, comments) => request(`/projects/feedback/${feedbackId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ comments })
  }),

  // AI Assistant
  askAI: (message) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // Direct Chats
  getRecentChats: () => request('/messages/recent'),
  getConversation: (userId) => request(`/messages/conversation/${userId}`),
  sendMessage: (recipientId, text) => request('/messages/send', {
    method: 'POST',
    body: JSON.stringify({ recipientId, text })
  }),

  // Moderation
  getModerationStats: () => request('/moderation/stats'),
  triggerTestBan: (userId) => request(`/moderation/test-ban/${userId}`, { method: 'POST' }),
  resetUserReports: (userId) => request(`/moderation/reset/${userId}`, { method: 'POST' })
};

