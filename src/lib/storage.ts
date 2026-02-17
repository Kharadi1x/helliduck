// Simple in-memory storage for shareable results (MVP)
// Replace with Vercel KV or database for production

const store = new Map<string, { type: string; data: unknown; createdAt: number }>();

const MAX_ENTRIES = 10000;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function saveResult(id: string, type: string, data: unknown): void {
  // Evict expired entries periodically
  if (store.size > MAX_ENTRIES) {
    const now = Date.now();
    for (const [key, val] of store) {
      if (now - val.createdAt > TTL_MS) {
        store.delete(key);
      }
    }
  }

  store.set(id, { type, data, createdAt: Date.now() });
}

export function getResult(id: string): { type: string; data: unknown } | null {
  const entry = store.get(id);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(id);
    return null;
  }

  return { type: entry.type, data: entry.data };
}
