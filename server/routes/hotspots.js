const express = require('express');
const db = require('../database/init');
const router = express.Router();

function fmtHS(h) {
  try { return { ...h, agents: JSON.parse(h.agents || '[]'), actions: JSON.parse(h.actions || '[]') }; }
  catch { return h; }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM hotspots ORDER BY rank ASC').all();
  res.json(rows.map(fmtHS));
});

router.get('/:id', (req, res) => {
  const h = db.prepare('SELECT * FROM hotspots WHERE id = ?').get(req.params.id);
  if (!h) return res.status(404).json({ error: 'Hotspot nao encontrado' });
  res.json(fmtHS(h));
});

module.exports = router;
