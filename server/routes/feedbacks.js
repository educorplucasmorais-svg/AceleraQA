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
  let feedbacks = db.feedbacks;
  if (role === 'analista') feedbacks = feedbacks.filter(f => f.userId === id);
  else if (role === 'supervisor') {
    const team = db.teams.find(t => t.supervisorId === id);
    const memberIds = team ? team.members : [];
    feedbacks = feedbacks.filter(f => f.authorId === id || memberIds.includes(f.userId));
  }
  res.json(feedbacks);
});

router.post('/', (req, res) => {
  const db = readDB();
  const fb = { id: 'f' + uuidv4().slice(0, 8), authorId: req.user.id, ...req.body, createdAt: new Date().toISOString().slice(0,10), date: new Date().toISOString().slice(0,10) };
  db.feedbacks.push(fb);
  writeDB(db);
  res.status(201).json(fb);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const fb = db.feedbacks.find(f => f.id === req.params.id);
  if (!fb) return res.status(404).json({ error: 'Feedback não encontrado' });
  res.json(fb);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.feedbacks.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Feedback não encontrado' });
  db.feedbacks[idx] = { ...db.feedbacks[idx], ...req.body };
  writeDB(db);
  res.json(db.feedbacks[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.feedbacks.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Feedback não encontrado' });
  db.feedbacks.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

module.exports = router;
