import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, HotspotCluster } from '../types/civic';

interface CivicMapProps {
  mode: 'citizen' | 'admin' | 'mini';
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  selectedLat?: number;
  selectedLon?: number;
  onLocationSelect?: (lat: number, lon: number) => void;
  complaints?: Complaint[];
  hotspots?: HotspotCluster[];
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectHotspot?: (hotspot: HotspotCluster) => void;
  height?: string;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  mode,
  centerLat = 28.6139,
  centerLon = 77.2090,
  zoom = 13,
  selectedLat,
  selectedLon,
  onLocationSelect,
  complaints = [],
  hotspots = [],
  onSelectComplaint,
  onSelectHotspot,
  height = '420px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map click in citizen mode
      if (mode === 'citizen') {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lon = Number(e.latlng.lng.toFixed(6));
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          }
          if (onLocationSelect) {
            onLocationSelect(lat, lon);
          }
        });
      }
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [mode]);

  // Update citizen marker
  useEffect(() => {
    if (mode !== 'citizen' || !mapInstanceRef.current) return;

    const lat = selectedLat ?? centerLat;
    const lon = selectedLon ?? centerLon;

    // Create custom pin icon
    const pinIcon = L.divIcon({
      className: 'custom-citizen-pin',
      html: `
        <div style="background-color: #2563eb; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); border: 2px solid white;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    });

    if (!markerRef.current) {
      const marker = L.marker([lat, lon], {
        draggable: true,
        icon: pinIcon
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        }
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([lat, lon]);
    }
  }, [mode, selectedLat, selectedLon, centerLat, centerLon, onLocationSelect]);

  // Update admin mode layers (complaints & hotspots)
  useEffect(() => {
    if (mode !== 'admin' || !mapInstanceRef.current) return;

    // 1. Draw Hotspots
    if (hotspotsLayerRef.current) {
      hotspotsLayerRef.current.clearLayers();

      hotspots.forEach(h => {
        const circle = L.circle([h.center_lat, h.center_lon], {
          radius: h.radius_meters || 350,
          color: '#dc2626',
          fillColor: '#ef4444',
          fillOpacity: 0.28,
          weight: 2,
          dashArray: '4, 4'
        });

        circle.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 4px; color: #dc2626; font-weight: 700; margin-bottom: 4px;">
              <span>🚨</span>
              <span>GEOSPATIAL HOTSPOT ALERT</span>
            </div>
            <div><strong>Incidents Clustered:</strong> ${h.complaint_count} reports</div>
            <div><strong>Dominant Hazard:</strong> ${h.dominant_issue}</div>
            <div style="margin-top: 6px; padding: 6px; background: #fef2f2; border-left: 3px solid #dc2626; font-size: 11px; color: #991b1b;">
              ${h.action_brief}
            </div>
          </div>
        `);

        circle.on('click', () => {
          if (onSelectHotspot) onSelectHotspot(h);
        });

        hotspotsLayerRef.current?.addLayer(circle);
      });
    }

    // 2. Draw Complaints
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      complaints.forEach(c => {
        const color =
          c.priority === 'CRITICAL'
            ? '#dc2626'
            : c.priority === 'HIGH'
            ? '#ea580c'
            : c.priority === 'MEDIUM'
            ? '#d97706'
            : '#16a34a';

        const marker = L.circleMarker([c.latitude, c.longitude], {
          radius: c.priority === 'CRITICAL' ? 7.5 : 6,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95
        });

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 13px; min-width: 200px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-family: monospace; font-weight: bold; color: #1e40af;">${c.tracking_id}</span>
              <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${c.priority} (${c.priority_score})</span>
            </div>
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${c.category}</div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">${c.ai_summary}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <span>Status: <b>${c.status}</b></span>
              <span>${c.is_duplicate ? '⚠️ Duplicate' : '✓ Unique'}</span>
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(c);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [mode, complaints, hotspots, onSelectComplaint, onSelectHotspot]);

  // Mini mode single marker
  useEffect(() => {
    if (mode !== 'mini' || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView([centerLat, centerLon], zoom);
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      const marker = L.marker([centerLat, centerLon]).addTo(markersLayerRef.current);
      marker.bindPopup(`<b>Incident Location</b><br>Lat: ${centerLat}, Lon: ${centerLon}`);
    }
  }, [mode, centerLat, centerLon, zoom]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 10 }} />
      {mode === 'citizen' && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-slate-700 z-[1000] border border-slate-200 pointer-events-none">
          📍 Click map or drag pin to position grievance
        </div>
      )}
      {mode === 'admin' && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-xs z-[1000] border border-slate-700 flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
            <span className="w-3 h-3 rounded-full border border-dashed border-red-500 bg-red-500/20"></span>
            <span>Hotspot (350m)</span>
          </div>
        </div>
      )}
    </div>
  );
};
