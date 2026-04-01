const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/init');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Credenciais inválidas' });
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'acelera_secret_jwt_2025', { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, team: user.team, score: user.score } });
});

router.post('/logout', (req, res) => res.json({ ok: true }));

module.exports = router;
