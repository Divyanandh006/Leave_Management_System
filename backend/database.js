const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT,
      totalWorkingDays INTEGER,
      completedDays INTEGER,
      presentDays INTEGER,
      absentDays INTEGER
    )
  `);

  // Create Leaves table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leaves (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      startDate TEXT,
      endDate TEXT,
      status TEXT,
      reason TEXT,
      remarks TEXT,
      attachment TEXT,
      requestedAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // Seed default data if users table is empty
  const userCount = await db.get(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count === 0) {
    const defaultUsers = [
      { id: 'u1', username: 'Alex Student', password: 'password', role: 'student', name: 'Alex Student', totalWorkingDays: 250, completedDays: 120, presentDays: 105, absentDays: 15 },
      { id: 'u2', username: 'Dr. Smith', password: 'password', role: 'professor', name: 'Dr. Smith', totalWorkingDays: 250, completedDays: 120, presentDays: 118, absentDays: 2 },
      { id: 'u3', username: 'John Worker', password: 'password', role: 'worker', name: 'John Worker', totalWorkingDays: 250, completedDays: 120, presentDays: 115, absentDays: 5 },
      { id: 'u4', username: 'Admin Manager', password: 'password', role: 'manager', name: 'Admin Manager', totalWorkingDays: 250, completedDays: 120, presentDays: 120, absentDays: 0 },
    ];

    const insertUser = await db.prepare(`
      INSERT INTO users (id, username, password, role, name, totalWorkingDays, completedDays, presentDays, absentDays)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of defaultUsers) {
      await insertUser.run(u.id, u.username, u.password, u.role, u.name, u.totalWorkingDays, u.completedDays, u.presentDays, u.absentDays);
    }
    await insertUser.finalize();
  }

  // Seed default leave if empty
  const leaveCount = await db.get(`SELECT COUNT(*) as count FROM leaves`);
  if (leaveCount.count === 0) {
    await db.run(`
      INSERT INTO leaves (id, userId, type, startDate, endDate, status, reason, requestedAt)
      VALUES ('l1', 'u1', 'Sick Leave', '2026-04-10', '2026-04-12', 'pending', 'Fever and cold', ?)
    `, new Date().toISOString());
  }

  return db;
}

module.exports = { setupDatabase };
