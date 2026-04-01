const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.notifications.filter(n => n.userId === req.user.id));
});

router.put('/:id/read', (req, res) => {
  const db = readDB();
  const n = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!n) return res.status(404).json({ error: 'Notificação não encontrada' });
  n.read = true;
  writeDB(db);
  res.json(n);
});

router.put('/read-all', (req, res) => {
  const db = readDB();
  db.notifications.filter(n => n.userId === req.user.id).forEach(n => n.read = true);
  writeDB(db);
  res.json({ ok: true });
});

module.exports = router;
