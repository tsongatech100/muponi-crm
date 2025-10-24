const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', { method: 'POST' }),

  getCurrentUser: () =>
    fetchAPI('/auth/me'),
};

export const contactsAPI = {
  getAll: () => fetchAPI('/contacts'),
  getById: (id: string) => fetchAPI(`/contacts/${id}`),
  create: (data: any) => fetchAPI('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/contacts/${id}`, { method: 'DELETE' }),
};

export const opportunitiesAPI = {
  getAll: () => fetchAPI('/opportunities'),
  getById: (id: string) => fetchAPI(`/opportunities/${id}`),
  create: (data: any) => fetchAPI('/opportunities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/opportunities/${id}`, { method: 'DELETE' }),
};

export const activitiesAPI = {
  getAll: () => fetchAPI('/activities'),
  getById: (id: string) => fetchAPI(`/activities/${id}`),
  create: (data: any) => fetchAPI('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/activities/${id}`, { method: 'DELETE' }),
};

export const ncrAPI = {
  getAll: () => fetchAPI('/ncr'),
  getById: (id: string) => fetchAPI(`/ncr/${id}`),
  create: (data: any) => fetchAPI('/ncr', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/ncr/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  verify: (id: string) => fetchAPI(`/ncr/${id}/verify`, { method: 'POST' }),
};

export const documentsAPI = {
  getAll: () => fetchAPI('/documents'),
  getById: (id: string) => fetchAPI(`/documents/${id}`),
  create: (data: any) => fetchAPI('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  approve: (id: string) => fetchAPI(`/documents/${id}/approve`, { method: 'POST' }),
};

export const suppliersAPI = {
  getAll: () => fetchAPI('/suppliers'),
  getById: (id: string) => fetchAPI(`/suppliers/${id}`),
  create: (data: any) => fetchAPI('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  evaluate: (id: string, score: number) => fetchAPI(`/suppliers/${id}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ score }),
  }),
};

export const consentAPI = {
  getByContact: (contactId: string) => fetchAPI(`/consent/contact/${contactId}`),
  create: (data: any) => fetchAPI('/consent', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  withdraw: (contactId: string, purpose: string) => fetchAPI('/consent/withdraw', {
    method: 'POST',
    body: JSON.stringify({ contactId, purpose }),
  }),
};

export const dsrAPI = {
  getAll: () => fetchAPI('/dsr'),
  getById: (id: string) => fetchAPI(`/dsr/${id}`),
  create: (data: any) => fetchAPI('/dsr', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  complete: (id: string) => fetchAPI(`/dsr/${id}/complete`, { method: 'POST' }),
};
