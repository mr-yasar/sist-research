// ============================================================
// Audit Service — Append-only audit trail in localStorage
// Backend APIs and file storage will be integrated in the next phase.
// ============================================================

const STORE_KEY = 'sist_audit_trail';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
};

export const auditService = {
  /** POST /api/audit */
  log({ action, entityId, entityType, user, role, detail }) {
    const trail = load();
    trail.unshift({
      id:         `audit_${Date.now()}`,
      action,
      entityId,
      entityType,
      user,
      role,
      detail,
      timestamp:  new Date().toISOString(),
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(trail.slice(0, 200)));
  },

  /** GET /api/audit */
  getAll() { return load(); },

  getByEntity(entityId) {
    return load().filter((e) => e.entityId === entityId);
  },
};
