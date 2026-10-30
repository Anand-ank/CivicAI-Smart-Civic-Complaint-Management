import { analyzeText, calculateExplainablePriority, checkDuplicate } from '../services/aiEngine';
import { AuditLog, Complaint } from '../types/civic';

export function generateSeedData(): { complaints: Complaint[]; auditLogs: AuditLog[] } {
  const baseSamples: Array<{ text: string; lat: number; lon: number; address: string; citizen: string; phone?: string }> = [
    // --- HOTSPOT CLUSTER: College Road Drainage/Waterlogging ---
    {
      text: "Severe waterlogging on College Road near hostel gate. 2 feet of dirty water blocked the lane.",
      lat: 28.5450,
      lon: 77.1925,
      address: "College Road Gate 1, South Campus",
      citizen: "Aarav Sharma",
      phone: "+91 98112 34567"
    },
    {
      text: "Drain is completely clogged and overflowing on College Road near library. Walking impossible.",
      lat: 28.5455,
      lon: 77.1928,
      address: "College Road Library Junction",
      citizen: "Priya Nair",
      phone: "+91 98765 43210"
    },
    {
      text: "Rain water mixed with sewage backing up into campus entrance on College Road.",
      lat: 28.5448,
      lon: 77.1922,
      address: "College Road Main Entry Arch",
      citizen: "Dr. K. Mehta",
      phone: "+91 98100 11223"
    },
    {
      text: "Huge stagnant water puddle causing bikes to slip on College Road north bend.",
      lat: 28.5452,
      lon: 77.1930,
      address: "College Road North Bend",
      citizen: "Rohan Varma"
    },
    {
      text: "Stagnant black water on College Road for 4 days. Bad smell and heavy mosquito breeding.",
      lat: 28.5458,
      lon: 77.1921,
      address: "College Road Block C Enclave",
      citizen: "Sunita Rao"
    },

    // --- DUPLICATE PAIR: Ring Road Pothole ---
    {
      text: "Massive dangerous pothole on Ring Road near Metro Pillar 42 causing vehicle rim damage.",
      lat: 28.6289,
      lon: 77.2065,
      address: "Pillar 42, Outer Ring Road",
      citizen: "Vikram Malhotra",
      phone: "+91 99991 22334"
    },
    {
      text: "Deep crater in road asphalt right beside Metro Pillar 42. Two wheelers losing balance.",
      lat: 28.6288,
      lon: 77.2066,
      address: "Metro Pillar 42, Ring Road Northbound",
      citizen: "Karan Johar"
    },

    // --- CRITICAL LIFE SAFETY RISKS ---
    {
      text: "Exposed live electrical cable hanging down at eye level near District Hospital OPD entrance with spark risk.",
      lat: 28.6138,
      lon: 77.2091,
      address: "District Govt Hospital Gate 2 OPD",
      citizen: "Dr. Ananya Roy",
      phone: "+91 98221 00998"
    },
    {
      text: "Electrical transformer sparking continuously and releasing black smoke near St Marks school boundary wall.",
      lat: 28.6320,
      lon: 77.2180,
      address: "St. Marks School Gate, Patel Nagar",
      citizen: "Principal Verma",
      phone: "+91 98334 55667"
    },
    {
      text: "Open storm drain manhole with no warning barricade in middle of unlit market walkway causing fatal danger.",
      lat: 28.6505,
      lon: 77.2301,
      address: "Chandni Chowk Main Walkway Lane 2",
      citizen: "Mohd. Tariq"
    },

    // --- ROUTINE & SANITATION GRIEVANCES ---
    {
      text: "Garbage bin overflowing with plastic and organic waste near community center emitting foul stench.",
      lat: 28.5800,
      lon: 77.2200,
      address: "Block 5 Community Center, Lodhi Colony",
      citizen: "Harish Gupta"
    },
    {
      text: "Streetlight timer broken, light remains on throughout noon but stays pitch dark all night.",
      lat: 28.6010,
      lon: 77.2050,
      address: "Pocket B Residential Colony",
      citizen: "Meenakshi Das"
    },
    {
      text: "Dead tree branches fell on the footpath blocking elderly morning walkers after thunderstorm.",
      lat: 28.5900,
      lon: 77.2150,
      address: "Green Park Extension Lane 4",
      citizen: "Col. S. Bakshi"
    }
  ];

  // Scale up to 40 records with realistic geographic scatter and city spread
  const fullList: typeof baseSamples = [];
  for (let i = 0; i < 40; i++) {
    const b = baseSamples[i % baseSamples.length];
    if (i < baseSamples.length) {
      fullList.push(b);
    } else {
      const jitterLat = (i * 0.0014) - 0.02;
      const jitterLon = (i * 0.0011) - 0.015;
      fullList.push({
        text: `${b.text} (City Sector Zone ${i + 1})`,
        lat: Number((b.lat + jitterLat).toFixed(6)),
        lon: Number((b.lon + jitterLon).toFixed(6)),
        address: `${b.address} - Zone ${i + 1}`,
        citizen: `Citizen Reporter #${i + 1}`,
        phone: `+91 98${i}00 ${1000 + i}`
      });
    }
  }

  const complaints: Complaint[] = [];
  const auditLogs: AuditLog[] = [];

  fullList.forEach((item, index) => {
    const id = `cmp-seed-${1000 + index}`;
    const trackingCode = (0x800000 + index * 1337).toString(16).toUpperCase();
    const tracking_id = `CIV-${trackingCode.padStart(8, '0')}`;

    const { category, assignedDept, summary } = analyzeText(item.text);
    const { level, score, explanation } = calculateExplainablePriority(item.text, category, item.lat, item.lon);

    // Duplicate check against previously inserted records
    const dupResult = checkDuplicate(item.text, item.lat, item.lon, complaints);

    // Assign varied realistic status to simulate active operations
    let status: Complaint['status'] = 'SUBMITTED';
    if (index % 5 === 0) status = 'RESOLVED';
    else if (index % 3 === 0) status = 'IN_PROGRESS';
    else if (index % 2 === 0) status = 'ASSIGNED';

    const complaint: Complaint = {
      id,
      tracking_id,
      citizen_name: item.citizen,
      citizen_phone: item.phone || 'N/A',
      description: item.text,
      image_url: index === 0 
        ? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
        : (index === 7 ? 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80' : undefined),
      category,
      latitude: item.lat,
      longitude: item.lon,
      address_text: item.address,
      ai_summary: summary,
      ai_category: category,
      priority: level,
      priority_score: score,
      priority_explanation: explanation,
      is_duplicate: dupResult.isDuplicate,
      duplicate_of_id: dupResult.duplicateOfId,
      duplicate_confidence: dupResult.confidence,
      status,
      assigned_department_id: assignedDept,
      official_notes: status === 'RESOLVED' 
        ? 'Field inspection verified and remediation work executed by authorized engineer.'
        : (status === 'IN_PROGRESS' ? 'Crew actively deployed on site with heavy machinery.' : undefined),
      created_at: new Date(Date.now() - (40 - index) * 3600000).toISOString(),
      updated_at: new Date(Date.now() - (index * 600000)).toISOString()
    };

    complaints.push(complaint);

    // Initial audit log
    auditLogs.push({
      id: `log-${complaint.id}-1`,
      complaint_id: complaint.id,
      old_status: 'NONE',
      new_status: 'SUBMITTED',
      changed_by: 'Citizen Intake System',
      notes: 'Grievance submitted and triaged automatically via AI engine.',
      timestamp: complaint.created_at
    });

    if (complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED') {
      auditLogs.push({
        id: `log-${complaint.id}-2`,
        complaint_id: complaint.id,
        old_status: 'SUBMITTED',
        new_status: 'ASSIGNED',
        changed_by: 'Authority Command Center',
        notes: `Assigned priority dispatch to ${assignedDept}.`,
        timestamp: new Date(new Date(complaint.created_at).getTime() + 1800000).toISOString()
      });
    }

    if (complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED') {
      auditLogs.push({
        id: `log-${complaint.id}-3`,
        complaint_id: complaint.id,
        old_status: 'ASSIGNED',
        new_status: 'IN_PROGRESS',
        changed_by: 'Field Dispatch Lead',
        notes: 'Emergency unit arrived on site; remediation work underway.',
        timestamp: new Date(new Date(complaint.created_at).getTime() + 3600000).toISOString()
      });
    }

    if (complaint.status === 'RESOLVED') {
      auditLogs.push({
        id: `log-${complaint.id}-4`,
        complaint_id: complaint.id,
        old_status: 'IN_PROGRESS',
        new_status: 'RESOLVED',
        changed_by: 'Chief Municipal Officer',
        notes: 'Final quality check passed. Issue marked resolved and archived.',
        timestamp: complaint.updated_at
      });
    }
  });

  return { complaints, auditLogs };
}
