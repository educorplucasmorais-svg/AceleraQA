const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const router = express.Router();

function fmtReport(r) {
  try { return { ...r, data: JSON.parse(r.data || '{}'), generatedBy: r.generated_by, generatedAt: r.generated_at }; }
  catch { return r; }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reports ORDER BY generated_at DESC').all();
  res.json({ reports: rows.map(fmtReport) });
});

router.post('/', (req, res) => {
  const { type, title } = req.body;
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const now = new Date();
  const typeMap = {
    executivo:   { performance: 94.2, trend: 2.4, supervisors: 3, analysts: 1 },
    conformidade: { compliance: 88, pending: 2, approved: 14 },
    engajamento:  { engagement: 82, feedbacks: 12, oneonones: 8 },
    performance:  { rvv: 88.4, aceite: 97.1, q1: 42, q4: 8 },
  };
  const id = 'r' + uuidv4().slice(0, 8);
  const reportTitle = title || `Relatório ${(type||'executivo').charAt(0).toUpperCase() + (type||'executivo').slice(1)} — ${months[now.getMonth()]}/${now.getFullYear()}`;
  db.prepare('INSERT INTO reports (id, title, type, generated_at, generated_by, data) VALUES (?,?,?,?,?,?)')
    .run(id, reportTitle, type || 'executivo', now.toISOString().slice(0,10), req.user.id, JSON.stringify(typeMap[type] || {}));
  res.status(201).json(fmtReport(db.prepare('SELECT * FROM reports WHERE id=?').get(id)));
});

// Legacy: /reports/generate (kept for backwards compat)
router.post('/generate', (req, res) => {
  req.body.type = req.body.type || 'executivo';
  return router.handle(Object.assign(req, { url: '/', method: 'POST' }), res, () => {});
});

module.exports = router;
