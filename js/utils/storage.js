class Storage {
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const data = JSON.parse(item);
      if (data.expiry && Date.now() > data.expiry) { this.removeItem(key); return null; }
      return data.value;
    } catch { return null; }
  }

  setItem(key, value, ttl = null) {
    try {
      const data = { value };
      if (ttl) data.expiry = Date.now() + ttl;
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  removeItem(key) { try { localStorage.removeItem(key); } catch {} }
  clear() { try { localStorage.clear(); } catch {} }
}

export const StorageUtil = new Storage();
export default StorageUtil;
