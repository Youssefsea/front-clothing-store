export function safeReadString(storage: Storage | undefined, key: string, fallback = "") {
  if (!storage) return fallback;
  try { return storage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function safeWriteString(storage: Storage | undefined, key: string, value: string) {
  if (!storage) return;
  try { storage.setItem(key, value); } catch {}
}
export function safeReadJson<T>(storage: Storage | undefined, key: string, fallback: T): T {
  if (!storage) return fallback;
  try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function safeRemove(storage: Storage | undefined, key: string) {
  if (!storage) return;
  try { storage.removeItem(key); } catch {}
}
