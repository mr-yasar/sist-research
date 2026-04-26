import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiClock, FiXCircle, FiUploadCloud, FiBookOpen, FiTrash2, FiDownload, FiFile } from 'react-icons/fi';
import { submissionService } from '../../services/submissionService';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import FileUpload from '../../components/FileUpload';
import { formatDate, formatFileSize } from '../../utils/helpers';

export default function FacultyDashboard() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resFile, setResFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const all = await submissionService.getAll();
      const pending = all.filter(s => s.status === 'Faculty Review' || s.status === 'Submitted');
      setQueue(pending);
      setStats({
        pending: pending.length,
        approved: all.filter(s => ['HOD Approval', 'Approved'].includes(s.status)).length,
        rejected: all.filter(s => s.status === 'Rejected').length,
      });
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
        title: resTitle,
        description: resDesc,
        fileName: resFile.fileName,
        fileSize: resFile.fileSize,
        fileType: resFile.fileType,
        fileDataUrl: resFile.fileDataUrl,
      }, user);
      setResources([newRes, ...resources]);
      setResTitle(''); setResDesc(''); setResFile(null);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await resourceService.deleteById(id);
    setResources(resources.filter(r => r.id !== id));
  };

  const handleDownload = (res) => {
    if (res.file_url) {
      const a = document.createElement('a');
      a.href = res.file_url;
      a.download = res.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const tabs = [
    { id: 'queue', label: 'Review Queue', icon: <FiClock /> },
    { id: 'resources', label: 'Learning Resources', icon: <FiBookOpen /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Faculty Dashboard</h2>
        <p className="text-white/60 mt-1">Review student submissions and share learning materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Action Required</h3>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center"><FiClock className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Forwarded/Approved</h3>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center"><FiCheckCircle className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 font-medium">Returned/Rejected</h3>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center"><FiXCircle className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 glass rounded-2xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl overflow-hidden">
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
                          <p className="text-xs text-white/40 mt-1">{sub.student_name} · {sub.department}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{sub.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
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
                <input
                  value={resTitle}
                  onChange={e => setResTitle(e.target.value)}
                  placeholder="Resource title (e.g. 'How I published my first paper')"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500"
                />
                <textarea
                  value={resDesc}
                  onChange={e => setResDesc(e.target.value)}
                  placeholder="Short description of what students will learn..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 resize-none"
                />
                <FileUpload onFileSelect={setResFile} />
                <button
                  type="submit"
                  disabled={uploading || !resFile || !resTitle.trim()}
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
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
                  <p className="p-6 text-center text-white/40">No resources shared yet. Be the first!</p>
                ) : (
                  resources.map((res, i) => (
                    <motion.div key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                        <FiFile className="text-primary-400 w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{res.title}</p>
                        {res.description && <p className="text-white/50 text-sm mt-1">{res.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                          <span>By {res.uploader_name} ({res.uploader_role})</span>
                          <span>·</span>
                          <span>{res.file_name}</span>
                          <span>·</span>
                          <span>{formatDate(res.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleDownload(res)} className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/40 transition-colors">
                          <FiDownload className="w-4 h-4" />
                        </button>
                        {(res.uploader_name === user?.name) && (
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
