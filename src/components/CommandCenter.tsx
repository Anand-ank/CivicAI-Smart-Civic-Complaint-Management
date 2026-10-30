import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Filter, 
  Search, 
  AlertOctagon, 
  Clock, 
  ArrowUpDown, 
  Building2, 
  FileSpreadsheet, 
  Radio, 
  ChevronRight,
  Zap,
  Droplets,
  Construction,
  Trash2,
  X
} from 'lucide-react';
import { CivicMap } from './CivicMap';
import { Complaint, ComplaintStatus, DepartmentId, HotspotCluster, PriorityLevel } from '../types/civic';
import { DEPARTMENTS } from '../services/aiEngine';

interface CommandCenterProps {
  complaints: Complaint[];
  hotspots: HotspotCluster[];
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus, officialNotes?: string) => void;
  onNavigateToTracker: (trackingId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  complaints,
  hotspots,
  onUpdateStatus,
  onNavigateToTracker
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotCluster | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ id: string; currentStatus: ComplaintStatus; targetStatus: ComplaintStatus } | null>(null);
  const [officialNotes, setOfficialNotes] = useState('');

  // Top KPIs
  const totalComplaints = complaints.length;
  const criticalCount = complaints.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;
  const duplicateCount = complaints.filter(c => c.is_duplicate).length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = 
        c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesDept = deptFilter === 'ALL' || c.assigned_department_id === deptFilter;
      const matchesDuplicates = !showDuplicatesOnly || c.is_duplicate;

      return matchesSearch && matchesPriority && matchesStatus && matchesDept && matchesDuplicates;
    });
  }, [complaints, searchTerm, priorityFilter, statusFilter, deptFilter, showDuplicatesOnly]);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeTarget) return;

    onUpdateStatus(
      statusChangeTarget.id,
      statusChangeTarget.targetStatus,
      officialNotes.trim() || `Status updated to ${statusChangeTarget.targetStatus} via Command Center.`
    );

    setStatusChangeTarget(null);
    setOfficialNotes('');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
            <span>Live Geospatial Operations Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Authority Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hotspot detection, DBSCAN clustering, and auditable municipal triage workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>DBSCAN Spatial Clustering Active (eps: 350m)</span>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Incidents</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalComplaints}</span>
            <span className="text-xs font-semibold text-slate-400">Recorded</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Critical & High</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-red-600">{criticalCount}</span>
            <span className="text-xs font-semibold text-red-500">Urgent</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Duplicates Filtered</span>
            <ArrowUpDown className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-orange-600">{duplicateCount}</span>
            <span className="text-xs font-semibold text-orange-500">Linked</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Hotspots</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{hotspots.length}</span>
            <span className="text-xs font-semibold text-rose-500">Clusters</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{resolutionRate}%</span>
            <span className="text-xs font-semibold text-emerald-600">{resolvedCount} closed</span>
          </div>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Geospatial Incident Density & Hotspot Map</span>
            </h3>
            <p className="text-xs text-slate-500">
              Red circular zones highlight DBSCAN cluster centroids (350m radius). Click any cluster or incident to inspect.
            </p>
          </div>

          {hotspots.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span>{hotspots.length} Concentrated Hotspot Clusters</span>
              </span>
            </div>
          )}
        </div>

        <CivicMap
          mode="admin"
          complaints={filteredComplaints}
          hotspots={hotspots}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
          onSelectHotspot={(h) => setSelectedHotspot(h)}
          height="450px"
        />

        {/* Hotspot Alert Cards Carousel/Row */}
        {hotspots.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Identified Geographic Hotspot Clusters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotspots.map((h) => (
                <div
                  key={h.cluster_id}
                  onClick={() => setSelectedHotspot(h)}
                  className="bg-red-50/70 hover:bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-sm text-red-900">
                        Hotspot #{h.cluster_id + 1}: {h.dominant_issue}
                      </span>
                    </div>
                    <span className="bg-red-200/80 text-red-900 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {h.complaint_count} Reports
                    </span>
                  </div>
                  <p className="text-xs text-red-800 mt-2 leading-relaxed">
                    {h.action_brief}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-red-600/80 border-t border-red-200/60 pt-2">
                    <span>Center: {h.center_lat}, {h.center_lon}</span>
                    <span className="font-semibold flex items-center gap-1">
                      Inspect Cluster <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decision Matrix Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Prioritized Incident Decision Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Sorted by AI priority score descending. Take immediate dispatch and status actions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                Showing <b>{filteredComplaints.length}</b> of <b>{complaints.length}</b> reports
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracking ID, text..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">🔴 Critical Only</option>
              <option value="HIGH">🟠 High Only</option>
              <option value="MEDIUM">🟡 Medium Only</option>
              <option value="LOW">🟢 Low Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="ALL">All Departments</option>
              <option value="DEPT_ELEC">⚡ Electrical / Power</option>
              <option value="DEPT_ROADS">🚧 Road Infrastructure</option>
              <option value="DEPT_DRAIN">🌊 Drainage & Flood</option>
              <option value="DEPT_SAN">🗑️ Sanitation & Waste</option>
              <option value="DEPT_GEN">🏢 General Civic</option>
            </select>

            <label className="flex items-center space-x-2 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDuplicatesOnly}
                onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Duplicates Only</span>
            </label>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Tracking ID</th>
                <th className="py-3.5 px-4">AI Summary & Location</th>
                <th className="py-3.5 px-4">Category & Dept</th>
                <th className="py-3.5 px-4">AI Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Duplicate</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="hover:underline flex items-center space-x-1"
                      >
                        <span>{c.tracking_id}</span>
                      </button>
                    </td>

                    {/* Summary & Address */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <div className="font-medium text-slate-900 line-clamp-1">{c.ai_summary}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{c.address_text}</div>
                    </td>

                    {/* Category & Dept */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{c.category}</div>
                      <div className="text-[11px] text-slate-400">
                        {DEPARTMENTS[c.assigned_department_id]?.name.split('&')[0]}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] border ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority} ({c.priority_score})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] uppercase ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Duplicate Flag */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.is_duplicate ? (
                        <span className="text-red-600 font-bold text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          ⚠️ {Math.round(c.duplicate_confidence * 100)}% Match
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unique</span>
                      )}
                    </td>

                    {/* Action Selector */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as ComplaintStatus;
                          setStatusChangeTarget({
                            id: c.id,
                            currentStatus: c.status,
                            targetStatus: newStatus
                          });
                        }}
                        className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="ASSIGNED">Assign Dept</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Mark Resolved</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900 mb-1">
              Confirm Status Transition
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transitioning state from <b className="text-slate-800">{statusChangeTarget.currentStatus}</b> to <b className="text-blue-600">{statusChangeTarget.targetStatus}</b>. This will append an immutable timestamped log to the public audit trail.
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Official Remediation Note / Action Proof
                </label>
                <textarea
                  value={officialNotes}
                  onChange={(e) => setOfficialNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Field dispatch unit #4 deployed with emergency pumping apparatus..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusChangeTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
                >
                  Confirm & Update Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Complaint Inspection Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg text-blue-600">
                  {selectedComplaint.tracking_id}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getPriorityBadgeClass(selectedComplaint.priority)}`}>
                  {selectedComplaint.priority} ({selectedComplaint.priority_score})
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase">Description</span>
                <p className="text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase">Assigned Dept</span>
                  <div className="font-semibold text-slate-800 text-sm mt-1">
                    {DEPARTMENTS[selectedComplaint.assigned_department_id]?.name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {DEPARTMENTS[selectedComplaint.assigned_department_id]?.escalationEmail}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase">Location GPS</span>
                  <div className="font-semibold text-slate-800 text-sm mt-1">
                    {selectedComplaint.latitude}, {selectedComplaint.longitude}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {selectedComplaint.address_text}
                  </div>
                </div>
              </div>

              {/* Justification factors */}
              <div>
                <span className="font-bold text-slate-500 uppercase">AI Explainability Justification Factors</span>
                <div className="mt-2 space-y-1.5">
                  {selectedComplaint.priority_explanation.justification_factors.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedComplaint.image_url && (
                <div>
                  <span className="font-bold text-slate-500 uppercase">Evidence Photo</span>
                  <img
                    src={selectedComplaint.image_url}
                    alt="Evidence"
                    className="w-full h-44 object-cover rounded-xl mt-1 border border-slate-200"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigateToTracker(selectedComplaint.tracking_id);
                    setSelectedComplaint(null);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                >
                  Open Full Public Audit Trail
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Hotspot Inspection Modal */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2 text-red-600 font-bold">
                <Flame className="w-5 h-5" />
                <span>Hotspot Cluster #{selectedHotspot.cluster_id + 1}</span>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-900">
                <div className="font-bold text-sm">
                  {selectedHotspot.complaint_count} Clustered Incidents Detected
                </div>
                <div className="text-xs text-red-700 mt-1">
                  Primary dominant problem: <b>{selectedHotspot.dominant_issue}</b>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase">Generative Action Brief</span>
                <p className="text-slate-800 text-xs mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedHotspot.action_brief}
                </p>
              </div>

              <div className="text-slate-500">
                Centroid Coordinates: <b>{selectedHotspot.center_lat}</b>, <b>{selectedHotspot.center_lon}</b>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
