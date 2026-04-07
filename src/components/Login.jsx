import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserCircle2, User, UserCheck, Shield, KeyRound, ArrowRight, Activity, Clock, Server } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [roleMode, setRoleMode] = useState('student');
  const cardRef = useRef(null);

  // Date and Time for the side panel
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Neural scan failed. Both Identity Token and Security Key are required.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('System Access Denied. Credentials not recognized in the mainframe.');
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const roles = [
    { id: 'student', username: 'Alex Student', icon: User, label: 'Student' },
    { id: 'professor', username: 'Dr. Smith', icon: UserCheck, label: 'Professor' },
    { id: 'worker', username: 'John Worker', icon: UserCircle2, label: 'Worker' },
    { id: 'manager', username: 'Admin Manager', icon: Shield, label: 'Manager' },
  ];

  return (
    <div className="login-wrapper">
      <div className="login-split-container pattern-background">

        {/* Left Side: System Details & Interactive Info */}
        <div className="login-info-panel glass-panel borderless">
          <div className="info-header">
            <div className="logo-3d pulse-animation">
              <div className="cube">
                <div className="face front">L</div>
                <div className="face back">M</div>
                <div className="face right">S</div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
              </div>
            </div>
            <h1>Leave Management System</h1>
          </div>

          <div className="system-status">
            <div className="status-item fade-in" style={{ animationDelay: '0.1s' }}>
              <Activity size={20} color="var(--success)" />
              <span>Core Server: <strong>Online</strong></span>
            </div>
            <div className="status-item fade-in" style={{ animationDelay: '0.2s' }}>
              <Clock size={20} color="var(--info)" />
              <span>Local Time: <strong>{time.toLocaleTimeString()}</strong></span>
            </div>
            <div className="status-item fade-in" style={{ animationDelay: '0.3s' }}>
              <Server size={20} color="var(--primary)" />
              <span>Database: <strong>Synced</strong></span>
            </div>
          </div>

          <div className="info-description fade-in" style={{ animationDelay: '0.4s' }}>
            <p>
              Welcome to the future of organizational management. This holographic terminal provides real-time access to attendance metrics, leave workflows, and operational analytics. Select your role identity to initiate establishing a secure connection.
            </p>
          </div>

          <div className="decorative-lines">
            <div className="line l1"></div>
            <div className="line l2"></div>
            <div className="line l3"></div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-wrapper">
          <div
            className="login-card glass-panel"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="login-header text-center">
              <h2>Secure Gateway</h2>
              <p>Identify yourself to proceed</p>
            </div>

            <div className="roles-selector preserve-3d">
              {roles.map(r => (
                <button
                  key={r.id}
                  className={`role-btn ${roleMode === r.id ? 'active' : ''}`}
                  onClick={() => { setRoleMode(r.id); setUsername(r.username); setError(''); }}
                  type="button"
                >
                  <r.icon size={20} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="login-form preserve-3d">
              <div className="form-group hover-3d float-up" style={{ animationDelay: '0.1s' }}>
                <label>Identity Token (Username)</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control pl-10 glow-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your identifier..."
                  />
                </div>
              </div>

              <div className="form-group hover-3d float-up" style={{ animationDelay: '0.2s' }}>
                <label>Security Key (Password)</label>
                <div className="input-with-icon">
                  <KeyRound size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-control pl-10 glow-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passphrase..."
                  />
                </div>
              </div>

              {error && <div className="error-msg glitch-effect">{error}</div>}

              <button type="submit" className="btn btn-primary submit-btn hover-3d float-up" style={{ animationDelay: '0.3s' }}>
                Establish Connection <ArrowRight size={18} className="arrow-pulse" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating background particles */}
      <div className="float-element particle p1"></div>
      <div className="float-element particle p2"></div>
      <div className="float-element particle p3"></div>
      <div className="float-element particle p4"></div>
      <div className="float-element particle p5"></div>
    </div>
  );
};

export default Login;
