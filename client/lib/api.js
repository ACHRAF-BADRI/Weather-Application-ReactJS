// All back-end calls go through here. The browser only knows the back-end URL;
// the WeatherAPI key stays on the server.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function get(path, params, { signal } = {}) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => value != null && url.searchParams.set(key, value));

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'network');
  }
  const body = await response.json().catch((error) => {
    // A request cancelled while its body is being read must stay cancelled, not become `{}`.
    if (error.name === 'AbortError') throw error;
    return {};
  });
  if (!response.ok) throw new ApiError(response.status, body.error || response.statusText);
  return body;
}

export const api = {
  health: (options) => get('/api/health', null, options),
  weather: (q, lang, options) => get('/api/weather', { q, lang }, options),
  search: (q, options) => get('/api/search', { q }, options),
  predict: (q, lang, options) => get('/api/predict', { q, lang }, options),
};
