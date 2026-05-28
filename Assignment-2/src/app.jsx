import React, { useState, useEffect } from 'react';
import './app.css';

export default function App() {
  // 1. Core Dynamic Task/Memory State Array (Managed via useState)
  const [capsules, setCapsules] = useState([]);

  // Form Input Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Validation Messaging Engine State
  const [errors, setErrors] = useState({});

  // Operational Modal and Interaction States
  const [viewingCapsule, setViewingCapsule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [promptPin, setPromptPin] = useState('');
  const [targetedPrivateCapsule, setTargetedPrivateCapsule] = useState(null);

  // Buffer fields for active payload modifications
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 2. Lifecycle & Side Effects Management (Managed via useEffect)
  useEffect(() => {
    console.log("ECHO✕MIND Core Task Management Workspace Initialized Successfully.");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file)); 
    }
  };

  // 3. Form Validation & Item Addition Functionality
  const handleCreateCapsule = (e) => {
    e.preventDefault();
    let runtimeErrors = {};

    if (!title.trim()) runtimeErrors.title = "A distinct title is required to forge a capsule.";
    if (!description.trim()) runtimeErrors.description = "Reflections and task notes cannot be empty.";
    if (isPrivate && !password) runtimeErrors.password = "A private vault requires an access cipher code.";

    if (Object.keys(runtimeErrors).length > 0) {
      setErrors(runtimeErrors);
      return;
    }

    setErrors({});

    const blueprint = {
      id: `capsule-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      isPrivate,
      password: isPrivate ? password : null,
      imageLocalUrl: selectedFile,
      date: new Date().toLocaleDateString(),
      history: [`Created on ${new Date().toLocaleDateString()}`]
    };

    setCapsules([blueprint, ...capsules]);

    setTitle('');
    setDescription('');
    setIsPrivate(false);
    setPassword('');
    setSelectedFile(null);
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
    } else {
      setErrors({ auth: "Invalid Vault Access Cipher Key Code." });
    }
  };

  const launchInspectionWindow = (capsule) => {
    setViewingCapsule(capsule);
    setEditTitle(capsule.title);
    setEditDesc(capsule.description);
  };

  const commitPayloadChanges = (e) => {
    e.preventDefault();
    const logs = [
      ...viewingCapsule.history,
      `Payload Update on ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`
    ];

    const pipeline = capsules.map(item => {
      if (item.id === viewingCapsule.id) {
        return { ...item, title: editTitle, description: editDesc, history: logs };
      }
      return item;
    });

    setCapsules(pipeline);
    setViewingCapsule({ ...viewingCapsule, title: editTitle, description: editDesc, history: logs });
    setIsEditing(false);
  };

  // 4. Item Delete / Purge Functionality
  const deleteCapsuleInstance = (id, event) => {
    event.stopPropagation(); 
    setCapsules(capsules.filter(item => item.id !== id));
  };

  return (
    <div className="echo-container">
      <nav className="echo-navbar">
        <div className="brand">
          <h1>ECHO✕MIND</h1>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '1px' }}>
          SECURE STORAGE ACTIVE
        </div>
      </nav>

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
              <div className="file-upload-wrapper">
                <label className="file-upload-btn">
                  {selectedFile ? "✓ Image Mounted from Storage" : "Browse Files from Device"}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="privacy-row">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                Apply High-Level Privacy Lock
              </label>
            </div>

            {isPrivate && (
              <div className="form-group">
                <label>Set Vault Passcode</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>
            )}

            <button type="submit" className="btn-submit">Seal to Workspace</button>
          </form>
        </aside>

        <main className="vault-feed">
          <h2>Active Memory Capsules</h2>
          {capsules.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', marginTop: '2rem' }}>
              The vault workspace is currently clear. Structure your first capsule deployment to generate cards.
            </div>
          ) : (
            <div className="capsule-grid">
              {/* 5. Dynamic Array Mapping (.map) */}
              {capsules.map(item => (
                <div key={item.id} className={`capsule-card ${item.isPrivate ? 'encrypted' : ''}`} onClick={() => handleCardClick(item)}>
                  <div>
                    <div className={`card-badge ${item.isPrivate ? 'locked-badge' : ''}`}>
                      {item.isPrivate ? "🔒 Encrypted" : "🌐 Public"}
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="card-footer">
                    <span>{item.date}</span>
                    <button className="btn-delete" onClick={(e) => deleteCapsuleInstance(item.id, e)}>Purge</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {authPromptOpen && (
        <div className="modal-backdrop">
          <div className="modal-window auth-prompt-window">
            <button className="close-btn" onClick={() => { setAuthPromptOpen(false); setPromptPin(''); setErrors({}); }}>×</button>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Security Cipher Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>This memory component is locked with local device encryption.</p>
            <form onSubmit={verifyPasscodeAccess}>
              <input type="password" className="form-control" style={{ textAlign: 'center', letterSpacing: '6px', marginBottom: '1rem' }} value={promptPin} onChange={(e) => setPromptPin(e.target.value)} placeholder="••••" required autoFocus />
              {errors.auth && <span className="error-msg" style={{ display: 'block', marginBottom: '1rem' }}>{errors.auth}</span>}
              <button type="submit" className="btn-submit" style={{ marginTop: '0' }}>Decrypt Capsule</button>
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
                <div className="card-badge">{viewingCapsule.isPrivate ? "🔒 Private Layer Record" : "🌐 Public Space Record"}</div>
                <h2 style={{ color: 'var(--accent-gold)', margin: '0.5rem 0 1rem 0' }}>{viewingCapsule.title}</h2>
                <p style={{ lineHeight: '1.6', color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>{viewingCapsule.description}</p>
                
                {viewingCapsule.imageLocalUrl && (
                  <img src={viewingCapsule.imageLocalUrl} alt="Attached Data Asset" className="modal-img" />
                )}

                <div className="ledger-box">
                  <h5>Capsule History Ledger Tracking</h5>
                  {viewingCapsule.history.map((log, idx) => (
                    <div key={idx} className="ledger-item">{log}</div>
                  ))}
                </div>
                <button className="btn-submit" onClick={() => setIsEditing(true)}>Modify Payload Contents</button>
              </>
            ) : (
              <form onSubmit={commitPayloadChanges}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Modify Capsule Payload</h3>
                <div className="form-group">
                  <label>Update Title Heading</label>
                  <input type="text" className="form-control" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Update Story Narrative Logs</label>
                  <textarea className="form-control" rows="6" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required></textarea>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-submit" style={{ marginTop: '0' }}>Commit Ledger Entry</button>
                  <button type="button" className="btn-submit" style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: '#fff', marginTop: '0' }} onClick={() => setIsEditing(false)}>Abort Modification</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
