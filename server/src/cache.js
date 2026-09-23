// Tiny in-memory TTL cache. Saves WeatherAPI quota and AI cost; resets on restart,
// which is fine because everything cached here can be refetched.
export class TtlCache {
  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    if (this.store.size >= this.maxEntries) {
      // Map keeps insertion order, so the first key is the oldest.
      this.store.delete(this.store.keys().next().value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}
