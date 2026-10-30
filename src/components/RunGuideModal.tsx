import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  FolderArchive, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface RunGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export const RunGuideModal: React.FC<RunGuideModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip
}) => {
  const [activeOS, setActiveOS] = useState<'windows' | 'mac_linux'>('windows');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const windowsSteps = [
    {
      title: 'Step 1: Download & Extract the ZIP',
      desc: 'Click "Download ZIP" in the top bar. Extract civicai.zip into your folder (e.g. C:\\Users\\akast\\civicai_app).',
      code: 'Expand-Archive -Path civicai.zip -DestinationPath . -Force\ncd civicai'
    },
    {
      title: 'Step 2: Install Python Dependencies',
      desc: 'Open Command Prompt or PowerShell in the extracted civicai folder and install requirements.',
      code: 'pip install -r requirements.txt'
    },
    {
      title: 'Step 3: Launch the CivicAI Server',
      desc: 'Runs FastAPI, auto-seeds 40 realistic complaints & hotspots, and serves the dashboard.',
      code: 'python app.py'
    },
    {
      title: 'Step 4: Open in Web Browser',
      desc: 'Navigate to the local server in Chrome, Edge, or Firefox.',
      code: 'http://127.0.0.1:8000'
    },
    {
      title: 'Step 5: Run Automated Verification Suite',
      desc: 'In a second Command Prompt terminal, verify all 7 criteria.',
      code: 'python test_system.py'
    }
  ];

  const macLinuxSteps = [
    {
      title: 'Step 1: Extract the ZIP',
      desc: 'Extract civicai.zip and change directory into it.',
      code: 'unzip civicai.zip\ncd civicai'
    },
    {
      title: 'Step 2: Install Dependencies',
      desc: 'Install dependencies using pip3.',
      code: 'pip3 install -r requirements.txt'
    },
    {
      title: 'Step 3: Start Server',
      desc: 'Start the uvicorn web server.',
      code: 'python3 app.py'
    },
    {
      title: 'Step 4: Open in Browser',
      desc: 'Visit the local endpoint.',
      code: 'http://127.0.0.1:8000'
    },
    {
      title: 'Step 5: Run Automated Tests',
      desc: 'Execute the test pipeline in a new terminal.',
      code: 'python3 test_system.py'
    }
  ];

  const steps = activeOS === 'windows' ? windowsSteps : macLinuxSteps;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Where and How to Run CivicAI
              </h3>
              <p className="text-xs text-slate-500">
                5-step execution guide for your computer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Selector */}
        <div className="mt-4 flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveOS('windows')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeOS === 'windows' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🪟 Windows (Command Prompt / PowerShell)
          </button>
          <button
            onClick={() => setActiveOS('mac_linux')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeOS === 'mac_linux' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍎 macOS / 🐧 Linux (Terminal)
          </button>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-4">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">{st.title}</span>
                <span className="text-[10px] font-semibold text-slate-400">Step {idx + 1}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{st.desc}</p>

              <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between">
                <span className="truncate pr-2">{st.code}</span>
                <button
                  onClick={() => copyText(st.code, idx)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting box */}
        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
          <span className="font-bold block">💡 Fast Tip for Windows:</span>
          <p className="text-blue-800">
            Inside the extracted zip, you can also simply double-click <b>`run_windows.bat`</b>! It will install dependencies and start the server automatically without having to type commands manually.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onDownloadZip();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Download civicai.zip Now</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
