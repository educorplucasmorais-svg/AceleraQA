const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function readDB() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/db.json'), 'utf8'));
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Credenciais inválidas' });
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, team: user.team } });
});

router.post('/logout', (req, res) => res.json({ ok: true }));

module.exports = router;
