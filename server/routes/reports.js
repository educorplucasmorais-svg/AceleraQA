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
  res.json(db.reports);
});

router.post('/generate', (req, res) => {
  const db = readDB();
  const { type } = req.body;
  const typeMap = {
    executivo: { performance: 94.2, trend: 2.4, supervisors: 3, analysts: 1 },
    conformidade: { compliance: 88, pending: 2, approved: 14 },
    engajamento: { engagement: 82, feedbacks: 12, oneonones: 8 },
    performance: { rvv: 88.4, aceite: 97.1, q1: 42, q4: 8 }
  };
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const now = new Date();
  const report = {
    id: 'r' + uuidv4().slice(0, 8),
    title: `Relatório ${type.charAt(0).toUpperCase() + type.slice(1)} — ${months[now.getMonth()]}/${now.getFullYear()}`,
    type,
    generatedAt: now.toISOString().slice(0,10),
    generatedBy: req.user.id,
    data: typeMap[type] || {}
  };
  db.reports.unshift(report);
  writeDB(db);
  res.status(201).json(report);
});

module.exports = router;
