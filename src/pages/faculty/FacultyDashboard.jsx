import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { submissionService } from '../../services/submissionService';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function FacultyDashboard() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const all = submissionService.getAll();
    const pending = all.filter(s => s.status === 'Faculty Review' || s.status === 'Submitted');
    setQueue(pending);
    setStats({
      pending: pending.length,
      approved: all.filter(s => ['HOD Approval', 'Approved'].includes(s.status)).length,
      rejected: all.filter(s => s.status === 'Rejected').length,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Faculty Dashboard</h2>
        <p className="text-white/60 mt-1">Review student submissions and forward to HOD.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Action Required</h3>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <FiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Forwarded/Approved</h3>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Returned/Rejected</h3>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <FiXCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-semibold text-white">Review Queue</h3>
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-bold">{queue.length} Pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-black/20 text-white/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Student & Document</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {queue.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40">No submissions in queue. Great job!</td></tr>
              ) : (
                queue.map((sub, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={sub.id}
                    onClick={() => navigate(`/submission/${sub.id}`)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white group-hover:text-primary-300 transition-colors">{sub.title}</p>
                      <p className="text-xs text-white/40 mt-1">{sub.studentName} · {sub.department}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{sub.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
