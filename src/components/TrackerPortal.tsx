import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Zap,
  Droplets,
  Construction,
  Trash2,
  History
} from 'lucide-react';
import { CivicMap } from './CivicMap';
import { AuditLog, Complaint } from '../types/civic';
import { DEPARTMENTS } from '../services/aiEngine';

interface TrackerPortalProps {
  initialTrackingId?: string;
  complaints: Complaint[];
  auditLogs: AuditLog[];
  onOpenHistory?: () => void;
}

export const TrackerPortal: React.FC<TrackerPortalProps> = ({
  initialTrackingId = '',
  complaints,
  auditLogs,
  onOpenHistory
}) => {
  const [searchInput, setSearchInput] = useState(initialTrackingId);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(() => {
    if (initialTrackingId) {
      return complaints.find(c => c.tracking_id.toLowerCase() === initialTrackingId.toLowerCase()) || null;
    }
    // Default to the first complaint for immediate demonstration
    return complaints[0] || null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const found = complaints.find(c => c.tracking_id.toLowerCase() === query);
    setActiveComplaint(found || null);
  };

  const selectSample = (trackingId: string) => {
    setSearchInput(trackingId);
    const found = complaints.find(c => c.tracking_id === trackingId);
    setActiveComplaint(found || null);
  };

  const complaintLogs = activeComplaint
    ? auditLogs.filter(l => l.complaint_id === activeComplaint.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  const steps = [
    { key: 'SUBMITTED', label: '1. Submitted & Triaged' },
    { key: 'ASSIGNED', label: '2. Department Assigned' },
    { key: 'IN_PROGRESS', label: '3. Field Crew Dispatched' },
    { key: 'RESOLVED', label: '4. Verified Resolved' }
  ];

  const getStepStatus = (stepKey: string) => {
    if (!activeComplaint) return 'pending';
    const statusOrder = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIndex = statusOrder.indexOf(activeComplaint.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (activeComplaint.status === 'REJECTED') return 'rejected';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getDeptIcon = (deptId: string) => {
    switch (deptId) {
      case 'DEPT_ELEC': return <Zap className="w-5 h-5 text-red-500" />;
      case 'DEPT_DRAIN': return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'DEPT_ROADS': return <Construction className="w-5 h-5 text-orange-500" />;
      case 'DEPT_SAN': return <Trash2 className="w-5 h-5 text-emerald-500" />;
      default: return <Building2 className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Public Transparency Portal &bull; Stage 4: Act</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Grievance Resolution Tracker
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Track real-time progress, assigned municipal departments, and immutable timestamped resolution audit logs.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter unique Tracking ID (e.g. CIV-800000, CIV-800539...)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            Search Grievance
          </button>
        </form>

        {/* Quick Sample IDs & History Button */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Test Grievances:</span>
            {complaints.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => selectSample(c.tracking_id)}
                className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-colors"
              >
                {c.tracking_id}
              </button>
            ))}
          </div>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-sm active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>Check History Issued Reports ({complaints.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Display */}
      {activeComplaint ? (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tracking Record
                </span>
                <div className="flex items-center space-x-3 mt-1">
                  <h3 className="text-2xl font-black font-mono text-slate-900">
                    {activeComplaint.tracking_id}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    activeComplaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    activeComplaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    activeComplaint.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeComplaint.priority} Priority
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Current Resolution State</span>
                <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  activeComplaint.status === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-sm' :
                  activeComplaint.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white shadow-sm' :
                  activeComplaint.status === 'ASSIGNED' ? 'bg-blue-600 text-white shadow-sm' :
                  'bg-slate-800 text-white'
                }`}>
                  {activeComplaint.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-8 border-b border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((st) => {
                  const stepState = getStepStatus(st.key);
                  return (
                    <div
                      key={st.key}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        stepState === 'completed'
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                          : stepState === 'active'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-900 ring-2 ring-blue-200'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="text-xs font-bold mb-1">{st.label}</div>
                      <div className="text-[11px] font-semibold">
                        {stepState === 'completed' ? '✓ Completed' : stepState === 'active' ? '● Current Stage' : 'Pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complaint Meta & Mini Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Problem Description
                  </span>
                  <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {activeComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 uppercase block mb-1">
                      Assigned Department
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getDeptIcon(activeComplaint.assigned_department_id)}
                      <div>
                        <div className="font-bold text-slate-900">
                          {DEPARTMENTS[activeComplaint.assigned_department_id]?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {DEPARTMENTS[activeComplaint.assigned_department_id]?.escalationEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 uppercase block mb-1">
                      Location & Landmark
                    </span>
                    <div className="font-bold text-slate-900 mt-1">
                      {activeComplaint.address_text}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      GPS: {activeComplaint.latitude}, {activeComplaint.longitude}
                    </div>
                  </div>
                </div>

                {activeComplaint.is_duplicate && (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <b>Duplicate Consolidation Notice:</b> This report was identified as a near-identical duplicate ({Math.round(activeComplaint.duplicate_confidence * 100)}% match) of parent ticket <b>{activeComplaint.duplicate_of_id}</b>. Actions on the parent record automatically propagate here.
                  </div>
                )}
              </div>

              {/* Mini Map */}
              <div className="lg:col-span-5">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-2 text-xs">
                  Incident Pinpoint
                </span>
                <CivicMap
                  mode="mini"
                  centerLat={activeComplaint.latitude}
                  centerLon={activeComplaint.longitude}
                  zoom={15}
                  height="220px"
                />
              </div>
            </div>
          </div>

          {/* Immutable Audit Trail Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Public Resolution Audit Trail</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Immutable, time-stamped activity log of all state transitions and official municipal notes.
                </p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {complaintLogs.length} Log Entries
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-500 space-y-6">
              {complaintLogs.map((log, index) => (
                <div key={log.id || index} className="relative group">
                  {/* Dot */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">
                          {log.new_status}
                        </span>
                        {log.old_status && log.old_status !== 'NONE' && (
                          <span className="text-[11px] text-slate-400">
                            (from {log.old_status})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {log.notes}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Recorded By: <b className="text-slate-600">{log.changed_by}</b></span>
                      <span>Verified System Hash</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700">No Grievance Selected</h4>
          <p className="text-xs text-slate-500 mt-1">
            Enter a valid tracking ID or click one of the quick test chips above to view its live status and audit trail.
          </p>
        </div>
      )}
    </div>
  );
};
