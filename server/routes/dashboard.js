const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function readDB() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/db.json'), 'utf8'));
}

router.get('/', (req, res) => {
  const db = readDB();
  const { id, role } = req.user;

  const userNotifications = db.notifications.filter(n => n.userId === id);

  if (role === 'coordenador') {
    const supervisors = db.users.filter(u => u.role === 'supervisor');
    const analysts = db.users.filter(u => u.role === 'analista');
    return res.json({
      kpis: {
        performance: 94.2,
        trend: 2.4,
        supervisors: supervisors.length,
        analysts: analysts.length,
        compliance: 88,
        hotspots: db.hotspots.filter(h => h.status === 'critico').length
      },
      hotspots: db.hotspots,
      supervisorRanking: supervisors.map(s => ({
        ...s,
        rvv: Math.floor(Math.random() * 20 + 80),
        aceite: (Math.random() * 10 + 90).toFixed(1)
      })),
      notifications: userNotifications,
      reports: db.reports
    });
  }

  if (role === 'supervisor') {
    const myTeam = db.teams.find(t => t.supervisorId === id);
    const memberIds = myTeam ? myTeam.members : [];
    const members = db.users.filter(u => memberIds.includes(u.id));
    const myFeedbacks = db.feedbacks.filter(f => f.authorId === id);
    const myOneonones = db.oneonones.filter(o => o.supervisorId === id);
    return res.json({
      rvv: { value: 88.4, trend: 2.1 },
      team: members,
      feedbacks: myFeedbacks,
      oneonones: myOneonones,
      notifications: userNotifications,
      aceleradores: 4.8,
      deflatores: -2.4
    });
  }

  if (role === 'analista') {
    const myFeedbacks = db.feedbacks.filter(f => f.userId === id);
    const myOneonones = db.oneonones.filter(o => o.analistaId === id);
    const myDocs = db.documents.filter(d => d.userId === id);
    const nextOneonone = myOneonones.find(o => o.status === 'agendado');
    return res.json({
      score: { value: 84.2, trend: 2.4, quality: 92, speed: 76 },
      rvv: { value: 12400, target: 15000 },
      quartil: 'Q1',
      feedbacks: myFeedbacks,
      oneonones: myOneonones,
      nextOneonone,
      documents: myDocs,
      notifications: userNotifications,
      pdi: { title: 'Especialização em Inteligência Preditiva', progress: 68, deadline: 'Julho 2024' }
    });
  }

  res.json({ notifications: userNotifications });
});

module.exports = router;
