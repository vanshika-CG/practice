import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import MissingPersons from './pages/MissingPersons';
import CameraFeeds from './pages/CameraFeeds';
import Heatmap from './pages/Heatmap';
import Reports from './pages/Reports';
import AgeProgress from './pages/AgeProgress';
import { LayoutDashboard, Users, Video, Map, FileWarning, ArrowUpRight, AlertTriangle, X } from 'lucide-react';
import './index.css';

export const socket = io('http://localhost:3000'); // Export for other components to use

function App() {
  const [sysAlert, setSysAlert] = useState(null);

  useEffect(() => {
    socket.on('new-alert', (alert) => {
      setSysAlert(alert);
      // Auto-hide after 8 seconds
      setTimeout(() => setSysAlert(null), 8000);
    });
    return () => socket.off('new-alert');
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="icon-cyan stat-icon" style={{ width: 40, height: 40, borderRadius: 8 }}>
              <AlertTriangle size={24} />
            </div>
            <span>FindMe AI</span>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/missing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> Registry
            </NavLink>
            <NavLink to="/camera" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Video size={20} /> Live Feeds
            </NavLink>
            <NavLink to="/heatmap" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Map size={20} /> Heatmap
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileWarning size={20} /> Citizen Reports
            </NavLink>
            <NavLink to="/age-progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ArrowUpRight size={20} /> Age Progress
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/missing" element={<MissingPersons />} />
            <Route path="/camera" element={<CameraFeeds />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/age-progress" element={<AgeProgress />} />
          </Routes>
        </main>

        {/* Global Match Alert */}
        {sysAlert && (
          <div className="sys-alert-toast">
            <div className="stat-icon icon-pink" style={{ background: '#ff0055', color: '#fff' }}>
              <AlertTriangle size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#ff0055', marginBottom: 4, fontFamily: 'Outfit' }}>URGENT MATCH DETECTED</h3>
              <p style={{ margin: 0, fontWeight: 600 }}>Case ID: {sysAlert.caseId}</p>
              <div style={{ marginTop: 8, fontSize: 14, color: '#ccc' }}>
                <div><strong>Confidence:</strong> {sysAlert.confidence}%</div>
                <div><strong>Location:</strong> {sysAlert.location || sysAlert.cameraId}</div>
                <div><strong>Time:</strong> {sysAlert.timestamp}</div>
              </div>
            </div>
            <button onClick={() => setSysAlert(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', alignSelf: 'flex-start' }}>
              <X size={24} />
            </button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;