import { API_BASE } from '~/config/api';
const getToken = () => {
  if (window.location.pathname.startsWith('/store')) {
    return localStorage.getItem('vendor_token') || localStorage.getItem('token');
  }
  return localStorage.getItem('token') || localStorage.getItem('vendor_token');
};

export const apiClient = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      // No-op, authentication will be handled by the layouts
      return;
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    } else {
      throw new Error(`Server returned an unexpected response. Status: ${response.status}`);
    }
  }

  if (response.status === 204) {
    return;
  }

  return response.json();
};
