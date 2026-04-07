const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Helper function to structure user data
const formatUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    role: u.role,
    name: u.name,
    attendance: {
      totalWorkingDays: u.totalWorkingDays,
      completedDays: u.completedDays,
      presentDays: u.presentDays,
      absentDays: u.absentDays
    }
  };
};

// Calculate leave days
const calculateDays = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Initialize DB and start server
setupDatabase().then((database) => {
  db = database;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  });
}).catch(console.error);

// ---------------- API ENDPOINTS ---------------- //

// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.all('SELECT * FROM users');
    res.json(users.map(formatUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username.trim();
    console.log(`[DEBUG] Login attempt - Username: "${trimmedUsername}", Password: "${password}"`);
    
    // Case-insensitive username check
    const user = await db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?', [trimmedUsername, password]);
    
    if (user) {
      console.log(`[DEBUG] Login successful for: ${user.username}`);
      res.json(formatUser(user));
    } else {
      console.log(`[DEBUG] Invalid credentials for: "${trimmedUsername}"`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await db.all(`
      SELECT l.*, u.name as userName, u.role as userRole, 
             u.totalWorkingDays, u.completedDays, u.presentDays, u.absentDays
      FROM leaves l
      JOIN users u ON l.userId = u.id
    `);
    
    // Add attendance percentage calculation to each leave object
    const enhancedLeaves = leaves.map(l => ({
      ...l,
      userAttendance: l.completedDays > 0 ? ((l.presentDays / l.completedDays) * 100).toFixed(1) : "0.0"
    }));
    
    res.json(enhancedLeaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leaves
app.post('/api/leaves', async (req, res) => {
  try {
    const { userId, type, startDate, endDate, reason, attachment } = req.body;
    const id = `l${Date.now()}`;
    const requestedAt = new Date().toISOString();
    
    await db.run(`
      INSERT INTO leaves (id, userId, type, startDate, endDate, status, reason, requestedAt, attachment)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `, [id, userId, type, startDate, endDate, reason, requestedAt, attachment || null]);
    
    const newLeave = await db.get('SELECT * FROM leaves WHERE id = ?', [id]);
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/leaves/:id/status
app.put('/api/leaves/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const leave = await db.get('SELECT * FROM leaves WHERE id = ?', [id]);
    if (!leave) return res.status(404).json({ error: 'Leave not found' });
    
    // Update leave status and remarks
    await db.run('UPDATE leaves SET status = ?, remarks = ? WHERE id = ?', [status, remarks || null, id]);
    
    // If approved, update user attendance
    if (status === 'approved') {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [leave.userId]);
      const daysToDeduct = calculateDays(leave.startDate, leave.endDate);
      
      if (user) {
        const newAbsentDays = user.absentDays + daysToDeduct;
        const newPresentDays = Math.max(0, user.presentDays - daysToDeduct);
        await db.run('UPDATE users SET absentDays = ?, presentDays = ? WHERE id = ?', [newAbsentDays, newPresentDays, user.id]);
      }
    }
    
    const updatedLeave = await db.get('SELECT * FROM leaves WHERE id = ?', [id]);
    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- USER MANAGEMENT ---------------- //

// POST /api/users (Add User)
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, name, completedDays, presentDays, absentDays } = req.body;
    const id = `u${Date.now()}`;
    
    await db.run(`
      INSERT INTO users (id, username, password, role, name, totalWorkingDays, completedDays, presentDays, absentDays)
      VALUES (?, ?, ?, ?, ?, 250, ?, ?, ?)
    `, [id, username, password, role, name, completedDays || 0, presentDays || 0, absentDays || 0]);
    
    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    res.status(201).json(formatUser(newUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id (Update User)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, name, completedDays, presentDays, absentDays } = req.body;
    
    await db.run(`
      UPDATE users SET username = ?, password = ?, role = ?, name = ?, 
                       completedDays = ?, presentDays = ?, absentDays = ?
      WHERE id = ?
    `, [username, password, role, name, completedDays || 0, presentDays || 0, absentDays || 0, id]);
    
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    res.json(formatUser(updatedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- API STATUS ---------------- //
app.get('/', (req, res) => {
  res.json({ message: '3D Leave Management API is online.' });
});
