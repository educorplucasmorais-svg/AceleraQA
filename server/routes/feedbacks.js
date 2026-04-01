const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const router = express.Router();

function parseJSON(val, fallback = []) {
  try { return JSON.parse(val); } catch { return fallback; }
}
function fmtFeedback(f) {
  return { ...f, tags: parseJSON(f.tags, []), userId: f.user_id, authorId: f.author_id, createdAt: f.created_at };
}

router.get('/', (req, res) => {
  const { id, role } = req.user;
  let rows;
  if (role === 'analista') {
    rows = db.prepare('SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC').all(id);
  } else if (role === 'supervisor') {
    const team = db.prepare('SELECT members FROM teams WHERE supervisor_id = ?').get(id);
    const memberIds = team ? parseJSON(team.members, []) : [];
    const placeholders = [id, ...memberIds].map(() => '?').join(',');
    rows = db.prepare(`SELECT * FROM feedbacks WHERE author_id = ? OR user_id IN (${memberIds.length ? memberIds.map(()=>'?').join(',') : 'NULL'}) ORDER BY created_at DESC`).all(id, ...memberIds);
  } else {
    rows = db.prepare('SELECT * FROM feedbacks ORDER BY created_at DESC').all();
  }
  res.json(rows.map(fmtFeedback));
});

router.post('/', (req, res) => {
  const { userId, type, title, content, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  const id = 'f' + uuidv4().slice(0, 8);
  const today = new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO feedbacks (id, user_id, author_id, type, title, content, tags, date, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, userId || req.user.id, req.user.id, type || 'positivo', title, content, JSON.stringify(tags || []), today, today);
  const fb = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(id);
  res.status(201).json(fmtFeedback(fb));
});

router.get('/:id', (req, res) => {
  const fb = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(req.params.id);
  if (!fb) return res.status(404).json({ error: 'Feedback não encontrado' });
  res.json(fmtFeedback(fb));
});

router.put('/:id', (req, res) => {
  const fb = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(req.params.id);
  if (!fb) return res.status(404).json({ error: 'Feedback não encontrado' });
  const { type, title, content, tags } = req.body;
  db.prepare('UPDATE feedbacks SET type=COALESCE(?,type), title=COALESCE(?,title), content=COALESCE(?,content), tags=COALESCE(?,tags) WHERE id=?')
    .run(type||null, title||null, content||null, tags ? JSON.stringify(tags) : null, req.params.id);
  res.json(fmtFeedback(db.prepare('SELECT * FROM feedbacks WHERE id=?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM feedbacks WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Feedback não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
