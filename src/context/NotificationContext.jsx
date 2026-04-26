import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);

  const refresh = useCallback(() => {
    if (!user) { setNotifications([]); setUnread(0); return; }
    const n = notificationService.getForUser(user.id);
    setNotifications(n);
    setUnread(notificationService.unreadCount(user.id));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll every 15s for new notifications
  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const markRead = (id) => {
    notificationService.markRead(id);
    refresh();
  };
  const markAllRead = () => {
    if (user) { notificationService.markAllRead(user.id); refresh(); }
  };
  const clear = () => {
    if (user) { notificationService.clearAll(user.id); refresh(); }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unread, refresh, markRead, markAllRead, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
