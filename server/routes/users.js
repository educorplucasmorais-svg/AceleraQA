const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function sanitize(u) { const { password, ...rest } = u; return rest; }

router.get('/', (req, res) => {
  const db = readDB();
  const { id, role } = req.user;
  let users = db.users;
  if (role === 'supervisor') {
    const team = db.teams.find(t => t.supervisorId === id);
    const memberIds = team ? team.members : [];
    users = users.filter(u => memberIds.includes(u.id) || u.id === id);
  }
  res.json(users.map(sanitize));
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(sanitize(user));
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
  const { password, ...updates } = req.body;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDB(db);
  res.json(sanitize(db.users[idx]));
});

router.post('/', (req, res) => {
  const { role } = req.user;
  if (!['coordenador', 'supervisor'].includes(role)) return res.status(403).json({ error: 'Sem permissão' });
  const db = readDB();
  const user = { id: uuidv4().slice(0, 8), password: 'demo123', createdAt: new Date().toISOString().slice(0,10), ...req.body };
  db.users.push(user);
  writeDB(db);
  res.status(201).json(sanitize(user));
});

module.exports = router;
