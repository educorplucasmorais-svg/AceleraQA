const express = require('express');
const db = require('../database/init');
const router = express.Router();

router.get('/', (req, res) => {
  const { id, role } = req.user;

  const userNotifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(id)
    .map(n => ({ ...n, read: n.read === 1 }));

  // Admin impersonation: use X-Admin-View header if present
  const adminView = req.headers['x-admin-view'];
  const effectiveRole = (role === 'admin' && adminView) ? adminView : (role === 'admin') ? 'coordenador' : role;

  if (effectiveRole === 'coordenador') {
    const supervisors = db.prepare("SELECT * FROM users WHERE role = 'supervisor'").all();
    const analysts = db.prepare("SELECT * FROM users WHERE role = 'analista'").all();
    const hotspots = db.prepare('SELECT * FROM hotspots ORDER BY rank ASC').all().map(h => ({
      ...h, agents: JSON.parse(h.agents||'[]'), actions: JSON.parse(h.actions||'[]')
    }));
    return res.json({
      role: role,
      kpis: {
        performance: 94.2, trend: 2.4,
        supervisors: supervisors.length, analysts: analysts.length,
        compliance: 88, hotspots: hotspots.filter(h => h.status === 'critico').length
      },
      hotspots,
      supervisorRanking: supervisors.map(s => ({ ...s, rvv: 80 + Math.floor(Math.random()*20), aceite: (90 + Math.random()*10).toFixed(1) })),
      notifications: userNotifications,
      reports: db.prepare('SELECT * FROM reports ORDER BY generated_at DESC').all()
    });
  }

  if (effectiveRole === 'supervisor') {
    const myTeam = db.prepare('SELECT * FROM teams WHERE supervisor_id = ?').get(id);
    const memberIds = myTeam ? JSON.parse(myTeam.members || '[]') : [];
    const members = memberIds.length ? db.prepare(`SELECT * FROM users WHERE id IN (${memberIds.map(()=>'?').join(',')})`).all(...memberIds) : [];
    return res.json({
      role: role,
      rvv: { value: 88.4, trend: 2.1 },
      team: members,
      feedbacks: db.prepare('SELECT * FROM feedbacks WHERE author_id = ? ORDER BY created_at DESC').all(id),
      oneonones: db.prepare('SELECT * FROM oneonones WHERE supervisor_id = ? ORDER BY date DESC').all(id),
      notifications: userNotifications,
      aceleradores: 4.8, deflatores: -2.4
    });
  }

  if (effectiveRole === 'analista') {
    const myOneonones = db.prepare('SELECT * FROM oneonones WHERE analista_id = ? ORDER BY date DESC').all(id);
    return res.json({
      role: role,
      score: { value: 84.2, trend: 2.4, quality: 92, speed: 76 },
      rvv: { value: 12400, target: 15000 },
      quartil: 'Q1',
      feedbacks: db.prepare('SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC').all(id),
      oneonones: myOneonones,
      nextOneonone: myOneonones.find(o => o.status === 'agendado'),
      documents: db.prepare('SELECT * FROM documents WHERE user_id = ?').all(id),
      notifications: userNotifications,
      pdi: { title: 'Especialização em Inteligência Preditiva', progress: 68, deadline: 'Julho 2024' }
    });
  }

  res.json({ role, notifications: userNotifications });
});

module.exports = router;
