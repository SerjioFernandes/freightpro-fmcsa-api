import { useMemo } from 'react';

interface RawDataViewerProps {
  data: Record<string, unknown> | null;
  title?: string;
  onClose?: () => void;
}

const RawDataViewer: React.FC<RawDataViewerProps> = ({ data, title = 'Raw Data Viewer', onClose }) => {
  const formattedJson = useMemo(() => {
    if (!data) return '';
    return JSON.stringify(data, null, 2);
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center px-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-4xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs uppercase tracking-widest text-slate-500">Secure raw JSON view</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
        <div className="px-6 py-5 bg-slate-950/90">
          <pre className="max-h-[65vh] overflow-auto text-sm text-emerald-200 bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono whitespace-pre-wrap">
            {formattedJson}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RawDataViewer;


