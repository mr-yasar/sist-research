import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiUpload, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submissionService } from '../../services/submissionService';
import { SUBMISSION_TYPES } from '../../data/mockData';
import FileUpload from '../../components/FileUpload';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [uploadData, setUploadData]   = useState(null);
  const [title, setTitle]             = useState('');
  const [type, setType]               = useState(SUBMISSION_TYPES[0]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setSubmissions(submissionService.getByStudent(user.id));
    }
  }, [user]);

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => ['Submitted', 'Faculty Review', 'HOD Approval'].includes(s.status)).length,
    approved: submissions.filter(s => s.status === 'Approved').length,
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!uploadData || !title.trim()) return;

    const newSub = submissionService.create({
      title,
      type,
      fileName: uploadData.fileName,
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      fileDataUrl: uploadData.fileDataUrl,
    }, user);

    setSubmissions([newSub, ...submissions]);
    setUploadData(null);
    setTitle('');
    setActiveTab('history');
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'upload', label: 'Upload Document' },
    { id: 'history', label: 'My Submissions' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name.split(' ')[0]} 👋</h2>
        <p className="text-white/60 mt-1">Track your research and academic submissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white/5 p-1 rounded-xl w-fit border border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-primary-500 rounded-lg shadow-lg"
                transition={{ type: 'spring', duration: 0.5 }}
                style={{ zIndex: -1 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 font-medium">Total Submissions</h3>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><FiFileText className="w-5 h-5" /></div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 font-medium">In Progress</h3>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center"><FiClock className="w-5 h-5" /></div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 font-medium">Approved</h3>
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center"><FiCheckCircle className="w-5 h-5" /></div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.approved}</p>
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
                  <button onClick={() => setActiveTab('history')} className="text-sm text-primary-400 hover:text-primary-300">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {submissions.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><FiFileText className="w-8 h-8 text-white/20" /></div>
                      <p className="text-white/60">No submissions yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {submissions.slice(0, 3).map((sub, i) => (
                        <div key={sub.id} onClick={() => navigate(`/submission/${sub.id}`)} className="p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate group-hover:text-primary-300 transition-colors">{sub.title}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                                <span>{sub.type}</span><span>•</span><span>{formatDate(sub.date)}</span>
                              </div>
                            </div>
                            <StatusBadge status={sub.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-4"><FiUpload className="w-8 h-8" /></div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Submission</h3>
                  <p className="text-white/50 text-sm">Upload your research paper, report, or document for review.</p>
                </div>
                
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Document Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-glass" placeholder="e.g. AI in Healthcare Review" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Submission Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="input-glass appearance-none">
                      {SUBMISSION_TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">File Upload</label>
                    <FileUpload onFileReady={setUploadData} />
                  </div>
                  <button type="submit" disabled={!uploadData || !title.trim()} className={`btn-primary w-full mt-4 ${(!uploadData || !title.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Submit Document
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <h3 className="text-lg font-semibold text-white">All Submissions</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {submissions.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><FiFileText className="w-8 h-8 text-white/20" /></div>
                      <p className="text-white/60">No submissions found. Start uploading your research!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {submissions.map((sub, i) => (
                        <div key={sub.id} onClick={() => navigate(`/submission/${sub.id}`)} className="p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-white font-medium text-lg truncate group-hover:text-primary-300 transition-colors">{sub.title}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">{sub.type}</span>
                                <span>•</span>
                                <span>{formatDate(sub.date)}</span>
                              </div>
                            </div>
                            <StatusBadge status={sub.status} size="lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
