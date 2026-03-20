import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Random offsets for simulated lat/longs
const CENTER = [28.6139, 77.2090]; // New Delhi center for example

export default function Heatmap() {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/detections');
      // Adding simulated lat/longs based on location name for demo
      const enriched = res.data.map(d => {
        let lat = CENTER[0] + (Math.random() - 0.5) * 0.1;
        let lng = CENTER[1] + (Math.random() - 0.5) * 0.1;
        return { ...d, lat, lng };
      });
      setDetections(enriched);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Location Heatmap</h1>
          <p className="page-subtitle">Map-based visualization of recent detection activity</p>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: '600px', display: 'flex' }}>
        <MapContainer center={CENTER} zoom={12} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}>
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />
          {detections.map((det, i) => (
            <CircleMarker 
              key={i} 
              center={[det.lat, det.lng]} 
              radius={det.confidence > 80 ? 12 : 8}
              fillColor={det.confidence > 80 ? '#00f0ff' : '#0088ff'}
              color="transparent"
              fillOpacity={0.6}
            >
              <Popup>
                 <div style={{ color: '#000', fontFamily: 'Inter' }}>
                   <div style={{ fontWeight: 'bold' }}>Match: {det.caseId}</div>
                   <div>Location: {det.location}</div>
                   <div>Confidence: {det.confidence}%</div>
                   <div>Time: {new Date(det.timestamp).toLocaleTimeString()}</div>
                 </div>
              </Popup>
            </CircleMarker>
          ))}
          <MapCenterer detections={detections} />
        </MapContainer>
      </div>
    </div>
  );
}

// Fit map to markers
function MapCenterer({ detections }) {
  const map = useMap();
  useEffect(() => {
    if (detections.length > 0) {
      // For demo, just let it stay at CENTER
    }
  }, [detections, map]);
  return null;
}
