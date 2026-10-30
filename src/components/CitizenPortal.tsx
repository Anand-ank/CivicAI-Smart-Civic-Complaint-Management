import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  MapPin, 
  Camera, 
  Building2, 
  Zap, 
  Droplets, 
  Construction, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  Info,
  History
} from 'lucide-react';
import { CivicMap } from './CivicMap';
import { Complaint } from '../types/civic';
import { DEPARTMENTS } from '../services/aiEngine';

interface CitizenPortalProps {
  onSubmitComplaint: (complaintData: {
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    citizen_name: string;
    citizen_phone: string;
    image_url?: string;
  }) => Complaint;
  onNavigateToTracker: (trackingId: string) => void;
  onNavigateToAdmin: () => void;
  onOpenHistory: () => void;
  totalIssuedReportsCount?: number;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onSubmitComplaint,
  onNavigateToTracker,
  onNavigateToAdmin,
  onOpenHistory,
  totalIssuedReportsCount = 0
}) => {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick Preset Scenarios for instant testing
  const presets = [
    {
      label: '⚡ Hospital Live Wire (Critical)',
      text: 'Exposed live electrical cable snapped and dangling outside District Govt Hospital entrance with open sparks and electrocution danger.',
      address: 'District Govt Hospital Gate 2 OPD Road',
      lat: 28.6138,
      lon: 77.2091,
      image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: '🌊 College Road Flooding (Hotspot)',
      text: 'Massive waterlogging on College Road near hostel gate. 2 feet of stagnant dirty sewer water completely blocking vehicular and pedestrian passage.',
      address: 'College Road Gate 1, South Campus',
      lat: 28.5450,
      lon: 77.1925,
      image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: '🕳️ Ring Road Pothole (Duplicate Test)',
      text: 'Deep crater in asphalt right beside Metro Pillar 42. Two wheelers losing balance and risking severe crashes.',
      address: 'Metro Pillar 42, Outer Ring Road Northbound',
      lat: 28.6288,
      lon: 77.2066,
      image: undefined
    },
    {
      label: '🗑️ Rotten Waste Overflow (Sanitation)',
      text: 'Municipal garbage dumpster overflowing across sidewalk with decomposing waste, attracting strays and generating unbearable stench for residents.',
      address: 'Block 5 Community Center, Lodhi Colony',
      lat: 28.5800,
      lon: 77.2200,
      image: undefined
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setDescription(preset.text);
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    setImageUrl(preset.image);
    setTriageResult(null);
  };

  const handleLocationSelect = (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const result = onSubmitComplaint({
        description,
        address,
        latitude,
        longitude,
        citizen_name: citizenName || 'Anonymous Citizen',
        citizen_phone: citizenPhone || 'N/A',
        image_url: imageUrl
      });

      setTriageResult(result);
      setIsSubmitting(false);
    }, 400);
  };

  const copyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Grievance Intake Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Report Civic Issues with Instant AI Triage
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Submit public hazards, waterlogging, or infrastructure damages. Our AI engine instantly classifies the grievance, performs geospatial duplicate checks, and computes an explainable, auditable urgency priority score in real-time.
          </p>
        </div>

        {/* Quick presets & History Action */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Info className="w-3.5 h-3.5" /> Test Scenarios:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs bg-slate-800/90 hover:bg-blue-600/80 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-blue-400 transition-all font-medium active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white border border-blue-400/30 transition-all active:scale-95 shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Check History of Issued Reports ({totalIssuedReportsCount})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Public Grievance Form
                </h3>
                <span className="text-xs font-normal text-slate-500">Stage 1: Capture & Triage</span>
              </div>

              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-sm active:scale-95 self-start sm:self-auto"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Check History Issued Reports</span>
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {totalIssuedReportsCount}
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Fill in the incident details. You can also pick exact GPS coordinates on the adjacent map.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Describe the Problem <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder="e.g. Live electrical cable snapped and dangling outside District Govt Hospital entrance with active sparks..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Street Address or Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. Gate 2, District General Hospital Road"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Citizen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Coordinates readouts */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>GPS Pin: <b>{latitude.toFixed(6)}</b>, <b>{longitude.toFixed(6)}</b></span>
                </div>
                <span className="text-[11px] text-slate-400">Click map to move pin</span>
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Evidence Photo Attachment
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 cursor-pointer text-xs font-medium text-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload Incident Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setImageUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {imageUrl && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl(undefined)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Triaging Grievance with AI Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit to Autonomous AI Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Map & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center justify-between">
              <span>Geospatial Pinpoint</span>
              <span className="text-xs font-normal text-slate-500">Haversine Distance Index</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Click anywhere on the map or drag the blue marker to pinpoint exact location.
            </p>
            <CivicMap
              mode="citizen"
              selectedLat={latitude}
              selectedLon={longitude}
              centerLat={latitude}
              centerLon={longitude}
              onLocationSelect={handleLocationSelect}
              height="360px"
            />
          </div>
        </div>
      </div>

      {/* AI Triage Result Card */}
      {triageResult && (
        <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Intake Assessment Complete</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Grievance Registered Successfully
              </h3>
            </div>

            {/* Tracking ID Badge */}
            <div className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-inner">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tracking ID</span>
                <span className="font-mono font-bold text-base text-blue-400">{triageResult.tracking_id}</span>
              </div>
              <button
                onClick={() => copyTrackingId(triageResult.tracking_id)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
                title="Copy ID"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100">
            {/* Category & Routing */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Classified Department</span>
              <div className="flex items-center space-x-3 mt-2">
                <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-200">
                  {getDeptIcon(triageResult.assigned_department_id)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {DEPARTMENTS[triageResult.assigned_department_id]?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {triageResult.category}
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Score Meter */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Explainable Priority</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  triageResult.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                  triageResult.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                  triageResult.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {triageResult.priority}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-black text-slate-900">{triageResult.priority_score}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100 PTS</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      triageResult.priority === 'CRITICAL' ? 'bg-red-600' :
                      triageResult.priority === 'HIGH' ? 'bg-orange-500' :
                      triageResult.priority === 'MEDIUM' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${triageResult.priority_score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Deduplication Status */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Duplicate Engine Status</span>
              <div className="mt-2">
                {triageResult.is_duplicate ? (
                  <div className="text-red-700">
                    <div className="flex items-center space-x-1.5 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Duplicate Incident Flagged</span>
                    </div>
                    <p className="text-xs text-red-600/80 mt-1">
                      {Math.round(triageResult.duplicate_confidence * 100)}% match with existing record. Triaged to prevent redundant field dispatch.
                    </p>
                  </div>
                ) : (
                  <div className="text-emerald-700">
                    <div className="flex items-center space-x-1.5 font-bold text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Unique Grievance Record</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      No matching incident detected within 80m spatial radius.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="py-6 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Auditable AI Justification Breakdown (Version {triageResult.priority_explanation.rubric_version})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {triageResult.priority_explanation.justification_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Action Links */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setDescription('');
                  setAddress('');
                  setTriageResult(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Submit Another Grievance
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Check History Issued Reports</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigateToTracker(triageResult.tracking_id)}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span>Track Resolution Audit Trail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateToAdmin}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span>View on Command Center Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
