import { auth } from '../firebase';

/**
 * Fetch wrapper that attaches Firebase ID token to the Authorization header
 * for authenticated requests to /api/* endpoints.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = '';
  try {
    token = (await auth.currentUser?.getIdToken()) || '';
  } catch (err) {
    console.warn('Failed to retrieve auth token:', err);
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (import.meta.env.DEV) {
    if (import.meta.env.DEV && import.meta.env.VITE_ALLOW_TEST_AUTH === 'true') {
      headers.set('Authorization', 'Bearer dev-token');
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
