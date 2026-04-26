import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiMessageSquare, FiFile, FiClock } from 'react-icons/fi';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import { formatFileSize, formatDate, fileTypeInfo } from '../utils/helpers';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await submissionService.getById(id);
      if (!data) navigate(-1);
      setSub(data);
    };
    fetchData();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    const updated = await submissionService.updateStatus(id, newStatus, user, comment);
    setSub(updated);
    setComment('');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const updated = await submissionService.addComment(id, comment, user);
    setSub(updated);
    setComment('');
  };

  if (!sub) return null;

  const fileInfo = fileTypeInfo(sub.file_type);

  // Determine actions based on role and status
  const canReviewFaculty = user?.role === 'faculty' && ['Submitted', 'Faculty Review'].includes(sub.status);
  const canReviewHOD = user?.role === 'hod' && sub.status === 'HOD Approval';

  const handleDownload = () => {
    const url = sub.file_url;
    const fileName = sub.file_name || 'download';
    const mimeType = sub.file_type || 'application/octet-stream';

    if (!url) {
      alert('No file attached to this submission.');
      return;
    }

    // Handle base64 data URLs - convert to Blob with correct MIME type
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } else {
      // Regular URL (e.g. Supabase Storage)
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{sub.title}</h2>
          <p className="text-white/50 text-sm mt-1">Submitted by {sub.student_name} on {formatDate(sub.created_at)}</p>
        </div>
        <div className="hidden sm:block">
          <StatusBadge status={sub.status} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & File */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Card */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Document Details</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center flex-shrink-0" style={{ color: fileInfo.color }}>
                <FiFile className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold">{fileInfo.label}</span>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-white/40 mb-1">File Name</p>
                  <p className="text-white font-medium break-all">{sub.file_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/40 mb-1">Type</p>
                    <p className="text-white">{sub.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Size</p>
                    <p className="text-white">{formatFileSize(sub.file_size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn-ghost flex items-center gap-2 mt-2 py-2 px-4 text-sm hover:bg-white/10"
                >
                  <FiDownload /> Download Document
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass rounded-2xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <FiMessageSquare className="text-white/40" />
              <h3 className="font-semibold text-white">Discussion</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(sub.comments || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  No comments yet.
                </div>
              ) : (
                (sub.comments || []).map(c => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {(c.author_name || c.author || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/80">{c.author_name || c.author}</span>
                        <span className="text-[10px] uppercase text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{c.author_role || c.role}</span>
                      </div>
                      <p className="text-white/70 text-sm">{c.text}</p>
                      <p className="text-white/30 text-xs mt-2">{formatDate(c.created_at || c.timestamp)}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-glass flex-1"
                />
                <button type="submit" disabled={!comment.trim()} className="btn-primary py-2 px-4">Post</button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="space-y-6">
          {/* Actions (Faculty/HOD only) */}
          {(canReviewFaculty || canReviewHOD) && (
            <div className="glass rounded-2xl p-6 border border-primary-500/30 shadow-glow-sm bg-primary-500/5">
              <h3 className="font-semibold text-white mb-4">Review Actions</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional remark before decision..."
                className="input-glass text-sm mb-4 min-h-[80px] resize-none"
              />
              <div className="space-y-2">
                {canReviewFaculty && (
                  <>
                    <button onClick={() => handleStatusChange('HOD Approval')} className="btn-success w-full text-sm">Approve & Send to HOD</button>
                    <button onClick={() => handleStatusChange('Rejected')} className="btn-danger w-full text-sm">Reject Submission</button>
                  </>
                )}
                {canReviewHOD && (
                  <>
                    <button onClick={() => handleStatusChange('Approved')} className="btn-success w-full text-sm">Final Approval</button>
                    <button onClick={() => handleStatusChange('Rejected')} className="btn-danger w-full text-sm">Reject Submission</button>
                    <button onClick={() => handleStatusChange('Faculty Review')} className="btn-ghost w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 text-sm">Return to Faculty</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FiClock className="text-white/40" />
              <h3 className="font-semibold text-white">Approval Status</h3>
            </div>
            <Timeline status={sub.status} history={sub.submission_history || sub.history || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
