import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFile, FiFileText, FiImage,
  FiX, FiCheck, FiAlertCircle,
} from 'react-icons/fi';
import { formatFileSize } from '../utils/helpers';

const ACCEPTED = {
  'application/pdf':  true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'application/msword': true,
  'image/jpeg': true,
  'image/png':  true,
  'image/webp': true,
};
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function FileIcon({ mimeType, size = 24 }) {
  if (mimeType?.includes('pdf'))   return <FiFileText size={size} className="text-red-400" />;
  if (mimeType?.includes('word'))  return <FiFileText size={size} className="text-blue-400" />;
  if (mimeType?.includes('image')) return <FiImage    size={size} className="text-green-400" />;
  return <FiFile size={size} className="text-primary-400" />;
}

// Backend APIs and file storage will be integrated in the next phase.
export default function FileUpload({ onFileSelect, disabled = false }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus]     = useState('idle'); // idle | uploading | uploaded | error
  const [error, setError]       = useState('');
  const inputRef = useRef();

  const validate = (f) => {
    if (!ACCEPTED[f.type]) return 'Only PDF, DOCX, JPG, PNG files are allowed.';
    if (f.size > MAX_SIZE)  return `File size must be under ${formatFileSize(MAX_SIZE)}.`;
    return null;
  };

  const simulateUpload = (f, dataUrl) => {
    setStatus('uploading');
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setProgress(100);
        setStatus('uploaded');
            onFileSelect?.({
          file,
          fileName:    f.name,
          fileSize:    f.size,
          fileType:    f.type,
          fileDataUrl: dataUrl,
        });
      } else {
        setProgress(p);
      }
    }, 200);
  };

  const processFile = useCallback((f) => {
    const err = validate(f);
    if (err) { setError(err); setStatus('error'); return; }

    setFile(f);
    setError('');
    setStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (f.type.startsWith('image/')) setPreview(dataUrl);
      simulateUpload(f, dataUrl);
    };
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const onInputChange = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const remove = () => {
    setFile(null); setPreview(null);
    setProgress(0); setStatus('idle'); setError('');
    onFileSelect?.(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <AnimatePresence>
        {!file && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={onInputChange}
              disabled={disabled}
            />
            <motion.div
              animate={{ y: dragOver ? -6 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
                <FiUploadCloud className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">
                  {dragOver ? 'Drop it here!' : 'Drag & drop your file'}
                </p>
                <p className="text-white/40 text-sm mt-1">or <span className="text-primary-400 underline cursor-pointer">browse files</span></p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['PDF', 'DOCX', 'JPG', 'PNG'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40 border border-white/10">{t}</span>
                ))}
              </div>
              <p className="text-white/30 text-xs">Max 10 MB</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File card */}
      <AnimatePresence>
        {file && (
          <motion.div
            key="filecard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-start gap-4">
              {/* Icon / Preview */}
              <div className="flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileIcon mimeType={file.type} size={28} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{file.name}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {formatFileSize(file.size)} · {file.type.split('/')[1]?.toUpperCase()}
                </p>

                {/* Progress bar */}
                {status === 'uploading' && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Uploading…</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-400"
                        transition={{ ease: 'linear', duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}

                {status === 'uploaded' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                    <FiCheck className="w-3 h-3" />
                    <span>Uploaded successfully</span>
                  </div>
                )}
              </div>

              {/* Remove */}
              {status !== 'uploading' && (
                <button
                  onClick={remove}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
