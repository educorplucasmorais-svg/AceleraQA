'use strict';
// On Vercel/serverless: always use pure-JS in-memory store — do NOT touch native modules
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  console.log('🌐 Vercel mode — using in-memory store');
  module.exports = require('./store');
  return;
}

// Local dev: use better-sqlite3 (native, WAL mode, full persistence)
let Database;
try {
  Database = require('better-sqlite3');
} catch (_) {
  console.warn('⚠️  better-sqlite3 not available — using in-memory store');
  module.exports = require('./store');
  return;
}

const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'acelera.db');
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── SCHEMA ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'analista',
    team        TEXT DEFAULT '',
    avatar      TEXT DEFAULT '',
    score       REAL DEFAULT 0,
    trend       TEXT DEFAULT '+0.0',
    status      TEXT DEFAULT 'ativo',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedbacks (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    author_id   TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'positivo',
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    tags        TEXT DEFAULT '[]',
    date        TEXT DEFAULT (date('now')),
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS oneonones (
    id            TEXT PRIMARY KEY,
    supervisor_id TEXT NOT NULL,
    analista_id   TEXT NOT NULL,
    title         TEXT NOT NULL DEFAULT '1:1',
    date          TEXT NOT NULL,
    time          TEXT NOT NULL DEFAULT '10:00',
    status        TEXT NOT NULL DEFAULT 'agendado',
    notes         TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analista_id)   REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'doc',
    status      TEXT NOT NULL DEFAULT 'ativo',
    expires_at  TEXT,
    user_id     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'info',
    read        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS hotspots (
    id           TEXT PRIMARY KEY,
    rank         INTEGER NOT NULL DEFAULT 1,
    unit         TEXT NOT NULL,
    process      TEXT NOT NULL,
    occurrences  INTEGER NOT NULL DEFAULT 0,
    period       TEXT DEFAULT 'Últimos 7 dias',
    status       TEXT NOT NULL DEFAULT 'alerta',
    agents       TEXT DEFAULT '[]',
    description  TEXT DEFAULT '',
    actions      TEXT DEFAULT '[]',
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teams (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    supervisor_id TEXT NOT NULL,
    members       TEXT DEFAULT '[]',
    region        TEXT DEFAULT '',
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reports (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    type         TEXT NOT NULL DEFAULT 'executivo',
    generated_at TEXT DEFAULT (date('now')),
    generated_by TEXT NOT NULL,
    data         TEXT DEFAULT '{}',
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ─── SEED (only if users table is empty) ───────────────────────────────────────

// Always ensure admin master user exists (upsert on startup)
db.prepare(`
  INSERT INTO users (id, name, email, password, role, team, avatar, score, trend, status, created_at)
  VALUES ('admin','Admin Master','admin@admin','admin123','admin','Sistema','AM',100,'+0.0','ativo','2024-01-01')
  ON CONFLICT(email) DO UPDATE SET password='admin123', role='admin'
`).run();

const count = db.prepare('SELECT COUNT(*) as n FROM users WHERE id != ?').get('admin');
if (count.n === 0) {
  const seed = db.transaction(() => {
    // Users
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, role, team, avatar, score, trend, status, created_at)
      VALUES (@id, @name, @email, @password, @role, @team, @avatar, @score, @trend, @status, @created_at)
    `);
    const users = [
      { id:'1', name:'Eduardo Silveira', email:'eduardo@quintoandar.com', password:'demo123', role:'coordenador', team:'Região Sul', avatar:'ES', score:88.0, trend:'+0.8', status:'ativo', created_at:'2024-01-15' },
      { id:'2', name:'Carlos Moreira',   email:'carlos@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Alpha', avatar:'CM', score:84.2, trend:'+1.2', status:'ativo', created_at:'2024-01-20' },
      { id:'3', name:'Ana Lima',         email:'ana@quintoandar.com',     password:'demo123', role:'analista',    team:'Equipe Alpha', avatar:'AL', score:84.2, trend:'+0.5', status:'ativo', created_at:'2024-02-01' },
      { id:'4', name:'Renata Mendes',    email:'renata@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Beta',  avatar:'RM', score:79.8, trend:'-0.5', status:'ativo', created_at:'2024-01-10' },
      { id:'5', name:'Thiago Pereira',   email:'thiago@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Gamma', avatar:'TP', score:91.1, trend:'+3.4', status:'ativo', created_at:'2024-01-12' },
      { id:'6', name:'Fernanda Costa',   email:'fernanda@quintoandar.com',password:'demo123', role:'supervisor',  team:'Equipe Beta',  avatar:'FC', score:79.8, trend:'-0.5', status:'ativo', created_at:'2024-01-10' },
      { id:'7', name:'Roberto Alves',    email:'roberto@quintoandar.com', password:'demo123', role:'supervisor',  team:'Equipe Gama',  avatar:'RA', score:91.1, trend:'+3.4', status:'ativo', created_at:'2024-01-08' },
      { id:'8', name:'João Santos',      email:'joao@quintoandar.com',    password:'demo123', role:'analista',    team:'Equipe Alpha', avatar:'JS', score:78.5, trend:'+0.2', status:'ativo', created_at:'2024-02-10' },
    ];
    users.forEach(u => insertUser.run(u));

    // Feedbacks
    const insertFeedback = db.prepare(`
      INSERT INTO feedbacks (id, user_id, author_id, type, title, content, tags, date, created_at)
      VALUES (@id, @user_id, @author_id, @type, @title, @content, @tags, @date, @created_at)
    `);
    [
      { id:'f1', user_id:'3', author_id:'2', type:'positivo',      title:'Feedback Trimestral de Performance', content:'Excelente evolução na precisão das análises. Tempo de resposta para casos nível 3 reduziu 15%.', tags:'["QUALIDADE","CELERIDADE"]', date:'2024-04-12', created_at:'2024-04-12' },
      { id:'f2', user_id:'3', author_id:'2', type:'reconhecimento', title:'Reconhecimento Individual',           content:'Destaque na resolução do incidente de conformidade #882. Postura proativa evitou atraso crítico.', tags:'["PROATIVIDADE"]', date:'2024-03-28', created_at:'2024-03-28' },
      { id:'f3', user_id:'3', author_id:'2', type:'construtivo',   title:'Ponto de Melhoria',                  content:'Atenção ao tempo de resposta nas manhãs de quarta-feira. Métricas de SLA apresentam queda consistente.', tags:'["SLA","PROCESSO"]', date:'2024-03-15', created_at:'2024-03-15' },
    ].forEach(f => insertFeedback.run(f));

    // One-on-Ones
    db.prepare(`INSERT INTO oneonones (id, supervisor_id, analista_id, title, date, time, status, notes, created_at) VALUES (?,?,?,?,?,?,?,?,?)`).run('o1','2','3','One-on-One Mensal','2024-05-02','14:30','agendado','Revisar score ACELERA e progresso no PDI','2024-04-28');
    db.prepare(`INSERT INTO oneonones (id, supervisor_id, analista_id, title, date, time, status, notes, created_at) VALUES (?,?,?,?,?,?,?,?,?)`).run('o2','4','3','Alinhamento de SLA','2024-04-15','10:00','concluido','Discutido plano de ação para redução de TMA.','2024-04-10');

    // Documents
    const insertDoc = db.prepare(`INSERT INTO documents (id, title, type, status, expires_at, user_id, created_at) VALUES (?,?,?,?,?,?,?)`);
    insertDoc.run('d1','NDA Corporativo 2024','NDA','ativo','2025-01-01','3','2024-01-01');
    insertDoc.run('d2','Contrato de Trabalho','Contrato','ativo','2026-01-01','3','2024-01-15');
    insertDoc.run('d3','Política de Compliance Q1','Compliance','pendente','2024-06-30','3','2024-04-01');

    // Notifications
    const insertNotif = db.prepare(`INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?,?,?,?,?,?,?)`);
    insertNotif.run('n1','1','Novo hotspot detectado','Unidade Logística Sul-A atingiu 14 ocorrências nos últimos 7 dias.','alerta',0,'2024-04-01T10:00:00Z');
    insertNotif.run('n2','1','Relatório disponível','O relatório de performance de Março/2024 está pronto.','info',0,'2024-04-01T09:00:00Z');
    insertNotif.run('n3','1','Supervisor Q1 atualizado','Renata Mendes alcançou 98.2% de aceite este mês.','sucesso',1,'2024-03-31T15:00:00Z');
    insertNotif.run('n4','2','SLA crítico','Analista Ana Lima possui 1 SLA expirado e 1 próximo do vencimento.','alerta',0,'2024-04-01T08:00:00Z');
    insertNotif.run('n5','3','Feedback recebido','Você recebeu um novo feedback do seu supervisor.','info',0,'2024-04-01T07:00:00Z');

    // Hotspots
    const insertHS = db.prepare(`INSERT INTO hotspots (id, rank, unit, process, occurrences, period, status, agents, description, actions) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insertHS.run('h1',1,'Unidade Logística Sul-A','Processo de Triagem',14,'Últimos 7 dias','critico','["JD","ML","+2"]','Alta taxa de reincidência no processo de triagem matinal.','["Revisar SOP de triagem","Treinamento emergencial","Auditoria de processo"]');
    insertHS.run('h2',2,'Terminal Integrado Norte','Segurança Perimetral',9,'Últimos 7 dias','alerta','["RB","PF"]','Falhas recorrentes no controle de acesso perimetral.','["Revisão de protocolo","Reforço de equipe"]');
    insertHS.run('h3',3,'Centro de Distribuição Leste','Controle de Inventário',3,'Em mitigação','mitigacao','["AM"]','Inconsistências no inventário em processo de correção.','["Recontar estoque","Ajustar sistema ERP"]');

    // Teams
    db.prepare(`INSERT INTO teams (id, name, supervisor_id, members, region) VALUES (?,?,?,?,?)`).run('t1','Equipe Alpha','2','["3","8"]','Sul');
    db.prepare(`INSERT INTO teams (id, name, supervisor_id, members, region) VALUES (?,?,?,?,?)`).run('t2','Equipe Beta','4','[]','Norte');
    db.prepare(`INSERT INTO teams (id, name, supervisor_id, members, region) VALUES (?,?,?,?,?)`).run('t3','Equipe Gamma','5','[]','Centro-Oeste');

    // Reports
    const insertReport = db.prepare(`INSERT INTO reports (id, title, type, generated_at, generated_by, data) VALUES (?,?,?,?,?,?)`);
    insertReport.run('r1','Relatório Executivo — Março/2024','executivo','2024-04-01','1','{"performance":94.2,"trend":2.4,"supervisors":3,"analysts":1}');
    insertReport.run('r2','Relatório de Conformidade — Março/2024','conformidade','2024-04-01','1','{"compliance":88,"pending":2,"approved":14}');
    insertReport.run('r3','Relatório de Engajamento — Março/2024','engajamento','2024-04-01','1','{"engagement":82,"feedbacks":12,"oneonones":8}');
  });

  seed();
  console.log('  📦 Banco SQLite inicializado com dados de seed');
}

module.exports = db;
