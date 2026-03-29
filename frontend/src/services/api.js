/**
 * API Client for AI Money Mentor Backend
 * Handles all HTTP requests with JWT auth and error handling.
 */

const API_BASE = '/api';

// ── Token Management ──
let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

export function getAuthToken() {
  return authToken;
}

// ── HTTP Client ──
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Auth API ──
export const authAPI = {
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getProfile: () => request('/auth/me'),

  updateProfile: (data) => request('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ── Analysis API ──
export const analysisAPI = {
  runFull: (overrides = {}) => request('/analysis/full', {
    method: 'POST',
    body: JSON.stringify(overrides),
  }),

  getCachedScore: (userId) => request(`/analysis/score/${userId}`),
};

// ── Portfolio API ──
export const portfolioAPI = {
  getAll: () => request('/portfolio/'),

  addFund: (fund) => request('/portfolio/', {
    method: 'POST',
    body: JSON.stringify(fund),
  }),

  addBulk: (funds) => request('/portfolio/bulk', {
    method: 'POST',
    body: JSON.stringify(funds),
  }),

  deleteFund: (fundId) => request(`/portfolio/${fundId}`, {
    method: 'DELETE',
  }),

  runXRay: () => request('/portfolio/xray', { method: 'POST' }),
};

// ── Tax API ──
export const taxAPI = {
  analyze: (data) => request('/tax/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getRegimeComparison: () => request('/tax/regime-comparison'),
};

// ── FIRE API ──
export const fireAPI = {
  simulate: (data) => request('/fire/simulate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  project: (data) => request('/fire/project', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ── Chat API ──
export const chatAPI = {
  send: (message, context = null) => request('/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  }),

  getHistory: () => request('/chat/history'),

  clearHistory: () => request('/chat/history', { method: 'DELETE' }),
};

// ── Documents API ──
export const documentsAPI = {
  upload: async (file, documentType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/documents/upload?document_type=${documentType}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail);
    }

    return response.json();
  },
};

// ── News API ──
export const newsAPI = {
  getAlerts: () => request('/news/alerts'),
  getMarket: () => request('/news/market'),
};

// ── CRUD UI APIs ──
export const transactionsAPI = {
  getAll: () => request('/transactions/'),
  create: (data) => request('/transactions/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

export const accountsAPI = {
  getAll: () => request('/accounts/'),
  create: (data) => request('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
};

export const goalsAPI = {
  getAll: () => request('/goals/'),
  create: (data) => request('/goals/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
};

export const debtsAPI = {
  getAll: () => request('/goals/debts'),
  create: (data) => request('/goals/debts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/goals/debts/${id}`, { method: 'DELETE' }),
};
