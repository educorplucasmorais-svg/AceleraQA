const express = require('express');
const db = require('../database/init');
const router = express.Router();

router.get('/', (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ notifications: notifs.map(n => ({ ...n, userId: n.user_id, read: n.read === 1 })) });
});

router.put('/:id/read', (req, res) => {
  const n = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!n) return res.status(404).json({ error: 'Notificacao nao encontrada' });
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.put('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
