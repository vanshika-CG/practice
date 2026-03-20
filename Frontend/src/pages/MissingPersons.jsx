import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Calendar, MapPin } from 'lucide-react';

export default function MissingPersons() {
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/missing');
      setPersons(res.data);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const oldText = btn.innerText;
    btn.innerText = "Registering (Updating AI Cache)...";
    btn.disabled = true;

    try {
      const formData = new FormData(e.target);
      await axios.post('http://localhost:3000/api/missing', formData);
      alert('Missing person registered and indexed by AI!');
      setShowModal(false);
      fetchPersons();
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    } finally {
      btn.innerText = oldText;
      btn.disabled = false;
    }
  };

  const filtered = persons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.caseId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Missing Persons Registry</h1>
          <p className="page-subtitle">Central database for facial recognition matching</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Register New Case
        </button>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative', width: '300px' }}>
        <Search size={20} style={{ position: 'absolute', top: 12, left: 14, color: '#64748b' }} />
        <input 
          type="text" 
          placeholder="Search by Name or Case ID" 
          className="form-control" 
          style={{ paddingLeft: 44 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid-3" style={{ gridAutoRows: 'minmax(min-content, max-content)' }}>
        {filtered.map(p => (
          <div className="glass-panel" key={p.caseId} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 260, overflow: 'hidden', background: '#000' }}>
              <img 
                src={`http://localhost:3000/database/${p.photoFilename}`} 
                alt={p.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Photo' }}
              />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>{p.name}</h3>
                <span className="badge badge-medium">{p.caseId}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.description || 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#0088ff" /> Age: {p.age || 'Unknown'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#00f0ff" /> Last seen: {p.lastLocation || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2 style={{ marginBottom: 24, paddingRight: 30 }}>Register Missing Person</h2>
            
            <form onSubmit={handleUpload}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" className="form-control" required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Case ID</label>
                  <input name="caseId" className="form-control" required placeholder="MP-105" />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label>Age</label>
                  <input name="age" type="number" className="form-control" placeholder="Years old" />
                </div>
                <div className="form-group">
                  <label>Last Known Location</label>
                  <input name="lastLocation" className="form-control" placeholder="City or Landmark" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Physical Description</label>
                <textarea name="description" className="form-control" style={{ resize: 'none', height: 80 }} placeholder="Height, clothes, distinctions"></textarea>
              </div>

              <div className="form-group">
                <label>High-Quality Clear Photo (Important for AI)</label>
                <input name="photo" type="file" accept="image/*" className="form-control" required />
              </div>

              <button type="submit" id="register-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                Upload & Register to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
