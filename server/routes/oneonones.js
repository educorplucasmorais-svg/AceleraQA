const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

router.get('/', (req, res) => {
  const db = readDB();
  const { id, role } = req.user;
  let list = db.oneonones;
  if (role === 'supervisor') list = list.filter(o => o.supervisorId === id);
  else if (role === 'analista') list = list.filter(o => o.analistaId === id);
  res.json(list);
});

router.post('/', (req, res) => {
  const db = readDB();
  const o = { id: 'o' + uuidv4().slice(0, 8), status: 'agendado', ...req.body, createdAt: new Date().toISOString().slice(0,10) };
  db.oneonones.push(o);
  writeDB(db);
  res.status(201).json(o);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.oneonones.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'One-on-One não encontrado' });
  db.oneonones[idx] = { ...db.oneonones[idx], ...req.body };
  writeDB(db);
  res.json(db.oneonones[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.oneonones.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'One-on-One não encontrado' });
  db.oneonones.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

module.exports = router;
