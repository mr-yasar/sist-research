import { useState, useEffect } from 'react';
import { FiDownloadCloud, FiUsers, FiFileText, FiShield } from 'react-icons/fi';
import { submissionService } from '../../services/submissionService';
import { auditService } from '../../services/auditService';
import { MOCK_USERS } from '../../data/mockData';
import { mockExportCSV, formatDateTime } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, approved: 0 });
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    const s = submissionService.getStats();
    setStats({ total: s.total, approved: s.approved });
    setAuditLog(auditService.getAll().slice(0, 10)); // recent 10
  }, []);

  const handleExport = () => {
    mockExportCSV(submissionService.getAll());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">System Administration</h2>
          <p className="text-white/60 mt-1">Global overview and audit tracking.</p>
        </div>
        <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-sm bg-white/5">
          <FiDownloadCloud /> Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <FiUsers className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="text-white/60 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold text-white mt-1">{MOCK_USERS.length}</p>
        </div>
        <div className="stat-card">
          <FiFileText className="w-6 h-6 text-primary-400 mb-3" />
          <h3 className="text-white/60 text-sm font-medium">All Submissions</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <FiShield className="w-6 h-6 text-green-400 mb-3" />
          <h3 className="text-white/60 text-sm font-medium">Approved Submissions</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
        </div>
        <div className="stat-card">
          <FiDownloadCloud className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="text-white/60 text-sm font-medium">System Health</h3>
          <p className="text-2xl font-bold text-green-400 mt-1">100%</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden mt-6">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-semibold text-white">Recent Audit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-black/20 text-white/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLog.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-white/50">{formatDateTime(log.timestamp)}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white/90">{log.user}</span>
                    <span className="ml-2 text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-white/60">{log.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.action.includes('SUBMISSION') ? 'bg-blue-500/20 text-blue-300' :
                      log.action.includes('STATUS') ? 'bg-purple-500/20 text-purple-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
