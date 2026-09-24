// All back-end calls go through here. The browser only knows the back-end URL;
// the WeatherAPI key stays on the server.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { params, body, signal } = {}) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => value != null && url.searchParams.set(key, value));

  let response;
  try {
    response = await fetch(url, body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }
      : { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'network');
  }
  const data = await response.json().catch((error) => {
    // A request cancelled while its body is being read must stay cancelled, not become `{}`.
    if (error.name === 'AbortError') throw error;
    return {};
  });
  if (!response.ok) throw new ApiError(response.status, data.error || response.statusText);
  return data;
}

export const api = {
  health: (options) => request('/api/health', options),
  weather: (q, lang, options) => request('/api/weather', { params: { q, lang }, ...options }),
  search: (q, options) => request('/api/search', { params: { q }, ...options }),
  predict: (q, lang, options) => request('/api/predict', { params: { q, lang }, ...options }),
  contact: (message) => request('/api/contact', { body: message }),
};
