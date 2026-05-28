import React, { useState, useEffect } from 'react';
import './app.css';

export default function App() {
  // System Profile Authed Node Session Elements Tracker Maps
  const [token, setToken] = useState(localStorage.getItem('echoToken') || '');
  const [sessionUser, setSessionUser] = useState(localStorage.getItem('echoUser') || '');
  const [authMode, setAuthMode] = useState('login'); // login or register
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Primary Capsules core state workspace map list vector
  const [capsules, setCapsules] = useState([]);

  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [base64Image, setBase64Image] = useState(null);

  // Interaction State Trackers 
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
    if (token) fetchUserCapsules();
  }, [token]);

  const fetchUserCapsules = async () => {
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
        alert('Identity profile logged. Authenticate via standard portal route.');
        setAuthMode('login');
      }
    } catch (err) { alert(err.message); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCapsule = async (e) => {
    e.preventDefault();
    let runtimeErrors = {};
    if (!title.trim()) runtimeErrors.title = "A unique designation title is required.";
    if (!description.trim()) runtimeErrors.description = "Reflections cannot sit hollow.";
    if (isPrivate && !password) runtimeErrors.password = "Classified logs demand an validation lock passcode.";

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

  const handleCardClick = (target) => {
    if (target.isPrivate) {
      setTargetedPrivateCapsule(target);
      setAuthPromptOpen(true);
    } else {
      launchInspectionWindow(target);
    }
  };

  const verifyPasscodeAccess = (e) => {
    e.preventDefault();
    if (promptPin === targetedPrivateCapsule.password) {
      setAuthPromptOpen(false);
      launchInspectionWindow(targetedPrivateCapsule);
      setPromptPin('');
      setErrors({});
    } else {
      setErrors({ auth: "Verification signature invalid." });
    }
  };

  const launchInspectionWindow = (capsule) => {
    setViewingCapsule(capsule);
    setEditTitle(capsule.title);
    setEditDesc(capsule.description);
  };

  const commitPayloadChanges = async (e) => {
    e.preventDefault();
    const logs = [...viewingCapsule.history, `Payload mutation tracked on ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`];
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
        fetchUserCapsules();
        setViewingCapsule(null);
        setIsEditing(false);
      }
    } catch (err) { alert(err.message); }
  };

  const deleteCapsuleInstance = async (id, event) => {
    event.stopPropagation();
    if (!window.confirm("Purge this secure record permanently?")) return;
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

  return (
    <div className="echo-container">
      <nav className="echo-navbar">
        <h1>ECHO✕MIND</h1>
        {token && <button onClick={handleLogout} style={{ width: 'auto', padding: '8px 16px', background: '#ef4444' }} className="btn-submit">Lock Profile Matrix</button>}
      </nav>

      {!token ? (
        <div style={{ maxWidth: '400px', margin: '80px auto' }} className="creator-panel">
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{authMode === 'login' ? 'DECIPHER VAULT ACCESS' : 'CREATE INITIAL NODE'}</h2>
          <form onSubmit={handleSystemAuth}>
            <input type="text" className="form-control" placeholder="Identity Label" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required />
            <input type="password" className="form-control" placeholder="Security Password Key" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
            <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>{authMode === 'login' ? 'Unlock Session Portfolio' : 'Initialize Matrix Path'}</button>
          </form>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#818cf8', marginTop: '15px' }}>
            {authMode === 'login' ? "Register Core Security Identity Schema" : "Return to active system log-in interface"}
          </p>
        </div>
      ) : (
        <div className="echo-dashboard">
          <aside className="creator-panel">
            <h2>Forge New Memory</h2>
            <form onSubmit={handleCreateCapsule} noValidate>
              <div className="form-group">
                <label>Memory Title</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
                {errors.title && <span className="error-msg">{errors.title}</span>}
              </div>
              <div className="form-group">
                <label>Story & Reflections</label>
                <textarea className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write your memory..."></textarea>
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>
              <div className="form-group">
                <label>Attach Device Photo Asset</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Apply High-Level Privacy Lock
                </label>
              </div>
              {isPrivate && (
                <div className="form-group">
                  <label>Set Vault Passcode</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
              )}
              <button type="submit" className="btn-submit">Seal to Database</button>
            </form>
          </aside>

          <main className="vault-feed">
            <h2>Active Memory Capsules of {sessionUser}</h2>
            {capsules.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>The workspace tracker is empty. Run structural deployments to spawn cards.</div>
            ) : (
              <div className="capsule-grid">
                {capsules.map(item => (
                  <div key={item._id} className={`capsule-card ${item.isPrivate ? 'encrypted' : ''}`} onClick={() => handleCardClick(item)}>
                    <div>
                      <div className={`card-badge ${item.isPrivate ? 'locked-badge' : ''}`}>{item.isPrivate ? "🔒 Encrypted Vault" : "🌐 Public Stream"}</div>
                      <h4>{item.title}</h4>
                      <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.description}</p>
                    </div>
                    <div className="card-footer">
                      <span>{item.date}</span>
                      <button className="btn-delete" onClick={(e) => deleteCapsuleInstance(item._id, e)}>Purge</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {authPromptOpen && (
        <div className="modal-backdrop">
          <div className="modal-window" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setAuthPromptOpen(false)}>×</button>
            <h3>Security Cipher Verification</h3>
            <form onSubmit={verifyPasscodeAccess}>
              <input type="password" className="form-control" style={{ textAlign: 'center', letterSpacing: '4px' }} value={promptPin} onChange={e => setPromptPin(e.target.value)} placeholder="••••" required autoFocus />
              {errors.auth && <span className="error-msg">{errors.auth}</span>}
              <button type="submit" className="btn-submit" style={{ marginTop: '15px' }}>Decrypt Capsule</button>
            </form>
          </div>
        </div>
      )}

      {viewingCapsule && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <button className="close-btn" onClick={() => { setViewingCapsule(null); setIsEditing(false); }}>×</button>
            {!isEditing ? (
              <>
                <div className="card-badge">{viewingCapsule.isPrivate ? "🔒 Private Encryption Mode" : "🌐 Public Access Deck"}</div>
                <h2>{viewingCapsule.title}</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewingCapsule.description}</p>
                {viewingCapsule.imageLocalUrl && <img src={viewingCapsule.imageLocalUrl} alt="Payload Stream Asset" className="modal-img" />}
                <div className="ledger-box">
                  <h5>Capsule History Tracking Ledger</h5>
                  {viewingCapsule.history.map((log, idx) => <div key={idx} className="ledger-item">{log}</div>)}
                </div>
                <button className="btn-submit" onClick={() => setIsEditing(true)}>Modify Payload Contents</button>
              </>
            ) : (
              <form onSubmit={commitPayloadChanges}>
                <h3>Modify Capsule Payload</h3>
                <input type="text" className="form-control" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                <textarea className="form-control" rows="5" value={editDesc} onChange={e => setEditDesc(e.target.value)} required></textarea>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn-submit">Commit Overwrite Updates</button>
                  <button type="button" className="btn-submit" style={{ background: 'transparent', border: '1px solid #444' }} onClick={() => setIsEditing(false)}>Abort Modification</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
