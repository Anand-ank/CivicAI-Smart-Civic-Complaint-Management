export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type DepartmentId = 'DEPT_ROADS' | 'DEPT_ELEC' | 'DEPT_DRAIN' | 'DEPT_SAN' | 'DEPT_GEN';

export interface Department {
  id: DepartmentId;
  name: string;
  escalationEmail: string;
  iconName: string;
  color: string;
}

export interface PriorityExplanation {
  calculated_score: number;
  classification: PriorityLevel;
  justification_factors: string[];
  rubric_version: string;
}

export interface Complaint {
  id: string;
  tracking_id: string;
  citizen_name: string;
  citizen_phone: string;
  description: string;
  image_url?: string;
  category: string;
  latitude: number;
  longitude: number;
  address_text: string;
  
  // AI Generated
  ai_summary: string;
  ai_category: string;
  priority: PriorityLevel;
  priority_score: number;
  priority_explanation: PriorityExplanation;
  
  // Duplicate Management
  is_duplicate: boolean;
  duplicate_of_id?: string;
  duplicate_confidence: number;
  
  // Workflow / Action
  status: ComplaintStatus;
  assigned_department_id: DepartmentId;
  official_notes?: string;
  resolution_proof_url?: string;
  
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string | number;
  complaint_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes: string;
  timestamp: string;
}

export interface HotspotCluster {
  cluster_id: number;
  complaint_count: number;
  center_lat: number;
  center_lon: number;
  dominant_issue: string;
  complaint_ids: string[];
  action_brief: string;
  radius_meters: number;
}
