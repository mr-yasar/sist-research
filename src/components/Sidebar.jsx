import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUpload, FiFileText, FiUsers,
  FiBarChart2, FiSettings, FiLogOut, FiX,
  FiShield, FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  student: [
    { to: '/student',      icon: FiHome,        label: 'Dashboard' },
    { to: '/student/upload', icon: FiUpload,     label: 'New Submission' },
    { to: '/student/submissions', icon: FiFileText, label: 'My Submissions' },
  ],
  faculty: [
    { to: '/faculty',      icon: FiHome,        label: 'Dashboard' },
    { to: '/faculty/queue', icon: FiFileText,   label: 'Review Queue' },
    { to: '/faculty/approved', icon: FiCheckCircle, label: 'Approved' },
  ],
  hod: [
    { to: '/hod',          icon: FiHome,        label: 'Dashboard' },
    { to: '/hod/approvals', icon: FiCheckCircle, label: 'Final Approvals' },
    { to: '/hod/analytics', icon: FiBarChart2,  label: 'Analytics' },
  ],
  admin: [
    { to: '/admin',        icon: FiHome,        label: 'Dashboard' },
    { to: '/admin/users',  icon: FiUsers,       label: 'User Management' },
    { to: '/admin/reports', icon: FiBarChart2,  label: 'Reports' },
    { to: '/admin/audit',  icon: FiShield,      label: 'Audit Trail' },
  ],
};

const ROLE_GRADIENT = {
  student: 'from-primary-600 to-violet-600',
  faculty: 'from-cyan-600 to-blue-600',
  hod:     'from-purple-600 to-pink-600',
  admin:   'from-amber-600 to-orange-600',
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ROLE_GRADIENT[user?.role] || 'from-primary-600 to-violet-600'} flex items-center justify-center shadow-glow-sm`}>
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SIST Research</p>
            <p className="text-white/40 text-xs capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 mx-4 mt-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: user?.avatarColor || '#6366f1' }}
          >
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.department}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4 space-y-1">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 glass border-r border-white/10 h-screen sticky top-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden glass-strong border-r border-white/10 overflow-hidden"
            >
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                <FiX className="w-4 h-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
