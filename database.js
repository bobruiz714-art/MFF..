// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./link.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS links (
    discord_id TEXT PRIMARY KEY,
    roblox_id TEXT UNIQUE
  )`);
});

module.exports = db;
