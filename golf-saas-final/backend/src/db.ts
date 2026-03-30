
import Database from "better-sqlite3";

export const db = new Database("golf.db");

// init tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
