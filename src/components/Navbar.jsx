import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const ROLE_LABEL = {
  student: '🎓 Student',
  faculty: '👨‍🏫 Faculty',
  hod:     '🏛️ Head of Department',
  admin:   '⚙️ Administrator',
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="h-16 glass border-b border-white/10 flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-all"
        aria-label="Open menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <h1 className="text-white font-bold text-sm sm:text-base hidden sm:block">
            Faculty Activity & Research Tracker
          </h1>
          <span className="hidden md:block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">
            Sathyabama Institute
          </span>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        <span className="hidden sm:block px-3 py-1.5 rounded-xl bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold">
          {ROLE_LABEL[user?.role] || user?.role}
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Toggle dark mode"
        >
          {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/20 cursor-pointer hover:border-primary-400 transition-all"
          style={{ background: user?.avatarColor || '#6366f1' }}
          title={user?.name}
        >
          {user?.avatar}
        </div>
      </div>
    </header>
  );
}
