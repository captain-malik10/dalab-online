// Base path for all backend calls. The API is served from the same origin
// (Express in production, Vite's /api proxy in development).
export const API_BASE = '/api';

// Store (vendor) endpoints need the store login token; everything else uses the
// user account token. The server rejects the wrong kind, so pick by endpoint.
const VENDOR_ENDPOINT = /^\/vendors\/(me|products|orders|dashboard)(\/|\?|$)/;

export const getTokenForUrl = (url: string): string | null => {
  if (typeof window === 'undefined') return null;
  return VENDOR_ENDPOINT.test(url)
    ? localStorage.getItem('vendor_token')
    : localStorage.getItem('token');
};
