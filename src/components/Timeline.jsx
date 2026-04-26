import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiX } from 'react-icons/fi';
import { formatDateTime } from '../utils/helpers';

const STEPS = ['Submitted', 'Faculty Review', 'HOD Approval', 'Approved'];

function stepState(step, currentStatus) {
  if (currentStatus === 'Rejected') {
    if (step === 'Submitted') return 'done';
    return 'rejected';
  }
  const idx         = STEPS.indexOf(step);
  const currentIdx  = STEPS.indexOf(currentStatus);
  if (currentIdx === -1) return 'pending';   // Draft
  if (idx < currentIdx)  return 'done';
  if (idx === currentIdx) return 'active';
  return 'pending';
}

const ICON = {
  done:     <FiCheck className="w-3 h-3" />,
  active:   <div className="w-2 h-2 bg-white rounded-full animate-pulse" />,
  pending:  null,
  rejected: <FiX className="w-3 h-3" />,
};

const DOT_STYLE = {
  done:     'bg-green-500 border-green-400',
  active:   'bg-primary-500 border-primary-400 shadow-glow-sm',
  pending:  'bg-white/10 border-white/20',
  rejected: 'bg-red-500 border-red-400',
};

export default function Timeline({ status, history = [] }) {
  const historyMap = {};
  history.forEach((h) => {
    if (!h.status) return;
    const step = h.status.replace('Moved to ', '');
    historyMap[step] = h;
  });

  return (
    <div className="space-y-1">
      {STEPS.map((step, i) => {
        const state = stepState(step, status);
        const hist  = history.find(
          (h) => h.status && (h.status.includes(step) || (step === 'Approved' && h.status === 'Approved')),
        );

        return (
          <div key={step} className="flex gap-4">
            {/* Dot + Line */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-white flex-shrink-0 ${DOT_STYLE[state]}`}
              >
                {ICON[state]}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${state === 'done' ? 'bg-green-500/50' : 'bg-white/10'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p className={`text-sm font-semibold ${state === 'active' ? 'text-primary-300' : state === 'done' ? 'text-green-300' : state === 'rejected' ? 'text-red-300' : 'text-white/30'}`}>
                {step}
              </p>
              {hist && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-1"
                >
                  <p className="text-xs text-white/50">{hist.actor_name || hist.user} · {formatDateTime(hist.created_at || hist.timestamp)}</p>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}

      {status === 'Rejected' && (
        <div className="flex gap-4">
          <div className="w-7 h-7 rounded-full border-2 border-red-400 bg-red-500 flex items-center justify-center text-white flex-shrink-0">
            <FiX className="w-3 h-3" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-300">Rejected</p>
            {history.find((h) => h.status === 'Rejected' || h.action === 'Rejected') && (
              <p className="text-xs text-white/50 mt-1">
                {history.find((h) => h.status === 'Rejected' || h.action === 'Rejected').actor_name || history.find((h) => h.status === 'Rejected' || h.action === 'Rejected').user} ·{' '}
                {formatDateTime(history.find((h) => h.status === 'Rejected' || h.action === 'Rejected').created_at || history.find((h) => h.status === 'Rejected' || h.action === 'Rejected').timestamp)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
