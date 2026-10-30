import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Building2, 
  Zap, 
  Droplets, 
  Construction, 
  Trash2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel } from '../types/civic';
import { DEPARTMENTS } from '../services/aiEngine';

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
  onSelectComplaintForTracking: (trackingId: string) => void;
  onSelectComplaintForMap?: (complaint: Complaint) => void;
}

export const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
  isOpen,
  onClose,
  complaints,
  onSelectComplaintForTracking,
  onSelectComplaintForMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter complaints
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const matchSearch =
        c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityBadgeClass = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-slate-100 text-slate-800';
    }
  };

  const getDeptIcon = (deptId: string) => {
    switch (deptId) {
      case 'DEPT_ELEC': return <Zap className="w-4 h-4 text-red-500" />;
      case 'DEPT_DRAIN': return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'DEPT_ROADS': return <Construction className="w-4 h-4 text-orange-500" />;
      case 'DEPT_SAN': return <Trash2 className="w-4 h-4 text-emerald-500" />;
      default: return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg text-slate-900">
                  History of Issued Reports
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  {complaints.length} Total Registered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                View all previous citizen complaints, review status transitions, and check real-time resolution logs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="py-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tracking ID, keyword, address, or reporter..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="ALL">All Statuses ({complaints.length})</option>
              <option value="SUBMITTED">Submitted ({complaints.filter(c => c.status === 'SUBMITTED').length})</option>
              <option value="ASSIGNED">Assigned ({complaints.filter(c => c.status === 'ASSIGNED').length})</option>
              <option value="IN_PROGRESS">In Progress ({complaints.filter(c => c.status === 'IN_PROGRESS').length})</option>
              <option value="RESOLVED">Resolved ({complaints.filter(c => c.status === 'RESOLVED').length})</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">🔴 Critical Urgency</option>
              <option value="HIGH">🟠 High Urgency</option>
              <option value="MEDIUM">🟡 Medium Urgency</option>
              <option value="LOW">🟢 Low Urgency</option>
            </select>
          </div>
        </div>

        {/* Complaints List (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">No issued reports match your filter criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the search keyword or status filter.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl p-4 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.tracking_id}
                    </span>
                    <button
                      onClick={() => copyId(c.tracking_id)}
                      title="Copy Tracking ID"
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {copiedId === c.tracking_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority} ({c.priority_score})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="py-2.5">
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      {getDeptIcon(c.assigned_department_id)}
                      <span>{c.category} &bull; {DEPARTMENTS[c.assigned_department_id]?.name.split('&')[0]}</span>
                    </span>
                    <span>📍 {c.address_text}</span>
                    <span>👤 Reporter: {c.citizen_name}</span>
                    {c.is_duplicate && (
                      <span className="text-red-600 font-semibold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        ⚠️ Duplicate ({Math.round(c.duplicate_confidence * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    GPS: {c.latitude}, {c.longitude}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onSelectComplaintForTracking(c.tracking_id);
                        onClose();
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
                    >
                      <span>Track Resolution History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Showing <b>{filtered.length}</b> of <b>{complaints.length}</b> issued reports</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
