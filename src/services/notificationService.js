// ============================================================
// Notification Service — In-app notifications via localStorage
// Backend APIs and file storage will be integrated in the next phase.
// ============================================================

const STORE_KEY = 'sist_notifications';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
};
const save = (n) => localStorage.setItem(STORE_KEY, JSON.stringify(n));

export const notificationService = {
  /** GET /api/notifications/:userId */
  getForUser(userId) {
    return load().filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  },

  unreadCount(userId) {
    return load().filter((n) => n.userId === userId && !n.read).length;
  },

  /** POST /api/notifications */
  push({ userId, title, message, type = 'info' }) {
    const all = load();
    all.unshift({
      id:        `n_${Date.now()}`,
      userId,
      title,
      message,
      type,
      read:      false,
      createdAt: new Date().toISOString(),
    });
    save(all.slice(0, 50)); // Keep last 50
  },

  /** PATCH /api/notifications/:id/read */
  markRead(id) {
    const all = load().map((n) => (n.id === id ? { ...n, read: true } : n));
    save(all);
  },

  markAllRead(userId) {
    const all = load().map((n) =>
      n.userId === userId ? { ...n, read: true } : n,
    );
    save(all);
  },

  clearAll(userId) {
    save(load().filter((n) => n.userId !== userId));
  },
};
