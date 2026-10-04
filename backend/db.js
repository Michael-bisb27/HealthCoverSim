const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'quotes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Initialize database schema
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      cover_type TEXT NOT NULL,
      applicant1_age INTEGER NOT NULL,
      applicant1_cover_history TEXT NOT NULL,
      applicant2_age INTEGER,
      applicant2_cover_history TEXT,
      hospital_cover TEXT NOT NULL,
      extras_cover TEXT NOT NULL,
      payment_frequency TEXT NOT NULL,
      annual_discount REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;