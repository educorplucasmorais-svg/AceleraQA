// ACELERA - Mock Auth & Routing
const ROLES = {
  coordenador: { label: 'Coordenador Regional', dashboard: 'dashboard-coordenador.html', name: 'Eduardo Silveira' },
  supervisor:  { label: 'Supervisor',            dashboard: 'dashboard-supervisor.html',  name: 'Carlos Moreira' },
  analista:    { label: 'Analista',              dashboard: 'dashboard-analista.html',    name: 'Ana Lima' },
};

function login(email, password, role) {
  if (!email || !password) return { ok: false, msg: 'Preencha e-mail e código de acesso.' };
  const user = { email, role, name: ROLES[role]?.name || email, ts: Date.now() };
  localStorage.setItem('acelera_session', JSON.stringify(user));
  return { ok: true, redirect: ROLES[role]?.dashboard || 'login.html' };
}

function logout() {
  localStorage.removeItem('acelera_session');
  window.location.href = 'login.html';
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('acelera_session')); }
  catch { return null; }
}

function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'login.html'; return null; }
  return s;
}
