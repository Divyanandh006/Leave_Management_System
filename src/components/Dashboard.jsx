import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Home, Calendar, LayoutDashboard, Settings, User as UserIcon, Shield, ShieldAlert } from 'lucide-react';
import UserView from './UserView';
import ManagerView from './ManagerView';
import AdminView from './AdminView';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('home');

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return 'var(--primary)';
      case 'professor': return 'var(--secondary)';
      case 'worker': return 'var(--warning)';
      case 'manager': return 'var(--success)';
      default: return 'var(--primary)';
    }
  };

  // Role-based protection check
  const renderContent = () => {
    if (activeTab === 'admin' && currentUser.role !== 'manager') {
      return (
        <div className="glass-panel text-center" style={{ padding: '50px' }}>
          <ShieldAlert size={60} color="var(--danger)" style={{ margin: '0 auto 20px' }} />
          <h2 className="glitch-effect">ACCESS DENIED</h2>
          <p>This sector is restricted to Management Personnel only. Your unauthorized access attempt has been logged.</p>
          <button className="btn btn-primary mt-4" onClick={() => setActiveTab('home')}>Return to Safe Sector</button>
        </div>
      );
    }

    if (currentUser.role === 'manager') {
      if (activeTab === 'admin') return <AdminView />;
      return <ManagerView activeTab={activeTab} />;
    }
    
    return <UserView activeTab={activeTab} />;
  };

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="cube-small">
            <div className="face-s front-s"></div>
            <div className="face-s back-s"></div>
            <div className="face-s right-s"></div>
            <div className="face-s left-s"></div>
            <div className="face-s top-s"></div>
            <div className="face-s bottom-s"></div>
          </div>
          <h2>LMS 3D</h2>
        </div>

        <div className="user-profile-mini card-3d">
          <div className="avatar">
            <UserIcon size={30} color={getRoleColor(currentUser.role)} />
          </div>
          <div className="info">
            <h4>{currentUser.name}</h4>
            <span className="badge" style={{ backgroundColor: getRoleColor(currentUser.role) }}>
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={20} /> <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
            <Calendar size={20} /> <span>Leaves</span>
          </button>
          {currentUser.role === 'manager' && (
            <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Shield size={20} /> <span>Admin Center</span>
            </button>
          )}
        </nav>

        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={20} /> <span>Security Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar glass-panel">
          <h3>Interactive Holographic Interface</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="status-indicator">
              <span className="pulse-dot"></span> System Online
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
