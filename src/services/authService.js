// ============================================================
// Auth Service — Mock JWT auth via localStorage
// Backend APIs and file storage will be integrated in the next phase.
// ============================================================

import { MOCK_USERS } from '../data/mockData';
import { uid } from '../utils/helpers';

const TOKEN_KEY   = 'sist_auth_token';
const USER_KEY    = 'sist_auth_user';
const DB_USERS_KEY = 'sist_db_users';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

// Initialize users DB
const loadUsers = () => {
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
};

const saveUsers = (users) => {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
};

/** Create a mock JWT-like token */
const createToken = (user) => {
  const payload = {
    sub:  user.id,
    role: user.role,
    name: user.name,
    iat:  Date.now(),
    exp:  Date.now() + SESSION_TTL,
  };
  return btoa(JSON.stringify(payload));
};

const decodeToken = (token) => {
  try { return JSON.parse(atob(token)); }
  catch { return null; }
};

export const authService = {
  /** POST /api/auth/login */
  login(email, password) {
    const users = loadUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) throw new Error('Invalid credentials');

    const token = createToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    return { token, user: safeUser };
  },

  /** POST /api/auth/register */
  register(userData) {
    const users = loadUsers();
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already in use');
    }

    const newUser = {
      id: `u_${uid()}`,
      ...userData,
      avatar: userData.name.substring(0, 2).toUpperCase(),
      avatarColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)]
    };

    users.push(newUser);
    saveUsers(users);

    const token = createToken(newUser);
    const safeUser = { ...newUser };
    delete safeUser.password;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    return { token, user: safeUser };
  },

  /** POST /api/auth/logout */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** GET /api/auth/me */
  getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded || decoded.exp < Date.now()) {
      this.logout();
      return null;
    }

    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  },
  
  // For Admin Dashboard User Management
  getAllUsers() {
    return loadUsers().map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });
  }
};
