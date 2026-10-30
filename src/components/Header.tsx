import React from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  Download, 
  HelpCircle,
  FileCode,
  Flame,
  History
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'citizen' | 'admin' | 'tracker' | 'tests' | 'code';
  setActiveTab: (tab: 'citizen' | 'admin' | 'tracker' | 'tests' | 'code') => void;
  onOpenGuide: () => void;
  onDownloadZip: () => void;
  onOpenHistory: () => void;
  hotspotCount: number;
  complaintCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGuide,
  onDownloadZip,
  onOpenHistory,
  hotspotCount,
  complaintCount
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('citizen')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-lg text-white">
              C
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CivicAI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Autonomous Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Capture &bull; Understand &bull; Reveal &bull; Act
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Command Center</span>
              {hotspotCount > 0 && (
                <span className="flex items-center space-x-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  <span>{hotspotCount}</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'tracker'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Track Status</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'tests'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline">Automated Tests</span>
              <span className="md:hidden">Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Code / ZIP</span>
              <span className="md:hidden">Code</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenHistory}
              title="Check History of Issued Reports"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 transition-all shadow-sm active:scale-95"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Report History</span>
              <span className="bg-blue-600/60 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {complaintCount}
              </span>
            </button>

            <button
              onClick={onOpenGuide}
              title="How & Where to Run"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={onDownloadZip}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
