/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CitizenPortal } from './components/CitizenPortal';
import { CommandCenter } from './components/CommandCenter';
import { TrackerPortal } from './components/TrackerPortal';
import { TestRunnerView } from './components/TestRunnerView';
import { CodeExporterView } from './components/CodeExporterView';
import { RunGuideModal } from './components/RunGuideModal';
import { ReportHistoryModal } from './components/ReportHistoryModal';
import { AuditLog, Complaint, ComplaintStatus, HotspotCluster } from './types/civic';
import { generateSeedData } from './data/seedData';
import { 
  analyzeText, 
  calculateExplainablePriority, 
  checkDuplicate, 
  detectHotspots 
} from './services/aiEngine';
import { downloadCivicAIZip } from './services/zipExporter';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('civicai_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached complaints', e);
      }
    }
    return generateSeedData().complaints;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('civicai_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached audit logs', e);
      }
    }
    return generateSeedData().auditLogs;
  });

  const [activeTab, setActiveTab] = useState<'citizen' | 'admin' | 'tracker' | 'tests' | 'code'>('citizen');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Recalculate DBSCAN hotspots dynamically whenever complaints change
  const hotspots: HotspotCluster[] = useMemo(() => {
    return detectHotspots(complaints, 350.0, 3);
  }, [complaints]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('civicai_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('civicai_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddComplaint = (data: {
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    citizen_name: string;
    citizen_phone: string;
    image_url?: string;
  }): Complaint => {
    const id = `cmp-${Date.now()}`;
    const trackingCode = Math.random().toString(16).substring(2, 10).toUpperCase();
    const tracking_id = `CIV-${trackingCode}`;

    // AI Pipeline execution
    const { category, assignedDept, summary } = analyzeText(data.description);
    const { level, score, explanation } = calculateExplainablePriority(
      data.description,
      category,
      data.latitude,
      data.longitude
    );
    const dupCheck = checkDuplicate(data.description, data.latitude, data.longitude, complaints);

    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id,
      tracking_id,
      citizen_name: data.citizen_name || 'Anonymous Citizen',
      citizen_phone: data.citizen_phone || 'N/A',
      description: data.description,
      image_url: data.image_url,
      category,
      latitude: data.latitude,
      longitude: data.longitude,
      address_text: data.address,
      ai_summary: summary,
      ai_category: category,
      priority: level,
      priority_score: score,
      priority_explanation: explanation,
      is_duplicate: dupCheck.isDuplicate,
      duplicate_of_id: dupCheck.duplicateOfId,
      duplicate_confidence: dupCheck.confidence,
      status: 'SUBMITTED',
      assigned_department_id: assignedDept,
      created_at: now,
      updated_at: now
    };

    const newAuditLog: AuditLog = {
      id: `log-${id}-1`,
      complaint_id: id,
      old_status: 'NONE',
      new_status: 'SUBMITTED',
      changed_by: 'Citizen Intake System',
      notes: 'Grievance submitted and triaged automatically via AI engine.',
      timestamp: now
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setAuditLogs(prev => [newAuditLog, ...prev]);

    showToast(`Registered ${tracking_id}: ${level} Priority (${score}/100)`);
    return newComplaint;
  };

  const handleUpdateStatus = (complaintId: string, newStatus: ComplaintStatus, officialNotes?: string) => {
    const target = complaints.find(c => c.id === complaintId);
    if (!target) return;

    const oldStatus = target.status;
    const now = new Date().toISOString();

    const updated = complaints.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: newStatus,
          official_notes: officialNotes || c.official_notes,
          updated_at: now
        };
      }
      return c;
    });

    const newLog: AuditLog = {
      id: `log-${complaintId}-${Date.now()}`,
      complaint_id: complaintId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: 'Authority Command Center',
      notes: officialNotes || `Status updated from ${oldStatus} to ${newStatus}.`,
      timestamp: now
    };

    setComplaints(updated);
    setAuditLogs(prev => [newLog, ...prev]);

    showToast(`Updated ${target.tracking_id} to ${newStatus}`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset complaints database to original 40 seed records?')) {
      const seed = generateSeedData();
      setComplaints(seed.complaints);
      setAuditLogs(seed.auditLogs);
      localStorage.removeItem('civicai_complaints');
      localStorage.removeItem('civicai_audit_logs');
      showToast('Database reset to 40 verified seed records.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onDownloadZip={downloadCivicAIZip}
        onOpenHistory={() => setIsHistoryOpen(true)}
        hotspotCount={hotspots.length}
        complaintCount={complaints.length}
      />

      {/* Main Views */}
      <main className="flex-1">
        {activeTab === 'citizen' && (
          <CitizenPortal
            onSubmitComplaint={handleAddComplaint}
            onNavigateToTracker={(tid) => {
              setSelectedTrackingId(tid);
              setActiveTab('tracker');
            }}
            onNavigateToAdmin={() => setActiveTab('admin')}
            onOpenHistory={() => setIsHistoryOpen(true)}
            totalIssuedReportsCount={complaints.length}
          />
        )}

        {activeTab === 'admin' && (
          <CommandCenter
            complaints={complaints}
            hotspots={hotspots}
            onUpdateStatus={handleUpdateStatus}
            onNavigateToTracker={(tid) => {
              setSelectedTrackingId(tid);
              setActiveTab('tracker');
            }}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerPortal
            initialTrackingId={selectedTrackingId}
            complaints={complaints}
            auditLogs={auditLogs}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {activeTab === 'tests' && (
          <TestRunnerView
            complaints={complaints}
            auditLogs={auditLogs}
            hotspots={hotspots}
            onAddComplaint={handleAddComplaint}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'code' && (
          <CodeExporterView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">CivicAI</span>
            <span>&bull;</span>
            <span>Autonomous Civic Intelligence & Action Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px]"
            >
              Checking History Issued Reports ({complaints.length})
            </button>
            <button
              onClick={handleResetData}
              className="hover:text-slate-800 underline text-[11px]"
            >
              Reset Seed Database (40 Records)
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-800 underline text-[11px]"
            >
              Execution Guide
            </button>
            <button
              onClick={downloadCivicAIZip}
              className="hover:text-emerald-700 text-emerald-600 font-semibold text-[11px]"
            >
              Download civicai.zip
            </button>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <RunGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onDownloadZip={downloadCivicAIZip}
      />

      {/* History of Issued Reports Modal */}
      <ReportHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        complaints={complaints}
        onSelectComplaintForTracking={(tid) => {
          setSelectedTrackingId(tid);
          setActiveTab('tracker');
        }}
      />
    </div>
  );
}
