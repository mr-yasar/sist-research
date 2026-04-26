import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, label, color = 'primary', showPercent = true }) {
  const colors = {
    primary: 'from-primary-500 to-violet-500',
    success: 'from-emerald-500 to-teal-400',
    warning: 'from-yellow-500 to-orange-400',
    danger:  'from-red-500 to-pink-500',
    info:    'from-cyan-500 to-blue-400',
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-xs text-white/60 font-medium">{label}</span>}
          {showPercent && <span className="text-xs text-white/80 font-bold">{Math.round(value)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${colors[color] || colors.primary}`}
        />
      </div>
    </div>
  );
}
