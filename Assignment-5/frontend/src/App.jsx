import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('echoToken') || '');
  const [vaultData, setVaultData] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (token) {
      fetchVaultData();
    }
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Operational system failure');

      if (isLogin) {
        localStorage.setItem('echoToken', data.token);
        localStorage.setItem('echoUser', data.username);
        setToken(data.token);
      } else {
        alert('Credentials accepted into storage! Please authenticate via access portal.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(`System Intercept: ${err.message}`);
    }
  };

  const fetchVaultData = async () => {
    try {
      const response = await fetch(`${API_BASE}/vault/data`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setVaultData(data.vaultItems);
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setVaultData([]);
  };

  return (
    <div className="wrapper">
      <h2>ECHO✕MIND</h2>
      <hr className="divider" />

      {!token ? (
        <form onSubmit={handleAuth} className="auth-form">
          <h3>{isLogin ? 'Secure Vault Access' : 'Initialize Account Matrix'}</h3>
          <input 
            type="text" 
            placeholder="System Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Validation Cipher Code" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">{isLogin ? 'Access Vault' : 'Initialize Account'}</button>
          <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create new account matrix' : 'Return to access portal'}
          </p>
        </form>
      ) : (
        <div className="dashboard">
          <h3 className="success-tag">🔓 Memory Cluster Decrypted</h3>
          <p style={{ textAlign: 'center' }}>Welcome back, <strong>{localStorage.getItem('echoUser')}</strong></p>
          
          <div className="data-container">
            {vaultData.map((item) => (
              <div key={item.id} className="card">
                <p className="card-title">{item.title}</p>
                <span className="card-tag">Tag: {item.classification}</span>
              </div>
            ))}
          </div>
          <button onClick={handleLogout} className="logout-btn">Lock Vault</button>
        </div>
      )}
    </div>
  );
}

export default App;
