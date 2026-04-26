import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { submissionService } from '../../services/submissionService';
import StatusBadge from '../../components/StatusBadge';
import { groupByMonth, formatDate } from '../../utils/helpers';

const COLORS = {
  'Draft': '#9ca3af',
  'Submitted': '#3b82f6',
  'Faculty Review': '#eab308',
  'HOD Approval': '#a855f7',
  'Approved': '#22c55e',
  'Rejected': '#ef4444',
};

export default function HodDashboard() {
  const [queue, setQueue] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const all = submissionService.getAll();
    setQueue(all.filter(s => s.status === 'HOD Approval'));
    
    const stats = submissionService.getStats();
    setPieData([
      { name: 'Submitted', value: stats.submitted },
      { name: 'Faculty Review', value: stats.facultyReview },
      { name: 'HOD Approval', value: stats.hodApproval },
      { name: 'Approved', value: stats.approved },
      { name: 'Rejected', value: stats.rejected },
    ].filter(d => d.value > 0));

    setBarData(groupByMonth(all));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Department Head Dashboard</h2>
        <p className="text-white/60 mt-1">Final approvals and department analytics.</p>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 h-80">
          <h3 className="text-white font-semibold mb-4">Submission Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                itemStyle={{ color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6 h-80">
          <h3 className="text-white font-semibold mb-4">Monthly Submissions</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Final Approval Queue */}
      <div className="glass rounded-2xl overflow-hidden mt-6">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-semibold text-white">Awaiting Final Approval</h3>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">{queue.length} Pending</span>
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
                <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40">No pending final approvals.</td></tr>
              ) : (
                queue.map((sub) => (
                  <tr key={sub.id} onClick={() => navigate(`/submission/${sub.id}`)} className="hover:bg-white/5 cursor-pointer transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white group-hover:text-primary-300 transition-colors">{sub.title}</p>
                      <p className="text-xs text-white/40 mt-1">{sub.studentName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{sub.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
