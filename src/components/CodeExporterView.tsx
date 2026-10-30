import React, { useState } from 'react';
import { 
  Download, 
  FileCode, 
  Check, 
  Copy, 
  FileText, 
  FolderArchive, 
  Terminal, 
  AlertTriangle,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { CODE_FILES, downloadCivicAIZip } from '../services/zipExporter';

export const CodeExporterView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileList = [
    { name: 'app.py', type: 'Python FastAPI & AI Engine', size: '~12 KB' },
    { name: 'static/index.html', type: 'HTML5 & Leaflet Interface', size: '~14 KB' },
    { name: 'test_system.py', type: 'Automated 7-Stage Test Suite', size: '~6 KB' },
    { name: 'requirements.txt', type: 'Pip Dependencies', size: '~150 B' },
    { name: 'run_windows.bat', type: '1-Click Windows Launcher', size: '~200 B' },
    { name: 'run_mac_linux.sh', type: '1-Click Unix Shell Script', size: '~200 B' },
    { name: 'README.md', type: 'Setup Instructions', size: '~1 KB' },
    { name: 'LIMITATIONS_NOTE.md', type: 'Engineering Honesty Note', size: '~800 B' }
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCivicAIZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const copyCurrentFile = () => {
    const code = CODE_FILES[selectedFile as keyof typeof CODE_FILES] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-400/20">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Complete Self-Contained Source Package</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              1-Click Download `civicai.zip`
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              No more manual copy-pasting into Notepad or syntax errors! Download the clean, verified ZIP file containing the full FastAPI server, embedded AI engine, Leaflet dashboard, auto-seeder, and 7-stage test suite.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-7 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{isDownloading ? 'Generating ZIP...' : 'Download civicai.zip'}</span>
            </button>
            <span className="block text-[11px] text-slate-400 text-center mt-2 font-mono">
              civicai.zip (~35 KB) &bull; Zero External API Keys Required
            </span>
          </div>
        </div>
      </div>

      {/* Troubleshooting explanation for Notepad issue */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block text-amber-950">
            Why did you get &quot;SyntaxError: unterminated triple-quoted string literal&quot; earlier?
          </span>
          <p className="leading-relaxed">
            When pasting large code blocks into Windows Notepad, Notepad frequently truncates the end of very long files (or drops the final closing quotes <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">&quot;&quot;&quot;</code>). 
            Downloading the <b>`civicai.zip`</b> above completely bypasses copy-pasting—simply extract the ZIP and run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">python app.py</code>!
          </p>
        </div>
      </div>

      {/* File Explorer & Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Files Included in `civicai.zip`</span>
          </h3>

          <div className="space-y-1.5">
            {fileList.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFile(f.name)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  selectedFile === f.name
                    ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-sm'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-mono font-bold text-xs">{f.name}</div>
                  <div className="text-[11px] text-slate-400">{f.type}</div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {f.size}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download All as civicai.zip</span>
            </button>
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center space-x-2 font-mono font-bold text-xs text-slate-800">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{selectedFile}</span>
            </div>

            <button
              onClick={copyCurrentFile}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono max-h-[500px] overflow-y-auto leading-relaxed border border-slate-800">
            {CODE_FILES[selectedFile as keyof typeof CODE_FILES] || ''}
          </pre>
        </div>
      </div>
    </div>
  );
};
