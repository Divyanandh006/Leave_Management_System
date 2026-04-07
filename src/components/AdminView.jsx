import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, UserMinus, Edit, Save, X, Shield, User, UserCheck, ShieldAlert } from 'lucide-react';

const AdminView = () => {
  const { users, addUser, editUser, deleteUser } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    username: '', password: '', role: 'student', name: '',
    completedDays: 0, presentDays: 0 
  });

  if (!users || users.length === 0) {
    return <div className="view-container fade-in"><div className="glass-panel text-center" style={{ padding: '50px' }}>Initiating personnel matrix...</div></div>;
  }

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ 
      username: user.username, 
      password: user.password, 
      role: user.role, 
      name: user.name,
      completedDays: user.attendance?.completedDays || 0,
      presentDays: user.attendance?.presentDays || 0
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const absentDays = Math.max(0, formData.completedDays - formData.presentDays);
    const finalData = { ...formData, absentDays };

    if (editingId) {
      await editUser(editingId, finalData);
      setEditingId(null);
    } else {
      await addUser(finalData);
      setIsAdding(false);
    }
    setFormData({ username: '', password: '', role: 'student', name: '', completedDays: 0, presentDays: 0 });
  };

  const roles = ['student', 'professor', 'worker', 'manager'];

  return (
    <div className="view-container fade-in">
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Personnel Matrix Management</h3>
          {!isAdding && (
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <UserPlus size={18} /> Initialize New Identity
            </button>
          )}
        </div>

        {(isAdding || editingId) && (
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', marginBottom: '25px', border: '1px solid var(--primary)' }}>
            <h4>{editingId ? 'Modify Identity' : 'Establish New Identity'}</h4>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div className="form-group">
                <label>Legal Name</label>
                <input 
                  className="form-control" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Identity Token (Username)</label>
                <input 
                  className="form-control" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Security Key (Password)</label>
                <input 
                  className="form-control" 
                  type="password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Assigned Role</label>
                <select 
                  className="form-control" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Completed Days</label>
                <input 
                  type="number"
                  className="form-control" 
                  value={formData.completedDays} 
                  onChange={e => setFormData({...formData, completedDays: parseInt(e.target.value) || 0})} 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Present Days</label>
                <input 
                  type="number"
                  className="form-control" 
                  value={formData.presentDays} 
                  onChange={e => setFormData({...formData, presentDays: parseInt(e.target.value) || 0})} 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Absent Days (Auto)</label>
                <input 
                  type="number"
                  className="form-control" 
                  value={Math.max(0, formData.completedDays - formData.presentDays)} 
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-danger" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                  <X size={18} /> Abort
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {editingId ? 'Update Matrix' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="hologram-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong> <br/>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.id}</span>
                </td>
                <td>
                  <span className="badge" style={{ background: u.role === 'manager' ? 'var(--danger)' : 'var(--primary)' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)' }}>
                    <Shield size={14} /> Encrypted
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-info" onClick={() => handleEdit(u)} style={{ padding: '5px 10px' }}>
                      <Edit size={16} />
                    </button>
                    {u.id !== 'u4' && ( // Prevent deleting main admin
                      <button className="btn btn-danger" onClick={() => { if(confirm('Erase this identity from the matrix?')) deleteUser(u.id); }} style={{ padding: '5px 10px' }}>
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="widgets-grid mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="stat-card glass-panel">
          <ShieldAlert size={20} color="var(--warning)" />
          <div className="stat-title">System Security</div>
          <div className="stat-value text-success" style={{ fontSize: '1.2rem' }}>MAXIMUM</div>
        </div>
        <div className="stat-card glass-panel">
          <UserCheck size={20} color="var(--info)" />
          <div className="stat-title">Active Personnel</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{users.length}</div>
        </div>
        <div className="stat-card glass-panel">
          <User size={20} color="var(--primary)" />
          <div className="stat-title">Root Admin</div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>Active</div>
        </div>
        <div className="stat-card glass-panel">
          <Shield size={20} color="var(--danger)" />
          <div className="stat-title">Breach Attempts</div>
          <div className="stat-value text-danger" style={{ fontSize: '1.2rem' }}>0</div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
