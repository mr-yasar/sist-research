// ============================================================
// Utility helpers
// ============================================================

/** Format bytes → KB / MB */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Format ISO date → readable */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'Just now';
};

/** Map status → Tailwind classes */
export const statusColor = (status) => {
  const map = {
    'Draft':         'bg-gray-500/20 text-gray-300 border-gray-500/30',
    'Submitted':     'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Faculty Review':'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'HOD Approval':  'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Approved':      'bg-green-500/20 text-green-300 border-green-500/30',
    'Rejected':      'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
};

export const statusDot = (status) => {
  const map = {
    'Draft':         'bg-gray-400',
    'Submitted':     'bg-blue-400',
    'Faculty Review':'bg-yellow-400',
    'HOD Approval':  'bg-purple-400',
    'Approved':      'bg-green-400',
    'Rejected':      'bg-red-400',
  };
  return map[status] || 'bg-gray-400';
};

/** Map file MIME type → label & icon color */
export const fileTypeInfo = (mimeType) => {
  if (mimeType?.includes('pdf'))   return { label: 'PDF',  color: '#ef4444' };
  if (mimeType?.includes('word'))  return { label: 'DOCX', color: '#3b82f6' };
  if (mimeType?.includes('image')) return { label: 'IMG',  color: '#10b981' };
  return { label: 'FILE', color: '#6366f1' };
};

/** Generate a unique ID */
export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** Month abbreviations for charts */
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Group submissions by month for bar chart */
export const groupByMonth = (submissions) => {
  const map = {};
  submissions.forEach((s) => {
    const m = MONTHS[new Date(s.date).getMonth()];
    map[m] = (map[m] || 0) + 1;
  });
  return MONTHS.map((m) => ({ month: m, count: map[m] || 0 }));
};

/** Mock export helpers */
export const mockExportCSV = (submissions) => {
  const header = 'ID,Title,Student,Department,Type,Status,Date';
  const rows = submissions.map((s) =>
    `${s.id},"${s.title}",${s.studentName},${s.department},${s.type},${s.status},${formatDate(s.date)}`
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'sist_submissions.csv'; a.click();
  URL.revokeObjectURL(url);
};

export const mockExportPDF = () => {
  alert('PDF export will be available after backend integration. (Mock: data would be sent to a PDF-generation service)');
};
