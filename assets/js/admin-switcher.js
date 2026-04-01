// ACELERA — Admin Master View Switcher
// Injected in all dashboards — only visible when role === 'admin'
(function() {
  function init() {
    const user = (typeof ACELERA_API !== 'undefined') ? ACELERA_API.getUser() : null;
    if (!user || user.role !== 'admin') return;

    const current = window.location.pathname.split('/').pop() || 'dashboard-coordenador.html';

    // Sync admin view with current page on load
    const views = [
      { id: 'coordenador', label: 'Coordenador', icon: 'supervisor_account', url: 'dashboard-coordenador.html', color: '#004f96' },
      { id: 'supervisor',  label: 'Supervisor',  icon: 'manage_accounts',    url: 'dashboard-supervisor.html', color: '#ab3600' },
      { id: 'analista',    label: 'Operador',     icon: 'analytics',          url: 'dashboard-analista.html',   color: '#005b3b' },
    ];
    const activeView = views.find(v => current.includes(v.id));
    if (activeView) localStorage.setItem('acelera_admin_view', activeView.id);

    const bar = document.createElement('div');
    bar.id = 'admin-switcher';
    bar.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      height: 36px;
      background: linear-gradient(135deg, #1a0030 0%, #0a1628 50%, #001a0a 100%);
      display: flex; align-items: center; justify-between;
      padding: 0 16px;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      border-bottom: 1px solid rgba(166,200,255,0.15);
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    `;

    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex:1">
        <div style="display:flex;align-items:center;gap:6px;padding:2px 10px 2px 6px;background:rgba(255,50,50,0.15);border:1px solid rgba(255,80,80,0.3);border-radius:20px">
          <span style="width:7px;height:7px;border-radius:50%;background:#ff4444;box-shadow:0 0 6px #ff4444;animation:pulse 2s infinite;flex-shrink:0"></span>
          <span style="font-size:9px;color:#ff8888;font-weight:700;text-transform:uppercase;letter-spacing:0.15em">ADMIN MASTER</span>
        </div>
        <span style="font-size:9px;color:rgba(166,200,255,0.5);letter-spacing:0.05em">admin@admin</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <span style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-right:6px">Visão:</span>
        ${views.map(v => `
          <button onclick="adminSwitchView('${v.url}','${v.id}')"
            id="asw-${v.id}"
            style="
              display:flex;align-items:center;gap:5px;
              padding:3px 10px;border-radius:4px;border:none;cursor:pointer;
              font-family:inherit;font-size:9px;font-weight:700;
              text-transform:uppercase;letter-spacing:0.1em;
              transition:all 0.15s;
              background:${current.includes(v.id)?v.color:'rgba(255,255,255,0.06)'};
              color:${current.includes(v.id)?'#fff':'rgba(255,255,255,0.45)'};
              ${current.includes(v.id)?'box-shadow:0 0 8px '+v.color+'60;':''}
            "
          >${v.label}</button>
        `).join('')}
      </div>
      <div style="flex:1;display:flex;justify-content:flex-end;align-items:center;gap:8px">
        <button onclick="adminLogout()" style="
          display:flex;align-items:center;gap:4px;padding:3px 10px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
          border-radius:4px;cursor:pointer;font-family:inherit;
          font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;
          letter-spacing:0.1em;transition:all 0.15s;
        " onmouseover="this.style.background='rgba(255,80,80,0.15)';this.style.color='#ff8888'" onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.color='rgba(255,255,255,0.4)'">
          ✕ Sair
        </button>
      </div>
    `;

    // Offset main content so bar doesn't overlap header
    document.body.style.paddingTop = '36px';
    document.body.insertBefore(bar, document.body.firstChild);

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.9)} }`;
    document.head.appendChild(style);
  }

  window.adminSwitchView = function(url, viewId) {
    localStorage.setItem('acelera_admin_view', viewId);
    window.location.href = url;
  };

  window.adminLogout = function() {
    if (typeof ACELERA_API !== 'undefined') ACELERA_API.clearToken();
    window.location.href = '/login.html';
  };

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
