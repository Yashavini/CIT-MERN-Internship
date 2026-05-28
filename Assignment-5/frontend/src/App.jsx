import React, { useState, useEffect } from 'react';
import './app.css';

export default function App() {
  // Session Configuration Matrices
  const [token, setToken] = useState(localStorage.getItem('echoToken') || '');
  const [sessionUser, setSessionUser] = useState(localStorage.getItem('echoUser') || '');
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Primary Workspace Storage Collection
  const [capsules, setCapsules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Input Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [base64Image, setBase64Image] = useState(null);

  // Interaction Layer Tracking Flags
  const [errors, setErrors] = useState({});
  const [viewingCapsule, setViewingCapsule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [promptPin, setPromptPin] = useState('');
  const [targetedPrivateCapsule, setTargetedPrivateCapsule] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (token) fetchUserVault();
  }, [token]);

  const fetchUserVault = async () => {
    try {
      const res = await fetch(`${API_BASE}/capsules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) setCapsules(resData.data);
    } catch (err) { handleLogout(); }
  };

  const handleSystemAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (authMode === 'login') {
        localStorage.setItem('echoToken', data.token);
        localStorage.setItem('echoUser', data.username);
        setToken(data.token);
        setSessionUser(data.username);
      } else {
        alert('Security identity mapped. Access vault via portal window.');
        setAuthMode('login');
      }
    } catch (err) { alert(err.message); }
  };

  const handleFileStream = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleForgeCapsule = async (e) => {
    e.preventDefault();
    let runtimeErrors = {};
    if (!title.trim()) runtimeErrors.title = "Designation heading required.";
    if (!description.trim()) runtimeErrors.description = "Reflections cannot remain hollow.";
    if (isPrivate && !password) runtimeErrors.password = "Private clusters demand passkey configurations.";

    if (Object.keys(runtimeErrors).length > 0) return setErrors(runtimeErrors);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/capsules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, isPrivate, password, imageLocalUrl: base64Image })
      });
      const freshData = await res.json();
      if (res.ok) {
        setCapsules([freshData.data, ...capsules]);
        setTitle(''); setDescription(''); setIsPrivate(false); setPassword(''); setBase64Image(null);
      }
    } catch (err) { alert(err.message); }
  };

  const handleCardInteraction = (target) => {
    if (target.isPrivate) {
      setTargetedPrivateCapsule(target);
      setAuthPromptOpen(true);
    } else {
      launchInspectionNode(target);
    }
  };

  const verifyVaultPasskey = (e) => {
    e.preventDefault();
    if (promptPin === targetedPrivateCapsule.password) {
      setAuthPromptOpen(false);
      launchInspectionNode(targetedPrivateCapsule);
      setPromptPin('');
      setErrors({});
    } else {
      setErrors({ auth: "Access validation cipher mismatch." });
    }
  };

  const launchInspectionNode = (capsule) => {
    setViewingCapsule(capsule);
    setEditTitle(capsule.title);
    setEditDesc(capsule.description);
  };

  const commitPayloadChanges = async (e) => {
    e.preventDefault();
    const logs = [...viewingCapsule.history, `Payload mutation compiled on ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`];
    try {
      const res = await fetch(`${API_BASE}/capsules/${viewingCapsule._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, description: editDesc, history: logs })
      });
      if (res.ok) {
        fetchUserVault();
        setViewingCapsule(null);
        setIsEditing(false);
      }
    } catch (err) { alert(err.message); }
  };

  const purgeCapsuleNode = async (id, event) => {
    event.stopPropagation();
    if (!window.confirm("Purge memory cluster frame permanently from cloud collections?")) return;
    try {
      const res = await fetch(`${API_BASE}/capsules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCapsules(capsules.filter(item => item._id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleLogout = () => {
    localStorage.clear(); setToken(''); setSessionUser(''); setCapsules([]);
  };

  // Metric Calculation Core
  const totalCount = capsules.length;
  const privateCount = capsules.filter(c => c.isPrivate).length;
  const publicCount = totalCount - privateCount;

  // Real-time Search Processing Core (Hides private targets from simple plaintext matching strings)
  const filteredCapsules = capsules.filter(item => {
    if (item.isPrivate) return true; // Keep private capsules fixed on viewboard grid
    return item.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      {/* FRONT ENTRANCE MODULE LAYER: Complete Isolation Window Gateway */}
      {!token ? (
        <div className="auth-universe">
          <div className="auth-card-luxury">
            <h1 style={{ fontFamily: 'Space Grotesk', letterSpacing: '4px', color: '#fff', fontSize: '28px', marginBottom: '10px' }}>ECHO✕MIND</h1>
            <p style={{ color: '#64748b', fontSize: '11px', letterSpacing: '2px', marginBottom: '35px' }}>SECURE CLOUD ENGINE CODES V5</p>
            
            <form onSubmit={handleSystemAuth}>
              <input type="text" className="form-control" placeholder="Identity Label Identifier" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required />
              <input type="password" className="form-control" placeholder="Security Password Protocol" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
              <button type="submit" className="btn-submit" style={{ marginTop: '25px' }}>
                {authMode === 'login' ? 'DECIPHER VAULT SPACE' : 'INITIALIZE REGISTRY SCHEMA'}
              </button>
            </form>
            
            <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#6366f1', marginTop: '20px', textDecoration: 'underline' }}>
              {authMode === 'login' ? "Register Core Security Identity Schema" : "Return to active system log-in interface"}
            </p>
          </div>
        </div>
      ) : (
        
        /* APP DASHBOARD WORKSPACE MODULE LAYER */
        <div className="echo-container">
          <nav className="echo-navbar">
            <div>
              <h1>ECHO✕MIND</h1>
              <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>WORKSPACE NODE ARCHISTRY: {sessionUser.toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} style={{ width: 'auto', padding: '10px 22px', background: '#ef4444' }} className="btn-submit">Purge Session Matrix (Logout)</button>
          </nav>

          {/* ADVANCED ADVANCED FEATURE MODULE: Real-time Analytics Data Strip */}
          <section className="metrics-strip">
            <div className="metric-node"><h3>{totalCount}</h3><p>Total Linked Clusters</p></div>
            <div className="metric-node"><h3 style={{ color: '#10b981' }}>{publicCount}</h3><p>Public Streams</p></div>
            <div className="metric-node"><h3 style={{ color: 'var(--cyber-gold)' }}>{privateCount}</h3><p>Classified Encrypted Nodes</p></div>
          </section>

          <div className="echo-dashboard">
            <aside className="creator-panel">
              <h2 style={{ marginTop: '0', fontSize: '20px', letterSpacing: '1px' }}>Forge New Memory</h2>
              <form onSubmit={handleForgeCapsule} noValidate>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Memory Title Heading</label>
                  <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter designation..." />
                  {errors.title && <span className="error-msg">{errors.title}</span>}
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Story Narrative Records</label>
                  <textarea className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Log memory contextual references..."></textarea>
                  {errors.description && <span className="error-msg">{errors.description}</span>}
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Attach Imagery Device Buffers</label>
                  <input type="file" accept="image/*" onChange={handleFileStream} className="form-control" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} style={{ accentColor: 'var(--cyber-gold)' }} />
                    Activate High-Level Privacy Protocol
                  </label>
                </div>
                {isPrivate && (
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--cyber-gold)' }}>Establish Security Vault Passcode</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                  </div>
                )}
                <button type="submit" className="btn-submit">Commit to Cloud Database</button>
              </form>
            </aside>

            <main className="vault-feed">
              {/* ADVANCED ADVANCED FEATURE MODULE: Vault Search Filter Interceptor Input */}
              <div style={{ marginBottom: '30px' }}>
                <input type="text" className="form-control" style={{ padding: '16px' }} placeholder="🔍 Execute Search Query Vector across Public Streams..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>

              <div className="capsule-grid">
                {filteredCapsules.map(item => (
                  <div key={item._id} className={`capsule-card ${item.isPrivate ? 'encrypted-ghost' : 'public-frame'}`} onClick={() => handleCardInteraction(item)}>
                    <div>
                      <div className={`card-badge ${item.isPrivate ? 'locked-badge' : ''}`}>{item.isPrivate ? "🔒 CLASSIFIED" : "🌐 PUBLIC VIEW"}</div>
                      
                      {/* CRITICAL FEATURE ENHANCEMENT: Ghost Protocol Hide Elements logic implementation rulesets */}
                      {item.isPrivate ? (
                        <div className="ghost-blur-lock">
                          <span style={{ fontSize: '24px', marginBottom: '5px' }}>🔒</span>
                          <span>DATA PROTOCOL LOCKED</span>
                        </div>
                      ) : (
                        <>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#fff' }}>{item.title}</h4>
                          <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.description}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <span>{item.date}</span>
                      {/* Protect delete trigger from unauthorized un-authed access points inside ghost frames */}
                      {!item.isPrivate ? (
                        <button className="btn-delete" onClick={(e) => purgeCapsuleNode(item._id, e)}>Purge</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#475569' }}>Locked Vector</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* MODAL WALL: Verification Verification PIN Prompter Layer Interceptor */}
      {authPromptOpen && (
        <div className="modal-backdrop">
          <div className="modal-window" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setAuthPromptOpen(false)}>×</button>
            <h3 style={{ color: 'var(--cyber-gold)', marginTop: '0' }}>Security Cipher Verification</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Provide authorization signature key sequence code to cleanly extract data.</p>
            <form onSubmit={verifyVaultPasskey}>
              <input type="password" className="form-control" style={{ textAlign: 'center', letterSpacing: '6px' }} value={promptPin} onChange={e => setPromptPin(e.target.value)} placeholder="••••" required autoFocus />
              {errors.auth && <span className="error-msg">{errors.auth}</span>}
              <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>Decrypt Capsule Node</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WALL: Deep Inspection Node View Overlay Layer */}
      {viewingCapsule && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <button className="close-btn" onClick={() => { setViewingCapsule(null); setIsEditing(false); }}>×</button>
            {!isEditing ? (
              <>
                <div className="card-badge" style={{ backgroundColor: viewingCapsule.isPrivate ? 'rgba(212,175,55,0.1)' : 'rgba(16,185,129,0.1)', color: viewingCapsule.isPrivate ? 'var(--cyber-gold)' : '#34d399' }}>
                  {viewingCapsule.isPrivate ? "🔒 CLASSIFIED MEMORY SEGMENT" : "🌐 OPEN PUBLIC REGISTRY RECORD"}
                </div>
                <h2 style={{ color: '#fff', margin: '10px 0 15px 0', fontSize: '24px' }}>{viewingCapsule.title}</h2>
                <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>{viewingCapsule.description}</p>
                
                {viewingCapsule.imageLocalUrl && <img src={viewingCapsule.imageLocalUrl} alt="Matrix Core Asset File" className="modal-img" />}
                
                <div className="ledger-box">
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--neon-glow)', fontSize: '12px', letterSpacing: '1px' }}>REVISION LOG LEDGER TRACKING SYSTEM</h5>
                  {viewingCapsule.history.map((log, idx) => <div key={idx} className="ledger-item">{log}</div>)}
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="btn-submit" onClick={() => setIsEditing(true)}>Modify Payload Context</button>
                  {viewingCapsule.isPrivate && <button className="btn-submit" style={{ background: '#7f1d1d' }} onClick={(e) => { purgeCapsuleNode(viewingCapsule._id, e); setViewingCapsule(null); }}>Purge Payload</button>}
                </div>
              </>
            ) : (
              <form onSubmit={commitPayloadChanges}>
                <h3 style={{ color: 'var(--cyber-gold)', marginTop: '0' }}>Mutate Cluster Configuration Parameters</h3>
                <input type="text" className="form-control" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                <textarea className="form-control" rows="6" value={editDesc} onChange={e => setEditDesc(e.target.value)} required></textarea>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button type="submit" className="btn-submit">Commit Configuration Overwrite</button>
                  <button type="button" className="btn-submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setIsEditing(false)}>Cancel Mutation</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
