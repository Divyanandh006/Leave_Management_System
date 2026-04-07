import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, CheckCircle2, XCircle, Clock } from 'lucide-react';

const UserView = ({ activeTab }) => {
  const { currentUser, leaves, applyLeave } = useAppContext();
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const [currentDate, setCurrentDate] = useState(() => 
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );

  const myLeaves = leaves.filter(l => l.userId === currentUser.id);
  const filteredLeaves = myLeaves.filter(l => filter === 'all' || l.status === filter);
  const attendance = currentUser.attendance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert("Temporal coordinates missing. Please calibrate start and end dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("Chronological Anomaly Detected: End date cannot precede start date.");
      return;
    }
    
    const success = await applyLeave({
      type: leaveType,
      startDate,
      endDate,
      reason,
      attachment: attachment ? attachment.name : null
    });

    if (success) {
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachment(null);
      alert("Leave Request Submitted Holographically.");
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle2 color="var(--success)" />;
      case 'rejected': return <XCircle color="var(--danger)" />;
      default: return <Clock color="var(--warning)" />;
    }
  };

  const calculatePercent = (present, total) => total === 0 ? "0.0" : ((present / total) * 100).toFixed(1);

  if (activeTab === 'home') {
    return (
      <div className="view-container fade-in">
        <div className="widgets-grid metrics-grid-6">
          <div className="stat-card glass-panel hover-3d date-card">
            <div className="stat-title">Current Date</div>
            <div className="stat-value text-md">{currentDate}</div>
            <div className="stat-glow secondary-glow"></div>
          </div>

          <div className="stat-card glass-panel hover-3d">
            <div className="stat-title">Total Working Days</div>
            <div className="stat-value">{attendance.totalWorkingDays}</div>
            <div className="stat-glow primary-glow"></div>
          </div>
          
          <div className="stat-card glass-panel hover-3d">
            <div className="stat-title">Days Completed</div>
            <div className="stat-value text-info">{attendance.completedDays}</div>
            <div className="stat-glow info-glow"></div>
          </div>

          <div className="stat-card glass-panel hover-3d">
            <div className="stat-title">Present Days</div>
            <div className="stat-value text-success">{attendance.presentDays}</div>
            <div className="stat-glow success-glow"></div>
          </div>

          <div className="stat-card glass-panel hover-3d">
            <div className="stat-title">Absent Days</div>
            <div className="stat-value text-danger">{attendance.absentDays}</div>
            <div className="stat-glow danger-glow"></div>
          </div>

          <div className="stat-card glass-panel hover-3d highlight-card preserve-3d">
            <div className="stat-title">Attendance Percentage</div>
            <div className="stat-value huge">{calculatePercent(attendance?.presentDays || 0, attendance?.completedDays || 0)}%</div>
            <div className="progress-ring-container">
               <svg className="progress-ring" width="120" height="120">
                  <circle className="progress-ring__bg" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60"/>
                  <circle className="progress-ring__circle" stroke="var(--primary)" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60" 
                          strokeDasharray="326" strokeDashoffset={326 - (326 * ((attendance?.presentDays || 0) / Math.max(1, (attendance?.completedDays || 1))))} />
               </svg>
            </div>
          </div>
        </div>

        <div className="recent-activity glass-panel mt-4">
          <h3>Recent Leave Transmissions</h3>
          {myLeaves.length === 0 ? (
            <p className="no-data">No transmissions found in the matrix.</p>
          ) : (
            <table className="hologram-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.slice(-3).map(l => (
                  <tr key={l.id}>
                    <td>{l.type}</td>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td className={`status-${l.status}`}>
                      <div className="status-flex">{getStatusIcon(l.status)} {l.status.toUpperCase()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in layout-split">
      <div className="glass-panel form-panel hover-3d">
        <h3>Initiate Leave Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Protocol (Type)</label>
            <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option>Sick Leave</option>
              <option>Personal Leave</option>
              <option>Emergency</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Start Date</label>
              <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required/>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>End Date</label>
              <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required/>
            </div>
          </div>

          <div className="form-group">
            <label>Reason / Justification</label>
            <textarea className="form-control" rows="3" value={reason} onChange={e => setReason(e.target.value)} required></textarea>
          </div>

          <div className="form-group">
            <label>Holographic Attachment (DOC/PDF)</label>
            <input 
              type="file" 
              className="form-control-file" 
              onChange={e => setAttachment(e.target.files[0])}
              style={{ color: 'var(--text-muted)', fontSize: '13px' }}
            />
            {attachment && <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '5px' }}>✓ {attachment.name} queued for transmission.</p>}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2">
            Execute Transmission <Send size={18} />
          </button>
        </form>
      </div>

      <div className="glass-panel list-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Transmission Logs</h3>
          <select className="form-control" style={{ width: 'auto', padding: '5px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Logs</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="timeline">
          {filteredLeaves.length === 0 ? (
            <p className="no-data">No logs found for selected filter.</p>
          ) : (
            filteredLeaves.map(l => (
              <div key={l.id} className={`timeline-item hover-3d border-${l.status}`}>
                <div className="tl-icon">{getStatusIcon(l.status)}</div>
                <div className="tl-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>{l.type}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{l.requestedAt ? new Date(l.requestedAt).toLocaleDateString() : ''}</span>
                  </div>
                  <p>{l.startDate} → {l.endDate}</p>
                  {l.remarks && <p style={{ fontSize: '12px', color: 'var(--warning)', fontStyle: 'italic' }}>Remarks: {l.remarks}</p>}
                  <div className={`badge status-badge-${l.status}`}>{l.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;
