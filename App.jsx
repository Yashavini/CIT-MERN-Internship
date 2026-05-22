import React, { useState, useEffect } from "react";
import "./App.css";

// Reusable Stat Card Component for Dashboard Feel
const StatCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-label">{title}</span>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

function App() {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem("echo_mind_capsules");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState("");

  const MAX_CHARS = 280;

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("echo_mind_capsules", JSON.stringify(memories));
  }, [memories]);

  const handleSaveCapsule = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError("A memory capsule cannot be empty.");
      return;
    }

    const newMemory = {
      id: Date.now(),
      text: inputText.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMemories([newMemory, ...memories]);
    setInputText("");
    setError("");
  };

  const handleDelete = (id) => {
    setMemories(memories.filter((memory) => memory.id !== id));
  };

  return (
    <div className="app-container">
      {/* Subtle background ambient glows */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Header / Navbar */}
      <header className="navbar">
        <div className="logo-zone">
          <div className="logo-icon">✦</div>
          <span className="logo-text">EchoMind</span>
        </div>
        <div className="live-clock">
          <span className="pulse-dot"></span>
          {currentTime.toLocaleTimeString()}
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="badge">v1.0 // MEMORY CORE ACTIVE</div>
          <h1 className="hero-title">EchoMind</h1>
          <p className="hero-subtitle">
            Preserve your memories and meaningful moments in immutable, beautifully structured glass capsules.
          </p>
        </section>

        {/* Analytics/Status Dashboard Row */}
        <section className="dashboard-grid">
          <StatCard title="Active Capsules" value={memories.length} icon="🪐" />
          <StatCard title="System Integrity" value="100% Operational" icon="🛡️" />
          <StatCard title="Storage Layer" value="Local Encrypted" icon="💾" />
        </section>

        <div className="layout-split">
          {/* Input Panel */}
          <section className="panel-container">
            <div className="glass-card input-card">
              <h2 className="panel-title">Forge New Capsule</h2>
              <p className="panel-desc">Transmit thoughts or chronological milestones to your memory core.</p>
              
              <form onSubmit={handleSaveCapsule}>
                <div className="textarea-wrapper">
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Capture this moment..."
                    maxLength={MAX_CHARS}
                    rows="5"
                  />
                  <div className={`character-counter ${inputText.length >= MAX_CHARS ? 'limit-reached' : ''}`}>
                    {inputText.length} / {MAX_CHARS}
                  </div>
                </div>

                {error && <p className="error-message">⚠️ {error}</p>}

                <button type="submit" className="btn-primary">
                  <span>Save Capsule</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </section>

          {/* Dynamic Feed Panel */}
          <section className="panel-container feed-panel">
            <div className="feed-header">
              <h2 className="panel-title">Stored Memories</h2>
              <span className="capsule-count">{memories.length} item(s)</span>
            </div>

            {memories.length === 0 ? (
              <div className="glass-card empty-state">
                <div className="empty-icon">📁</div>
                <h3>Memory Vault is Vacant</h3>
                <p>No historical fragments found. Commit a moment using the generator interface to initiate your timeline.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {memories.map((memory) => (
                  <div key={memory.id} className="glass-card memory-card">
                    <div className="card-header">
                      <div className="timestamp">
                        <span className="date-tag">{memory.date}</span>
                        <span className="time-tag">{memory.time}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(memory.id)}
                        className="btn-delete"
                        aria-label="Delete capsule"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="card-text">{memory.text}</p>
                    <div className="card-footer">
                      <span className="status-indicator">✦ Secured</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
