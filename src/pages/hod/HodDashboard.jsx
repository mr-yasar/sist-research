import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiBarChart2, FiBookOpen, FiUploadCloud, FiFile, FiDownload, FiTrash2 } from 'react-icons/fi';
import { submissionService } from '../../services/submissionService';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import FileUpload from '../../components/FileUpload';
import { groupByMonth, formatDate, formatFileSize } from '../../utils/helpers';

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
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resFile, setResFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const all = await submissionService.getAll();
      setQueue(all.filter(s => s.status === 'HOD Approval'));
      
      const stats = await submissionService.getStats();
      setPieData([
        { name: 'Submitted', value: stats.submitted },
        { name: 'Faculty Review', value: stats.facultyReview },
        { name: 'HOD Approval', value: stats.hodApproval },
        { name: 'Approved', value: stats.approved },
        { name: 'Rejected', value: stats.rejected },
      ].filter(d => d.value > 0));

      setBarData(groupByMonth(all));
      const res = await resourceService.getAll();
      setResources(res);
    };
    fetchData();
  }, []);

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!resFile || !resTitle.trim()) return;
    setUploading(true);
    try {
      const newRes = await resourceService.create({
        title: resTitle, description: resDesc,
        fileName: resFile.fileName, fileSize: resFile.fileSize,
        fileType: resFile.fileType, fileDataUrl: resFile.fileDataUrl,
      }, user);
      setResources([newRes, ...resources]);
      setResTitle(''); setResDesc(''); setResFile(null);
    } catch (err) { alert('Upload failed: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await resourceService.deleteById(id);
    setResources(resources.filter(r => r.id !== id));
  };

  const handleDownload = (res) => {
    if (res.file_url) {
      const a = document.createElement('a');
      a.href = res.file_url; a.download = res.file_name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Department Head Dashboard</h2>
        <p className="text-white/60 mt-1">Final approvals, analytics, and share learning materials.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 glass rounded-2xl p-1.5">
        {[
          { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 /> },
          { id: 'resources', label: 'Learning Resources', icon: <FiBookOpen /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
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
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15,15,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} itemStyle={{ color: 'white' }} />
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
            <div className="glass rounded-2xl overflow-hidden">
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
                            <p className="text-xs text-white/40 mt-1">{sub.student_name}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{sub.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Upload Form */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiUploadCloud className="text-primary-400" /> Share a Learning Resource
              </h3>
              <form onSubmit={handleUploadResource} className="space-y-4">
                <input value={resTitle} onChange={e => setResTitle(e.target.value)}
                  placeholder="Resource title (e.g. 'Research Paper Writing Tips')"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500" />
                <textarea value={resDesc} onChange={e => setResDesc(e.target.value)}
                  placeholder="Short description for students..." rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 resize-none" />
                <FileUpload onFileSelect={setResFile} />
                <button type="submit" disabled={uploading || !resFile || !resTitle.trim()}
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <FiUploadCloud /> {uploading ? 'Uploading...' : 'Share with Students'}
                </button>
              </form>
            </div>

            {/* Posted Resources */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="text-lg font-semibold text-white">All Shared Resources ({resources.length})</h3>
              </div>
              <div className="divide-y divide-white/5">
                {resources.length === 0 ? (
                  <p className="p-6 text-center text-white/40">No resources shared yet.</p>
                ) : (
                  resources.map((res, i) => (
                    <motion.div key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <FiFile className="text-purple-400 w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{res.title}</p>
                        {res.description && <p className="text-white/50 text-sm mt-1">{res.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                          <span>By {res.uploader_name} ({res.uploader_role})</span>
                          <span>·</span><span>{res.file_name}</span>
                          <span>·</span><span>{formatDate(res.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleDownload(res)} className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/40 transition-colors">
                          <FiDownload className="w-4 h-4" />
                        </button>
                        {res.uploader_name === user?.name && (
                          <button onClick={() => handleDelete(res.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

