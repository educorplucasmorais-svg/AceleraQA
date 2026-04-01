const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const router = express.Router();

function fmtOO(o) {
  return { ...o, supervisorId: o.supervisor_id, analistaId: o.analista_id, createdAt: o.created_at };
}

router.get('/', (req, res) => {
  const { id, role } = req.user;
  let rows;
  if (role === 'supervisor') rows = db.prepare('SELECT * FROM oneonones WHERE supervisor_id = ? ORDER BY date DESC').all(id);
  else if (role === 'analista') rows = db.prepare('SELECT * FROM oneonones WHERE analista_id = ? ORDER BY date DESC').all(id);
  else rows = db.prepare('SELECT * FROM oneonones ORDER BY date DESC').all();
  res.json(rows.map(fmtOO));
});

router.post('/', (req, res) => {
  const { supervisorId, analistaId, title, date, time, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'Data é obrigatória' });
  const id = 'o' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO oneonones (id, supervisor_id, analista_id, title, date, time, status, notes, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, supervisorId || req.user.id, analistaId || req.user.id, title || '1:1', date, time || '10:00', 'agendado', notes || '', new Date().toISOString().slice(0,10));
  res.status(201).json(fmtOO(db.prepare('SELECT * FROM oneonones WHERE id=?').get(id)));
});

router.put('/:id', (req, res) => {
  const oo = db.prepare('SELECT * FROM oneonones WHERE id = ?').get(req.params.id);
  if (!oo) return res.status(404).json({ error: 'One-on-One não encontrado' });
  const { status, title, date, time, notes } = req.body;
  db.prepare('UPDATE oneonones SET status=COALESCE(?,status), title=COALESCE(?,title), date=COALESCE(?,date), time=COALESCE(?,time), notes=COALESCE(?,notes) WHERE id=?')
    .run(status||null, title||null, date||null, time||null, notes !== undefined ? notes : null, req.params.id);
  res.json(fmtOO(db.prepare('SELECT * FROM oneonones WHERE id=?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM oneonones WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'One-on-One não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
