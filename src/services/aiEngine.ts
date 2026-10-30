import { Department, DepartmentId, HotspotCluster, PriorityExplanation, PriorityLevel } from '../types/civic';

export const DEPARTMENTS: Record<DepartmentId, Department> = {
  DEPT_ROADS: {
    id: 'DEPT_ROADS',
    name: 'Road Infrastructure & Highways',
    escalationEmail: 'roads@civic.gov.in',
    iconName: 'Construction',
    color: '#ea580c'
  },
  DEPT_ELEC: {
    id: 'DEPT_ELEC',
    name: 'Electrical Inspectorate & Power Grid',
    escalationEmail: 'power@civic.gov.in',
    iconName: 'Zap',
    color: '#dc2626'
  },
  DEPT_DRAIN: {
    id: 'DEPT_DRAIN',
    name: 'Municipal Drainage & Flood Management',
    escalationEmail: 'drainage@civic.gov.in',
    iconName: 'Droplets',
    color: '#0284c7'
  },
  DEPT_SAN: {
    id: 'DEPT_SAN',
    name: 'Solid Waste Management & Sanitation',
    escalationEmail: 'sanitation@civic.gov.in',
    iconName: 'Trash2',
    color: '#16a34a'
  },
  DEPT_GEN: {
    id: 'DEPT_GEN',
    name: 'General Municipal Operations',
    escalationEmail: 'helpdesk@civic.gov.in',
    iconName: 'Building2',
    color: '#475569'
  }
};

const KEYWORD_TAXONOMY: Record<DepartmentId, string[]> = {
  DEPT_ELEC: ['wire', 'electric', 'pole', 'spark', 'shock', 'blackout', 'transformer', 'cable', 'power', 'electrocution', 'voltage'],
  DEPT_ROADS: ['pothole', 'crater', 'asphalt', 'road', 'pavement', 'divider', 'accident', 'cave-in', 'manhole', 'tar', 'sidewalk'],
  DEPT_DRAIN: ['waterlogging', 'drain', 'sewage', 'flood', 'overflow', 'gutter', 'clogged', 'monsoon', 'stagnant', 'culvert'],
  DEPT_SAN: ['garbage', 'dump', 'trash', 'waste', 'bin', 'smell', 'carcass', 'debris', 'litter', 'filth', 'stench'],
  DEPT_GEN: ['street', 'park', 'tree', 'signboard', 'bench', 'civic', 'encroachment']
};

const CATEGORY_MAP: Record<DepartmentId, string> = {
  DEPT_ELEC: 'Electrical Hazard',
  DEPT_ROADS: 'Road Infrastructure Damage',
  DEPT_DRAIN: 'Waterlogging & Drainage Failure',
  DEPT_SAN: 'Sanitation & Waste Overflow',
  DEPT_GEN: 'General Civic Issue'
};

const SEVERITY_KEYWORDS: Record<string, [string[], number]> = {
  FATAL_DANGER: [
    ['spark', 'shock', 'live wire', 'open manhole', 'deep ditch', 'collapsed', 'gas leak', 'electrocution', 'high voltage', 'fire'],
    40
  ],
  HIGH_IMPACT: [
    ['hospital', 'school', 'main road', 'highway', 'bus stop', 'paralyzed', 'fire', 'emergency', 'clinic', 'railway', 'station'],
    25
  ],
  BLOCKAGE: [
    ['submerged', 'stranded', 'impassable', 'overflowing', 'blocked', 'cut off', 'flooded'],
    15
  ]
};

export const VULNERABLE_INFRASTRUCTURE = [
  { name: 'District Govt Hospital', lat: 28.6139, lon: 77.2090, boost: 20 },
  { name: 'Central Railway Station Junction', lat: 28.6448, lon: 77.2167, boost: 15 },
  { name: 'St. Marks Public School', lat: 28.6320, lon: 77.2180, boost: 15 }
];

export function analyzeText(text: string): { category: string; assignedDept: DepartmentId; summary: string } {
  const cleanText = text.toLowerCase();
  const scores: Record<DepartmentId, number> = {
    DEPT_ELEC: 0,
    DEPT_ROADS: 0,
    DEPT_DRAIN: 0,
    DEPT_SAN: 0,
    DEPT_GEN: 0
  };

  for (const [dept, words] of Object.entries(KEYWORD_TAXONOMY) as [DepartmentId, string[]][]) {
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(cleanText)) {
        scores[dept] = (scores[dept] || 0) + 1;
      }
    }
  }

  let bestDept: DepartmentId = 'DEPT_GEN';
  let maxScore = 0;
  for (const [dept, count] of Object.entries(scores) as [DepartmentId, number][]) {
    if (count > maxScore) {
      maxScore = count;
      bestDept = dept;
    }
  }

  const category = CATEGORY_MAP[bestDept];

  // Extractive summary
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  let summary = sentences[0] || text;
  if (summary.length > 115) {
    summary = summary.substring(0, 112) + '...';
  }

  return { category, assignedDept: bestDept, summary };
}

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000.0; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dphi = toRad(lat2 - lat1);
  const dlambda = toRad(lon2 - lon1);

  const a =
    Math.sin(dphi / 2.0) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2.0) ** 2;
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

  return R * c;
}

// Tokenize and compute TF-IDF cosine similarity
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'and', 'or', 'is', 'are', 'was', 'were',
    'it', 'of', 'for', 'with', 'by', 'to', 'from', 'near', 'nearer', 'has', 'have'
  ]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));
}

function calculateCosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const vocab = Array.from(new Set([...tokens1, ...tokens2]));
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();

  for (const t of tokens1) freq1.set(t, (freq1.get(t) || 0) + 1);
  for (const t of tokens2) freq2.set(t, (freq2.get(t) || 0) + 1);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const word of vocab) {
    const v1 = freq1.get(word) || 0;
    const v2 = freq2.get(word) || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

export function checkDuplicate(
  newDesc: string,
  newLat: number,
  newLon: number,
  existingComplaints: Array<{ id: string; description: string; latitude: number; longitude: number; status?: string }>,
  geoThresholdMeters = 80.0,
  textSimilarityThreshold = 0.40
): { isDuplicate: boolean; duplicateOfId?: string; confidence: number; matchedComplaint?: any; distanceMeters?: number } {
  if (!existingComplaints || existingComplaints.length === 0) {
    return { isDuplicate: false, confidence: 0 };
  }

  // 1. Proximity candidates
  const candidates: Array<{ comp: any; dist: number }> = [];
  for (const comp of existingComplaints) {
    if (comp.status === 'RESOLVED') continue;
    const dist = haversineDistanceMeters(newLat, newLon, comp.latitude, comp.longitude);
    if (dist <= geoThresholdMeters) {
      candidates.push({ comp, dist });
    }
  }

  if (candidates.length === 0) {
    return { isDuplicate: false, confidence: 0 };
  }

  // 2. Cosine similarity
  let bestSim = 0;
  let bestMatch: any = null;
  let bestDist = 0;

  for (const cand of candidates) {
    const sim = calculateCosineSimilarity(newDesc, cand.comp.description);
    if (sim > bestSim) {
      bestSim = sim;
      bestMatch = cand.comp;
      bestDist = cand.dist;
    }
  }

  if (!bestMatch) {
    return { isDuplicate: false, confidence: 0 };
  }

  // Hybrid confidence: 65% text semantics + 35% spatial proximity
  const proximityFactor = Math.max(0, 1.0 - bestDist / geoThresholdMeters);
  const compositeConfidence = Math.round(((0.65 * bestSim) + (0.35 * proximityFactor)) * 100) / 100;

  if (bestSim >= textSimilarityThreshold) {
    return {
      isDuplicate: true,
      duplicateOfId: bestMatch.id,
      confidence: compositeConfidence,
      matchedComplaint: bestMatch,
      distanceMeters: Math.round(bestDist)
    };
  }

  return { isDuplicate: false, confidence: compositeConfidence };
}

export function calculateExplainablePriority(
  text: string,
  category: string,
  lat: number,
  lon: number
): { level: PriorityLevel; score: number; explanation: PriorityExplanation } {
  let score = 15.0; // Baseline score
  const factors: string[] = [];
  const cleanText = text.toLowerCase();

  // Factor 1: Category base hazard weight
  const catWeights: Record<string, number> = {
    'Electrical Hazard': 35,
    'Waterlogging & Drainage Failure': 25,
    'Road Infrastructure Damage': 20,
    'Sanitation & Waste Overflow': 10,
    'General Civic Issue': 5
  };
  const catWeight = catWeights[category] || 10;
  score += catWeight;
  factors.push(`Base hazard severity weight for '${category}': +${catWeight} pts`);

  // Factor 2: Severity keywords
  for (const [key, [words, weight]] of Object.entries(SEVERITY_KEYWORDS)) {
    const matched = words.filter(w => cleanText.includes(w));
    if (matched.length > 0) {
      score += weight;
      factors.push(`Urgent safety hazard triggers identified (${matched.slice(0, 3).join(', ')}): +${weight} pts`);
      break; // Apply primary severity boost once
    }
  }

  // Factor 3: Proximity to vulnerable infrastructure (< 500m)
  for (const spot of VULNERABLE_INFRASTRUCTURE) {
    const dist = haversineDistanceMeters(lat, lon, spot.lat, spot.lon);
    if (dist < 500) {
      score += spot.boost;
      factors.push(`Located within ${Math.round(dist)}m of critical facility (${spot.name}): +${spot.boost} pts`);
      break;
    }
  }

  score = Math.min(100.0, Math.round(score * 10) / 10);

  let level: PriorityLevel = 'MEDIUM';
  if (score >= 75.0) {
    level = 'CRITICAL';
  } else if (score >= 50.0) {
    level = 'HIGH';
  } else if (score >= 30.0) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  const explanation: PriorityExplanation = {
    calculated_score: score,
    classification: level,
    justification_factors: factors,
    rubric_version: 'v1.0-civic-audit-compliant'
  };

  return { level, score, explanation };
}

// DBSCAN Spatial Clustering
export function detectHotspots(
  complaintRecords: Array<{ id: string; latitude: number; longitude: number; category: string; description: string; status?: string }>,
  epsMeters = 350.0,
  minSamples = 3
): HotspotCluster[] {
  const activeRecords = complaintRecords.filter(c => c.status !== 'RESOLVED');
  if (activeRecords.length < minSamples) {
    return [];
  }

  const n = activeRecords.length;
  const visited = new Array(n).fill(false);
  const clusterAssignments = new Array(n).fill(-1); // -1 = noise
  let clusterId = 0;

  function regionQuery(pointIdx: number): number[] {
    const neighbors: number[] = [];
    const p = activeRecords[pointIdx];
    for (let i = 0; i < n; i++) {
      const dist = haversineDistanceMeters(p.latitude, p.longitude, activeRecords[i].latitude, activeRecords[i].longitude);
      if (dist <= epsMeters) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);
    if (neighbors.length < minSamples) {
      clusterAssignments[i] = -1; // Noise
    } else {
      clusterAssignments[i] = clusterId;
      const queue = [...neighbors];
      let qi = 0;

      while (qi < queue.length) {
        const neighborIdx = queue[qi++];
        if (!visited[neighborIdx]) {
          visited[neighborIdx] = true;
          const nextNeighbors = regionQuery(neighborIdx);
          if (nextNeighbors.length >= minSamples) {
            for (const nn of nextNeighbors) {
              if (!queue.includes(nn)) {
                queue.push(nn);
              }
            }
          }
        }
        if (clusterAssignments[neighborIdx] === -1 || clusterAssignments[neighborIdx] === undefined) {
          clusterAssignments[neighborIdx] = clusterId;
        }
      }
      clusterId++;
    }
  }

  // Aggregate clusters
  const clustersMap = new Map<number, typeof activeRecords>();
  for (let i = 0; i < n; i++) {
    const cid = clusterAssignments[i];
    if (cid >= 0) {
      if (!clustersMap.has(cid)) {
        clustersMap.set(cid, []);
      }
      clustersMap.get(cid)!.push(activeRecords[i]);
    }
  }

  const hotspots: HotspotCluster[] = [];
  for (const [cid, items] of clustersMap.entries()) {
    const lats = items.map(it => it.latitude);
    const lons = items.map(it => it.longitude);
    const cats = items.map(it => it.category);

    // Dominant issue
    const counts = new Map<string, number>();
    for (const cat of cats) {
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    let dominant = cats[0];
    let maxC = 0;
    for (const [cat, c] of counts.entries()) {
      if (c > maxC) {
        maxC = c;
        dominant = cat;
      }
    }

    const centerLat = Number((lats.reduce((a, b) => a + b, 0) / items.length).toFixed(6));
    const centerLon = Number((lons.reduce((a, b) => a + b, 0) / items.length).toFixed(6));

    hotspots.push({
      cluster_id: cid,
      complaint_count: items.length,
      center_lat: centerLat,
      center_lon: centerLon,
      dominant_issue: dominant,
      complaint_ids: items.map(it => it.id),
      action_brief: `High density alert: ${items.length} incidents concentrated within ${Math.round(epsMeters)}m radius. Root cause primarily relates to ${dominant}. Immediate municipal field crew deployment recommended.`,
      radius_meters: epsMeters
    });
  }

  return hotspots;
}
