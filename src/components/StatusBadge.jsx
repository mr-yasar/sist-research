import { motion } from 'framer-motion';
import { statusColor, statusDot } from '../utils/helpers';

export default function StatusBadge({ status, size = 'md' }) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      className={`badge border ${statusColor(status)} ${sizes[size]} font-semibold`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(status)}`} />
      {status}
    </motion.span>
  );
}
