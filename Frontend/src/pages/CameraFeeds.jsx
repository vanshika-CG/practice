import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Video, ShieldAlert } from 'lucide-react';

export default function CameraFeeds() {
  const webcamRef = useRef(null);
  const [active, setActive] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let activePoll = true;
    
    const pollCamera = async () => {
      if (!activePoll || !active) return;
      
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          try {
            const res = await axios.post('http://localhost:3000/api/detect', {
              image: screenshot,
              cameraId: 'Camera 1 - Central Bus Station',
              location: 'Central Bus Station'
            });
            
            if (res.data.alert) {
               setLogs(prev => [`[${new Date().toLocaleTimeString()}] Match alert from Central Bus Station`, ...prev].slice(0, 10));
            }
          } catch (e) {
             // hide timeout/network errors during live polling to avoid console spam
          }
        }
      }
      
      // Wait 3 seconds before next poll
      if (activePoll && active) {
        setTimeout(pollCamera, 3000);
      }
    };

    if (active) {
      setTimeout(pollCamera, 2000);
    }
    
    return () => { activePoll = false; };
  }, [active]);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Live CCTVs & Scanners</h1>
          <p className="page-subtitle">Multi-camera real-time AI processing engines</p>
        </div>
        <button className={active ? "btn btn-alert" : "btn btn-primary"} onClick={() => setActive(!active)}>
          {active ? 'Stop System Processing' : 'Start System Processing'}
        </button>
      </div>

      <div className="grid-2">
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
              <Video size={18} color="var(--accent-cyan)" /> Camera 1 - Central Bus Station (Live Simulator)
            </div>
            {active && <div className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="dot" style={{width: 6, height: 6}}></div> LIVE AI</div>}
          </div>
          <div className="camera-feed" style={{ borderRadius: 0, border: 'none' }}>
            <Webcam 
              ref={webcamRef} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode: "user" }}
            />
            {active && (
              <div className="live-indicator">
                <ShieldAlert size={14} color="var(--accent-pink)" /> AI Active
              </div>
            )}
            {!active && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontWeight: 'bold' }}>
                OFFLINE
              </div>
            )}
          </div>
        </div>

        {/* Dummy Cameras for UI visualization */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: 0.6 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
               <Video size={18} color="var(--text-secondary)" /> Camera 2 - Railway Platform 4
            </div>
            <div className="badge" style={{ background: '#333' }}>STATIC</div>
          </div>
          <div className="camera-feed" style={{ borderRadius: 0, border: 'none', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#555' }}>[ FEED LOST / UNAVAILABLE ]</div>
          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ marginTop: 24 }}>
        <h3>Camera Activity Logs</h3>
        <div style={{ background: '#000', borderRadius: 8, padding: 16, marginTop: 12, height: 160, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13, color: '#0f0' }}>
            {logs.map((L, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{L}</div>
            ))}
            {!logs.length && <div style={{ opacity: 0.5 }}>Waiting for activity...</div>}
        </div>
      </div>
    </div>
  );
}
