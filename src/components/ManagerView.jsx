import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, ShieldAlert, PieChart, Users } from 'lucide-react';

const ManagerView = ({ activeTab }) => {
  const { leaves, users, updateLeaveStatus } = useAppContext();

  // Stats
  const personnelCount = users.filter(u => u.role !== 'manager').length;
  const pendingRequests = leaves.filter(l => l.status === 'pending');
  const approvedRequests = leaves.filter(l => l.status === 'approved').length;

  const handleAction = async (id, status) => {
    let remarks = '';
    if (status === 'rejected') {
      remarks = prompt("Enter Rejection Remarks (Neural Justification):");
      if (remarks === null) return; // cancel
    } else {
      remarks = "Approved by Command Center.";
    }
    await updateLeaveStatus(id, status, remarks);
  };

  if (activeTab === 'home') {
    return (
      <div className="view-container fade-in layout-split">
        <div className="left-col">
          <div className="widgets-grid mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
             <div className="stat-card glass-panel hover-3d">
                <ShieldAlert size={30} color="var(--warning)" style={{margin: '0 auto 10px'}}/>
                <div className="stat-title">Pending Actions</div>
                <div className="stat-value text-warning">{pendingRequests.length}</div>
             </div>
             
             <div className="stat-card glass-panel hover-3d">
                <Check size={30} color="var(--success)" style={{margin: '0 auto 10px'}}/>
                <div className="stat-title">Approved Leaves</div>
                <div className="stat-value text-success">{approvedRequests}</div>
             </div>

             <div className="stat-card glass-panel hover-3d highlight-card" style={{ gridColumn: 'span 2' }}>
                <Users size={40} color="var(--primary)" style={{margin: '0 auto 10px'}}/>
                <div className="stat-title">Total Monitored Personnel</div>
                <div className="stat-value huge">{personnelCount}</div>
             </div>
          </div>

          <div className="glass-panel" style={{ padding: '25px' }}>
             <h3>System Operational Status</h3>
             <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '10px' }}>
                The 3D Leave Management System is currently operating at optimal capacity. All holographic interfaces are active. Attendance tracking synchronization is online.
             </p>
          </div>
        </div>

        <div className="right-col glass-panel" style={{ padding: '30px' }}>
          <h3>Review Pending Requests</h3>
          <div className="timeline" style={{ marginTop: '20px' }}>
            {pendingRequests.length === 0 ? (
               <p className="no-data">No pending requests.</p>
            ) : (
               pendingRequests.map(l => (
                  <div key={l.id} className="request-card glass-panel hover-3d" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid var(--warning)', padding: '15px', marginBottom: '15px' }}>
                    <div className="req-user" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                       <div className="avatar" style={{width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                         <Users size={24}/>
                       </div>
                       <div className="req-info" style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <h4 style={{ margin: 0 }}>{l.userName} <span className="badge" style={{background: 'var(--primary)', fontSize: '10px'}}>{l.userRole}</span></h4>
                             <div className="attendance-badge" style={{ background: parseFloat(l.userAttendance) < 75 ? 'var(--danger-glow)' : 'var(--success-glow)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                                Attendance: {l.userAttendance}%
                             </div>
                          </div>
                          <p style={{ margin: '5px 0', fontSize: '13px' }}>{l.type}: {l.startDate} to {l.endDate}</p>
                          <p style={{ fontStyle: 'italic', color: 'var(--warning)', fontSize: '12px', margin: 0 }}>Reason: {l.reason}</p>
                          {l.attachment && <p style={{ fontSize: '11px', color: 'var(--info)', marginTop: '4px' }}>📎 Attachment: {l.attachment}</p>}
                       </div>
                    </div>
                    <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                       <button className="btn btn-success" onClick={() => handleAction(l.id, 'approved')} title="Approve">
                         <Check size={18} /> Approve
                       </button>
                       <button className="btn btn-danger" onClick={() => handleAction(l.id, 'rejected')} title="Reject">
                         <X size={18} /> Reject
                       </button>
                    </div>
                  </div>
               ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
       <div className="glass-panel" style={{ padding: '30px' }}>
          <h3>All Transmissions Log</h3>
          <table className="hologram-table" style={{ marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>Personnel</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.userName}</strong> <br/>
                      <span style={{fontSize:'11px', color:'var(--text-muted)'}}>{l.userRole}</span>
                    </td>
                    <td>{l.type}</td>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td>
                      <span style={{ color: parseFloat(l.userAttendance) < 75 ? 'var(--danger)' : 'var(--success)' }}>
                        {l.userAttendance}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-badge-${l.status}`}>{l.status.toUpperCase()}</span>
                      {l.remarks && <div style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '4px' }}>"{l.remarks}"</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
       </div>
    </div>
  );
};

export default ManagerView;
