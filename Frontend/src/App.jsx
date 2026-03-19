import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Webcam from 'react-webcam';
import axios from 'axios';

const socket = io('http://localhost:3000');

function App() {
  const [missingList, setMissingList] = useState([]);
  const [detections, setDetections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const webcamRef = useRef(null);

  // Load data
  useEffect(() => {
    axios.get('http://localhost:3000/api/missing').then(res => setMissingList(res.data));
    axios.get('http://localhost:3000/api/detections').then(res => setDetections(res.data));
  }, []);

  // Real-time alerts
  useEffect(() => {
    socket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      alert(`🎉 MATCH FOUND!\nConfidence: ${alert.confidence}%\nCase: ${alert.caseId}`);
    });
    return () => socket.off('new-alert');
  }, []);

  // Camera detection every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          await axios.post('http://localhost:3000/api/detect', {
            image: screenshot,
            cameraId: 'Webcam-1'
          });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Upload form
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await axios.post('http://localhost:3000/api/missing', formData);
    alert('Missing person registered successfully!');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 FindMe AI - Missing Person Detection</h1>

      {/* Register Missing Person */}
      <div style={{ background: '#f0f0f0', padding: '20px', marginBottom: '20px' }}>
        <h2>1. Register Missing Person</h2>
        <form onSubmit={handleUpload}>
          <input name="name" placeholder="Name" required style={{ margin: '5px', padding: '8px' }} />
          <input name="caseId" placeholder="Case ID (e.g. MP001)" required style={{ margin: '5px', padding: '8px' }} />
          <input name="age" type="number" placeholder="Age" style={{ margin: '5px', padding: '8px' }} />
          <input name="description" placeholder="Description" style={{ margin: '5px', padding: '8px' }} />
          <input name="lastLocation" placeholder="Last Known Location" style={{ margin: '5px', padding: '8px' }} />
          <input name="photo" type="file" accept="image/*" required style={{ margin: '5px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white' }}>Upload & Register</button>
        </form>
      </div>

      {/* Live Camera */}
      <div style={{ background: '#e0f7fa', padding: '20px', marginBottom: '20px' }}>
        <h2>2. Live Camera Monitoring (Demo)</h2>
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '400px' }} />
        <p><strong>Walk in front of camera → See real-time alert!</strong></p>
      </div>

      {/* Live Alerts */}
      <div style={{ background: '#fff3cd', padding: '15px', marginBottom: '20px' }}>
        <h2>🚨 Live Alerts</h2>
        {alerts.map((a, i) => (
          <div key={i} style={{ padding: '10px', background: '#ffdddd', margin: '5px 0' }}>
            <strong>MATCH FOUND!</strong><br />
            Confidence: {a.confidence}% | Camera: {a.cameraId} | Time: {a.timestamp}
          </div>
        ))}
      </div>

      {/* Investigation Timeline */}
      <div>
        <h2>📋 Investigation Timeline</h2>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Time</th><th>Case ID</th><th>Confidence</th><th>Camera</th></tr></thead>
          <tbody>
            {detections.map((d, i) => (
              <tr key={i}>
                <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
                <td>{d.caseId}</td>
                <td>{d.confidence}%</td>
                <td>{d.cameraId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;