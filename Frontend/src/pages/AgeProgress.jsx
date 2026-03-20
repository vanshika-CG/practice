import React, { useState } from 'react';
import axios from 'axios';
import { ArrowUpRight, Clock, UserSquare2, RefreshCcw } from 'lucide-react';

export default function AgeProgress() {
  const [caseId, setCaseId] = useState('');
  const [targetAge, setTargetAge] = useState(25);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!caseId) return setError('Please enter a Case ID');
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('http://localhost:3000/api/age-progress', {
        caseId,
        targetAge
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Age Progression AI (Beta)</h1>
          <p className="page-subtitle">Generative AI simulation for long-term missing cases</p>
        </div>
        <div className="badge badge-high">GAN Engine Active</div>
      </div>

      <div className="grid-2">
        <div className="glass-panel" style={{ alignSelf: 'start' }}>
           <h3 style={{ marginBottom: 16 }}>Simulation Parameters</h3>
           
           <div className="form-group">
              <label>Missing Person Case ID</label>
              <input className="form-control" placeholder="E.g., MP-001" value={caseId} onChange={e => setCaseId(e.target.value)} />
           </div>
           
           <div className="form-group">
              <label>Target Prediction Age: {targetAge} Years</label>
              <input type="range" min="5" max="80" value={targetAge} onChange={e => setTargetAge(e.target.value)} style={{ width: '100%', marginTop: 8 }} />
           </div>
           
           {error && <div style={{ color: 'var(--accent-pink)', marginBottom: 16 }}>{error}</div>}

           <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
             {loading ? <RefreshCcw className="pulse-spin" size={20} /> : <ArrowUpRight size={20} />}
             {loading ? 'Synthesizing Biological Growth...' : 'Generate Prediction'}
           </button>
           
           <style>{`
             .pulse-spin { animation: spin 1.5s linear infinite; }
             @keyframes spin { 100% { transform: rotate(360deg); } }
           `}</style>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <h3 style={{ marginBottom: 16 }}>Generation Output</h3>
          
          <div style={{ flex: 1, border: '1px dashed var(--border-glass)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 20 }}>
            {!loading && !result && (
              <>
                <UserSquare2 size={48} color="var(--text-muted)" />
                <div style={{ color: 'var(--text-secondary)' }}>Awaiting generation parameters</div>
              </>
            )}
            
            {loading && (
              <>
                <div style={{ width: '80%', height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                   <div style={{ width: '50%', height: '100%', background: 'var(--accent-cyan)', animation: 'slideBar 2s infinite ease-in-out' }}></div>
                </div>
                <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>Applying facial aging markers...</div>
                <style>{`
                  @keyframes slideBar { 0% { transform: translateX(-100%); width: 30%; } 50% { width: 80%; } 100% { transform: translateX(200%); width: 30%; } }
                `}</style>
              </>
            )}
            
            {result && (
               <div style={{ width: '100%', animation: 'fadeIn 1s forwards' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 140, height: 160, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                         <img src={`http://localhost:3000/database/${result.originalPhoto}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 13 }}>Original Photo</div>
                    </div>
                    
                    <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)' }}></div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 160, height: 190, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--accent-cyan)', boxShadow: 'var(--shadow-neon)', filter: 'saturate(1.2)' }}>
                         {/* We modify the image visually via CSS for demo purposes to simulate aging (e.g. grayscale/sepia mapping + noise) */}
                         <img src={`http://localhost:3000/database/${result.predictedPhoto}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `contrast(1.1) brightness(0.9) grayscale(${Math.min(valToGray(targetAge), 0.3)})` }} />
                      </div>
                      <div style={{ marginTop: 8, color: 'var(--accent-cyan)', fontWeight: 600 }}>Predicted: Age {result.targetAge}</div>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function valToGray(age) {
  return age > 40 ? 0.3 : 0;
}
