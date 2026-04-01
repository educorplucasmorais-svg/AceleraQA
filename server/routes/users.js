const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const router = express.Router();

function sanitize(u) { const { password, ...rest } = u; return rest; }

router.get('/', (req, res) => {
  const { id, role } = req.user;
  let users;
  if (role === 'supervisor') {
    const team = db.prepare('SELECT members FROM teams WHERE supervisor_id = ?').get(id);
    const members = team ? JSON.parse(team.members || '[]') : [];
    const ids = [id, ...members];
    const placeholders = ids.map(() => '?').join(',');
    users = db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`).all(...ids);
  } else {
    users = db.prepare('SELECT * FROM users ORDER BY role, name').all();
  }
  res.json({ users: users.map(sanitize) });
});

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
  res.json(sanitize(user));
});

router.post('/', (req, res) => {
  const { role } = req.user;
  if (!['coordenador', 'supervisor'].includes(role)) return res.status(403).json({ error: 'Sem permissao' });
  const { name, email, password, team, avatar } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nome e e-mail sao obrigatorios' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'E-mail ja cadastrado' });
  const newId = uuidv4().slice(0, 8);
  const userRole = req.body.role || 'analista';
  const avatarVal = avatar || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  db.prepare('INSERT INTO users (id, name, email, password, role, team, avatar, score, trend, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(newId, name, email, password || 'demo123', userRole, team || '', avatarVal, req.body.score || 0, req.body.trend || '+0.0', req.body.status || 'ativo', new Date().toISOString().slice(0, 10));
  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
  res.status(201).json(sanitize(newUser));
});

router.put('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
  const { name, email, role, team, avatar, score, trend, status } = req.body;
  if (email && email !== user.email) {
    const dup = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (dup) return res.status(409).json({ error: 'E-mail ja utilizado' });
  }
  db.prepare('UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), role=COALESCE(?,role), team=COALESCE(?,team), avatar=COALESCE(?,avatar), score=COALESCE(?,score), trend=COALESCE(?,trend), status=COALESCE(?,status) WHERE id=?')
    .run(name||null, email||null, role||null, team||null, avatar||null, score||null, trend||null, status||null, req.params.id);
  res.json(sanitize(db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  if (req.user.role !== 'coordenador') return res.status(403).json({ error: 'Apenas coordenadores podem remover usuarios' });
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Voce nao pode remover seu proprio usuario' });
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Usuario nao encontrado' });
  res.json({ ok: true });
});

module.exports = router;
