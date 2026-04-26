import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/helpers';

const TYPE_COLORS = {
  success: 'bg-green-500/20 border-green-500/30 text-green-300',
  error:   'bg-red-500/20 border-red-500/30 text-red-300',
  info:    'bg-blue-500/20 border-blue-500/30 text-blue-300',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unread, markRead, markAllRead, clear } = useNotifications();
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="notif-dot"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-80 glass-strong rounded-2xl shadow-glass overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FiBell className="w-4 h-4 text-primary-400" />
                <span className="text-white font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-500/30 text-primary-300 text-xs font-bold">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all" title="Mark all read">
                    <FiCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clear} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-all" title="Clear all">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FiBell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-all block ${!n.read ? 'bg-primary-500/5' : ''}`}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 px-1.5 py-0.5 rounded text-xs border ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                        {n.type?.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${n.read ? 'text-white/60' : 'text-white'}`}>{n.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1" />}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
