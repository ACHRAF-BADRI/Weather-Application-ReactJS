import { config } from './config.js';
import { TtlCache } from './cache.js';

const BASE_URL = 'https://api.weatherapi.com/v1';
const cache = new TtlCache();

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Calls a WeatherAPI endpoint with the server-side key. Results are cached per
// endpoint + params (the key itself is never part of the cache key or response).
export async function weatherApi(endpoint, params, ttlMs = 10 * 60 * 1000) {
  const url = new URL(`${BASE_URL}/${endpoint}.json`);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(name, String(value));
  }

  const cacheKey = `${endpoint}?${url.searchParams.toString().toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  url.searchParams.set('key', config.weatherApiKey);

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new HttpError(504, 'Weather provider unreachable');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // 1006 = "No location found". Auth/quota problems are our fault, not the user's.
    if (body?.error?.code === 1006) throw new HttpError(404, 'City not found');
    if (response.status === 400) throw new HttpError(400, body?.error?.message || 'Bad request');
    console.error(`[weatherapi] ${endpoint} failed: ${response.status}`, body?.error);
    throw new HttpError(502, 'Weather provider error');
  }

  cache.set(cacheKey, body, ttlMs);
  return body;
}
