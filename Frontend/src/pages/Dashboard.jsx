import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Radio, Target, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeCases: 0,
    matchesToday: 0,
    camerasActive: 3, // Mock active cameras
    reports: 0
  });

  const [detections, setDetections] = useState([]);

  useEffect(() => {
    // Load initial data
    const fetchDashboard = async () => {
      try {
        const [missRes, detRes, repRes] = await Promise.all([
          axios.get('http://localhost:3000/api/missing'),
          axios.get('http://localhost:3000/api/detections'),
          axios.get('http://localhost:3000/api/reports')
        ]);
        
        const today = new Date().toDateString();
        const matchesToday = detRes.data.filter(d => new Date(d.timestamp).toDateString() === today).length;

        setStats({
          activeCases: missRes.data.length,
          matchesToday,
          camerasActive: 3,
          reports: repRes.data.length
        });
        setDetections(detRes.data);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    };
    fetchDashboard();
    
    // Auto-refresh interval (for demo)
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Headquarters Dashboard</h1>
          <p className="page-subtitle">Real-time overview of search operations</p>
        </div>
      </div>

      <div className="grid-4">
        <div className="glass-panel stat-card">
          <div className="stat-icon icon-cyan"><Activity /></div>
          <div className="stat-info">
            <h4>Active Cases</h4>
            <div className="value">{stats.activeCases}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon icon-pink"><Target /></div>
          <div className="stat-info">
            <h4>Matches Today</h4>
            <div className="value">{stats.matchesToday}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon icon-green"><Radio /></div>
          <div className="stat-info">
            <h4>Live Cameras</h4>
            <div className="value">{stats.camerasActive}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon icon-yellow"><UserCheck /></div>
          <div className="stat-info">
            <h4>Citizen Reports</h4>
            <div className="value">{stats.reports}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: 20 }}>Recent Timeline Activity</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Match Confidence</th>
                  <th>Location</th>
                  <th>System / Source</th>
                </tr>
              </thead>
              <tbody>
                {detections.slice(0, 10).map((d, i) => (
                  <tr key={i}>
                    <td style={{ color: '#94a3b8' }}>
                      {new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </td>
                    <td>
                      <span className={`badge ${d.confidence > 85 ? 'badge-high' : d.confidence > 60 ? 'badge-medium' : 'badge-low'}`}>
                        {d.caseId} ({d.confidence}%)
                      </span>
                    </td>
                    <td>{d.location || 'Unknown Area'}</td>
                    <td>{d.cameraId}</td>
                  </tr>
                ))}
                {detections.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>No matches recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
           <h3 style={{ marginBottom: 20 }}>System Network Status</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div className="dot" style={{ background: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'none' }}></div>
                 <span>Main API Server</span>
               </div>
               <span style={{ color: '#00ff88' }}>Online</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div className="dot" style={{ background: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'none' }}></div>
                 <span>DeepFace AI Python Engine</span>
               </div>
               <span style={{ color: '#00ff88' }}>Online / Ready</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div className="dot" style={{ background: '#ffcc00', boxShadow: '0 0 10px #ffcc00', animation: 'none' }}></div>
                 <span>Database Sync</span>
               </div>
               <span style={{ color: '#ffcc00' }}>In Sync</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
