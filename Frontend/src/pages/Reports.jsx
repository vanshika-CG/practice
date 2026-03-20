import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileUp, Search, Eye, AlertTriangle } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/reports');
      setReports(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    try {
      await axios.post('http://localhost:3000/api/reports', formData);
      alert('Report submitted! Our AI has analyzed it.');
      fetchReports();
      e.target.reset();
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Citizen Sighting Reports</h1>
          <p className="page-subtitle">Public submissions cross-referenced with AI Database</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Submit Report Form */}
        <div className="glass-panel" style={{ alignSelf: 'start' }}>
          <h2><FileUp size={20} style={{ display: 'inline', color: 'var(--accent-cyan)' }} /> File a Sighting Report</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
            Upload a photo of a suspected missing person. Our advanced facial recognition engine will immediately scan the national database.
          </p>
          <form onSubmit={handleSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Your Name (Optional)</label>
              <input name="submitterName" className="form-control" placeholder="Anonymous" />
            </div>
            <div>
              <label>Location of Sighting</label>
              <input name="location" className="form-control" required placeholder="E.g., Central Park Near Cafe" />
            </div>
            <div>
              <label>Additional Details</label>
              <textarea name="description" className="form-control" style={{ resize: 'none' }} placeholder="What were they wearing?" />
            </div>
            <div>
              <label>Upload Photo Evidence</label>
              <input name="photo" type="file" required accept="image/*" className="form-control" style={{ border: '1px dashed var(--accent-cyan)' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ justifyContent: 'center', marginTop: 10 }}>
              {submitting ? 'Analyzing via DeepFace AI...' : 'Submit to Authorities'}
            </button>
          </form>
        </div>

        {/* Processed Reports List */}
        <div>
          <div className="glass-panel">
             <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
               <Search size={20} color="var(--accent-pink)" /> Processed Reports History
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '600px', overflowY: 'auto' }}>
               {reports.map((r, i) => (
                 <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${r.matchedCaseId ? 'var(--accent-pink)' : 'var(--text-muted)'}`, borderRadius: '0 8px 8px 0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                     <strong style={{ fontSize: 16 }}>{r.location}</strong>
                     <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleString()}</span>
                   </div>
                   <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 12 }}>{r.description || 'No description provided.'}</p>
                   
                   <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                     <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img src={`http://localhost:3000/reports_db/${r.photoFilename}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Report Evidence" onError={(e) => { e.target.src = 'https://via.placeholder.com/80' }}/>
                     </div>
                     <div style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                       {r.matchedCaseId ? (
                         <>
                           <div style={{ color: 'var(--accent-pink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <AlertTriangle size={15} /> AI MATCH FOUND: {r.matchedCaseId}
                           </div>
                           <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>Confidence Score: {r.confidence}%</div>
                         </>
                       ) : (
                         <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                           <Eye size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 
                           No Active Match Detected
                         </div>
                       )}
                     </div>
                   </div>
                   
                   <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>Submitted By: {r.submitterName || 'Anonymous'}</div>
                 </div>
               ))}
               {reports.length === 0 && <p style={{ color: '#94a3b8' }}>No reports logged yet.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
