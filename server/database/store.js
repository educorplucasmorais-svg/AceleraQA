'use strict';
// ─── IN-MEMORY STORE ─────────────────────────────────────────────────────────
// Pure JS fallback for environments where better-sqlite3 (native module) is unavailable (eg Vercel)
// Mimics the better-sqlite3 synchronous API: db.prepare(sql).get/all/run(params)

const { v4: uuidv4 } = require('uuid');

const tables = {
  users: [
    { id:'1',     name:'Eduardo Silveira', email:'eduardo@quintoandar.com', password:'demo123', role:'coordenador', team:'Região Sul',    avatar:'ES', score:88.0, trend:'+0.8', status:'ativo',   created_at:'2024-01-15' },
    { id:'2',     name:'Carlos Moreira',   email:'carlos@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Alpha', avatar:'CM', score:84.2, trend:'+1.2', status:'ativo',   created_at:'2024-01-20' },
    { id:'3',     name:'Ana Lima',         email:'ana@quintoandar.com',     password:'demo123', role:'analista',    team:'Equipe Alpha', avatar:'AL', score:84.2, trend:'+0.5', status:'ativo',   created_at:'2024-02-01' },
    { id:'4',     name:'Renata Mendes',    email:'renata@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Beta',  avatar:'RM', score:79.8, trend:'-0.5', status:'ativo',   created_at:'2024-01-10' },
    { id:'5',     name:'Thiago Pereira',   email:'thiago@quintoandar.com',  password:'demo123', role:'supervisor',  team:'Equipe Gamma', avatar:'TP', score:91.1, trend:'+3.4', status:'ativo',   created_at:'2024-01-12' },
    { id:'6',     name:'Fernanda Costa',   email:'fernanda@quintoandar.com',password:'demo123', role:'supervisor',  team:'Equipe Beta',  avatar:'FC', score:79.8, trend:'-0.5', status:'ativo',   created_at:'2024-01-10' },
    { id:'7',     name:'Roberto Alves',    email:'roberto@quintoandar.com', password:'demo123', role:'supervisor',  team:'Equipe Gama',  avatar:'RA', score:91.1, trend:'+3.4', status:'ativo',   created_at:'2024-01-08' },
    { id:'8',     name:'João Santos',      email:'joao@quintoandar.com',    password:'demo123', role:'analista',    team:'Equipe Alpha', avatar:'JS', score:78.5, trend:'+0.2', status:'ativo',   created_at:'2024-02-10' },
    { id:'admin', name:'Admin Master',     email:'admin@admin',             password:'admin123',role:'admin',       team:'Admin',        avatar:'AD', score:100,  trend:'+0.0', status:'ativo',   created_at:'2024-01-01' },
  ],
  feedbacks: [
    { id:'f001', user_id:'3', author_id:'2', type:'positivo',      title:'Excelente atendimento',         content:'Ana demonstrou ótimo desempenho.', tags:'["atendimento","destaque"]', date:'2024-03-10', created_at:'2024-03-10' },
    { id:'f002', user_id:'8', author_id:'2', type:'desenvolvimento',title:'Melhoria: tempo de resposta',   content:'João precisa melhorar TMR.',       tags:'["tempo","velocidade"]',     date:'2024-03-08', created_at:'2024-03-08' },
  ],
  oneonones: [
    { id:'o001', supervisor_id:'2', analista_id:'3', title:'1:1 Mensal',         date:'2024-04-15', time:'10:00', status:'agendado',  notes:'',                         created_at:'2024-03-15' },
    { id:'o002', supervisor_id:'2', analista_id:'8', title:'Review de Performance',date:'2024-03-20',time:'14:00', status:'concluido', notes:'Plano de melhoria discutido.', created_at:'2024-03-01' },
  ],
  notifications: [
    { id:'n001', user_id:'1', title:'Novo feedback registrado', body:'Carlos registrou feedback para Ana Lima.', type:'feedback',  read:0, created_at:'2024-03-10' },
    { id:'n002', user_id:'2', title:'1:1 agendado',             body:'Seu 1:1 com Ana Lima está agendado para 15/04.', type:'oneonone', read:0, created_at:'2024-03-15' },
  ],
  hotspots: [
    { id:'h001', name:'Equipe Beta',  rank:1, status:'critico',  score:62.4, agents:'["Ana Lima","Pedro Costa"]', actions:'["Feedback imediato","PDI acelerado"]', created_at:'2024-03-01' },
    { id:'h002', name:'Equipe Gamma', rank:2, status:'atencao',  score:71.8, agents:'["Lucas Ferreira"]',         actions:'["Acompanhamento semanal"]',          created_at:'2024-03-01' },
  ],
  reports: [
    { id:'r001', title:'Relatório Mensal Q1', type:'executivo', generated_by:'1', generated_at:'2024-03-31', data:'{}' },
  ],
  documents: [
    { id:'d001', user_id:'3', title:'PDI 2024', type:'pdi', url:'#', created_at:'2024-01-15' },
  ],
  teams: [
    { id:'t001', name:'Equipe Alpha', supervisor_id:'2', members:'["3","8"]', created_at:'2024-01-01' },
    { id:'t002', name:'Equipe Beta',  supervisor_id:'4', members:'[]',        created_at:'2024-01-01' },
    { id:'t003', name:'Equipe Gamma', supervisor_id:'5', members:'[]',        created_at:'2024-01-01' },
    { id:'t004', name:'Equipe Gama',  supervisor_id:'7', members:'[]',        created_at:'2024-01-01' },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function tbl(name) {
  if (!tables[name]) tables[name] = [];
  return tables[name];
}

// Split string by commas that are NOT inside parentheses
function splitCommasTop(str) {
  const parts = []; let depth = 0; let cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// Parse WHERE clause; returns { filter: fn(row)→bool, pi: paramsConsumed }
function parseWhere(sql, params, startPi = 0) {
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|;?\s*$)/is);
  if (!whereMatch) return { filter: () => true, pi: startPi };
  const clause = whereMatch[1].trim();
  let pi = startPi;

  // Split by OR
  const orGroups = clause.split(/\s+OR\s+/i).map(part => {
    // Split each OR segment by AND
    return part.split(/\s+AND\s+/i).map(cond => {
      cond = cond.trim();
      // IN (?,?,...) or IN (NULL)
      const inMatch = cond.match(/^(\w+)\s+IN\s*\(([^)]*)\)/i);
      if (inMatch) {
        const col = inMatch[1];
        const inner = inMatch[2].trim();
        if (!inner || inner.toUpperCase() === 'NULL') return { col, op: 'in', vals: [] };
        const count = (inner.match(/\?/g) || []).length;
        const vals = params.slice(pi, pi + count);
        pi += count;
        return { col, op: 'in', vals };
      }
      // col != ?
      const neqMatch = cond.match(/^(\w+)\s*!=\s*\?/i);
      if (neqMatch) return { col: neqMatch[1], op: 'neq', val: params[pi++] };
      // col = 'literal'
      const litMatch = cond.match(/^(\w+)\s*=\s*'([^']*)'/i);
      if (litMatch) return { col: litMatch[1], op: 'eq', val: litMatch[2] };
      // col = ? 
      const eqMatch = cond.match(/^(\w+)\s*=\s*\?/i);
      if (eqMatch) return { col: eqMatch[1], op: 'eq', val: params[pi++] };
      return null;
    }).filter(Boolean);
  });

  const filter = row => orGroups.some(andGroup => andGroup.every(c => {
    const v = String(row[c.col] ?? '');
    if (c.op === 'eq')  return v === String(c.val);
    if (c.op === 'neq') return v !== String(c.val);
    if (c.op === 'in')  return c.vals.length ? c.vals.map(String).includes(v) : false;
    return true;
  }));

  return { filter, pi };
}

function applyOrder(rows, sql) {
  const m = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|;?\s*$)/is);
  if (!m) return rows;
  const parts = m[1].trim().split(/\s*,\s*/);
  return [...rows].sort((a, b) => {
    for (const p of parts) {
      const [col, dir] = p.trim().split(/\s+/);
      const cmp = String(a[col] ?? '').localeCompare(String(b[col] ?? ''), undefined, { numeric: true });
      if (cmp !== 0) return dir && dir.toUpperCase() === 'DESC' ? -cmp : cmp;
    }
    return 0;
  });
}

// ─── QUERY EXECUTORS ─────────────────────────────────────────────────────────

function execSelect(sql, params) {
  const tblMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tblMatch) return [];
  const rows = tbl(tblMatch[1]);
  const { filter } = parseWhere(sql, params);
  let result = rows.filter(filter);
  result = applyOrder(result, sql);

  // Column projection (SELECT col1,col2 FROM ...)
  const colsMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
  if (colsMatch && colsMatch[1].trim() !== '*') {
    const cols = colsMatch[1].split(',').map(c => c.trim());
    result = result.map(row => { const o = {}; cols.forEach(c => { o[c] = row[c]; }); return o; });
  }
  return result;
}

function execInsert(sql, params) {
  const tblMatch = sql.match(/INTO\s+(\w+)/i);
  if (!tblMatch) return { changes: 0 };
  const colsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
  if (!colsMatch) return { changes: 0 };
  const cols = colsMatch[1].split(',').map(c => c.trim());
  const row = {};
  cols.forEach((col, i) => { row[col] = params[i] ?? null; });
  tbl(tblMatch[1]).push(row);
  return { changes: 1, lastInsertRowid: row.id };
}

function execUpdate(sql, params) {
  const tblMatch = sql.match(/UPDATE\s+(\w+)/i);
  if (!tblMatch) return { changes: 0 };
  const rows = tbl(tblMatch[1]);

  const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
  if (!setMatch) return { changes: 0 };

  let pi = 0;
  const assignments = splitCommasTop(setMatch[1]).map(part => {
    // COALESCE(?,col)
    const coa = part.match(/^(\w+)\s*=\s*COALESCE\s*\(\s*\?\s*,\s*\w+\s*\)/i);
    if (coa) return { col: coa[1], val: params[pi++], coalesce: true };
    // col = ?
    const eq = part.match(/^(\w+)\s*=\s*\?/i);
    if (eq) return { col: eq[1], val: params[pi++], coalesce: false };
    // col = literal (number or string)
    const lit = part.match(/^(\w+)\s*=\s*(\d+(?:\.\d+)?|'[^']*')/i);
    if (lit) {
      const raw = lit[2];
      const val = raw.startsWith("'") ? raw.slice(1, -1) : Number(raw);
      return { col: lit[1], val, coalesce: false, literal: true };
    }
    return null;
  }).filter(Boolean);

  // WHERE clause starts at pi
  const whereStr = 'WHERE ' + sql.split(/WHERE\s+/i).slice(1).join('WHERE ');
  const { filter } = parseWhere(whereStr, params, pi);

  let changes = 0;
  for (const row of rows) {
    if (filter(row)) {
      for (const a of assignments) {
        if (a.coalesce && (a.val === null || a.val === undefined)) continue;
        row[a.col] = a.val;
      }
      changes++;
    }
  }
  return { changes };
}

function execDelete(sql, params) {
  const tblMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tblMatch) return { changes: 0 };
  const name = tblMatch[1];
  const rows = tbl(name);
  const { filter } = parseWhere(sql, params);
  const before = rows.length;
  tables[name] = rows.filter(r => !filter(r));
  return { changes: before - tables[name].length };
}

// ─── BETTER-SQLITE3 COMPATIBLE INTERFACE ─────────────────────────────────────

function prepare(sql) {
  return {
    get(...args)  { return execSelect(sql, args.flat())[0] ?? null; },
    all(...args)  { return execSelect(sql, args.flat()); },
    run(...args)  {
      const u = sql.trimStart().toUpperCase();
      const p = args.flat();
      if (u.startsWith('INSERT')) return execInsert(sql, p);
      if (u.startsWith('UPDATE')) return execUpdate(sql, p);
      if (u.startsWith('DELETE')) return execDelete(sql, p);
      return { changes: 0 };
    },
  };
}

function pragma() {}
function exec()   {}

module.exports = { prepare, pragma, exec, tables };
