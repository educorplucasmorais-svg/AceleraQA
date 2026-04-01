const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function readDB() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/db.json'), 'utf8'));
}

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.hotspots);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const h = db.hotspots.find(h => h.id === req.params.id);
  if (!h) return res.status(404).json({ error: 'Hotspot não encontrado' });
  res.json(h);
});

module.exports = router;
