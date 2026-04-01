/* ACELERA UI System */
const ACELERA_UI = (() => {
  const COLORS = {
    primary: '#004f96',
    primaryGrad: 'linear-gradient(135deg,#004f96,#0067c0)',
    secondary: '#ab3600',
    tertiary: '#005b3b',
    error: '#ba1a1a',
    surface: '#f9f9fc',
    surfaceLow: '#f3f3f6',
    surfaceHigh: '#e8e8ea',
    white: '#ffffff',
    outline: '#717783',
    onSurface: '#1a1c1e',
    onSurfaceVariant: '#414752',
  };

  const inputStyle = `width:100%;padding:0.75rem;background:#f3f3f6;border:none;border-bottom:2px solid transparent;border-radius:0.25rem;font-size:0.875rem;outline:none;transition:border-color 0.2s;font-family:Inter,sans-serif;color:#1a1c1e;`;
  const labelStyle = `display:block;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#717783;margin-bottom:0.375rem;`;
  const btnPrimary = `background:linear-gradient(135deg,#004f96,#0067c0);color:#fff;padding:0.75rem 1.5rem;border:none;border-radius:0.5rem;cursor:pointer;font-weight:700;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;transition:opacity 0.2s;`;
  const btnSecondary = `background:transparent;color:#004f96;padding:0.75rem 1.5rem;border:1.5px solid #c1c6d4;border-radius:0.5rem;cursor:pointer;font-weight:700;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;transition:all 0.2s;`;

  // ── Modal System ───────────────────────────────────────────────────────────
  let activeModal = null;

  const modal = {
    open({ title, content, size = 'md', footer = '' }) {
      modal.close();
      const maxW = { sm: '400px', md: '500px', lg: '680px', xl: '820px' }[size] || '500px';
      const overlay = document.createElement('div');
      overlay.id = 'acelera-modal-overlay';
      overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;`;
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:0.5rem;max-width:${maxW};width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 48px -12px rgba(0,79,150,0.2);display:flex;flex-direction:column;" id="acelera-modal-card">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem 1rem;border-bottom:1px solid #e2e2e5;">
            <h3 style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#004f96;margin:0;">${title}</h3>
            <button onclick="ACELERA_UI.modal.close()" style="background:none;border:none;cursor:pointer;color:#717783;padding:0.25rem;border-radius:0.25rem;line-height:1;font-size:20px;" aria-label="Fechar">✕</button>
          </div>
          <div style="padding:1.5rem 2rem;flex:1;">${content}</div>
          ${footer ? `<div style="padding:1rem 2rem 1.5rem;border-top:1px solid #e2e2e5;display:flex;justify-content:flex-end;gap:0.75rem;">${footer}</div>` : ''}
        </div>`;
      overlay.addEventListener('click', (e) => { if (e.target === overlay) modal.close(); });
      document.body.appendChild(overlay);
      activeModal = overlay;
      // Focus trap
      setTimeout(() => {
        const first = overlay.querySelector('input,select,textarea,button');
        if (first) first.focus();
      }, 50);
    },
    close() {
      if (activeModal) { activeModal.remove(); activeModal = null; }
      const existing = document.getElementById('acelera-modal-overlay');
      if (existing) existing.remove();
    },
    confirm({ title, message, onConfirm, confirmLabel = 'Confirmar', danger = false }) {
      modal.open({
        title,
        content: `<p style="font-size:0.9rem;color:#414752;line-height:1.6;">${message}</p>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();(${onConfirm.toString()})();" style="${btnPrimary}${danger ? ';background:#ba1a1a;' : ''}">${confirmLabel}</button>`
      });
    }
  };

  // ── Toast System ──────────────────────────────────────────────────────────
  function ensureToastContainer() {
    let c = document.getElementById('acelera-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'acelera-toast-container';
      c.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:10000;display:flex;flex-direction:column;gap:0.75rem;pointer-events:none;';
      document.body.appendChild(c);
    }
    return c;
  }

  const typeStyles = {
    success: { bg: '#f0fdf4', border: '#16a34a', color: '#15803d', icon: '✓' },
    error:   { bg: '#fef2f2', border: '#ba1a1a', color: '#ba1a1a', icon: '✕' },
    warning: { bg: '#fffbeb', border: '#d97706', color: '#92400e', icon: '⚠' },
    info:    { bg: '#eff6ff', border: '#004f96', color: '#004f96', icon: 'ℹ' },
  };

  const toast = {
    show(message, type = 'info', duration = 3500) {
      const c = ensureToastContainer();
      const s = typeStyles[type] || typeStyles.info;
      const el = document.createElement('div');
      el.style.cssText = `background:${s.bg};border-left:4px solid ${s.border};color:${s.color};padding:0.875rem 1.25rem;border-radius:0.375rem;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.625rem;min-width:280px;max-width:380px;box-shadow:0 4px 16px rgba(0,0,0,0.1);pointer-events:auto;opacity:0;transform:translateX(1rem);transition:all 0.25s ease;font-family:Inter,sans-serif;`;
      el.innerHTML = `<span style="font-size:1rem;flex-shrink:0;">${s.icon}</span><span>${message}</span>`;
      c.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; });
      setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(1rem)'; setTimeout(() => el.remove(), 300); }, duration);
    }
  };

  // ── Navigation System ─────────────────────────────────────────────────────
  const nav = {
    init() {
      document.querySelectorAll('[data-nav-section]').forEach(item => {
        item.addEventListener('click', () => nav.setSection(item.dataset.navSection));
      });
      // Activate first section
      const first = document.querySelector('[data-section]');
      if (first) nav.setSection(first.dataset.section);
    },
    setSection(id) {
      document.querySelectorAll('[data-section]').forEach(s => {
        s.style.display = s.dataset.section === id ? '' : 'none';
      });
      document.querySelectorAll('[data-nav-section]').forEach(item => {
        const active = item.dataset.navSection === id;
        if (active) {
          item.classList.add('bg-blue-50', 'text-blue-700', 'border-r-4', 'border-blue-700', 'font-semibold');
          item.classList.remove('text-slate-500', 'hover:bg-slate-100');
        } else {
          item.classList.remove('bg-blue-50', 'text-blue-700', 'border-r-4', 'border-blue-700');
          item.classList.add('text-slate-500', 'hover:bg-slate-100');
        }
      });
    },
    setTopNav(id) {
      nav.setSection(id);
    }
  };

  // ── Notifications Panel ───────────────────────────────────────────────────
  let notifOpen = false;
  const notifications = {
    toggle() {
      let panel = document.getElementById('notif-panel');
      if (panel) { panel.remove(); notifOpen = false; return; }
      notifOpen = true;
      panel = document.createElement('div');
      panel.id = 'notif-panel';
      panel.style.cssText = 'position:fixed;top:4rem;right:1rem;width:360px;background:#fff;border-radius:0.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:8000;border:1px solid #e2e2e5;overflow:hidden;';
      panel.innerHTML = `
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #e2e2e5;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#004f96;">Notificações</span>
          <button onclick="ACELERA_API.markAllNotificationsRead().then(()=>{ACELERA_UI.notifications.toggle();ACELERA_UI.toast.show('Todas marcadas como lidas','success')})" style="font-size:10px;color:#717783;cursor:pointer;background:none;border:none;font-family:Inter,sans-serif;text-decoration:underline;">Marcar todas lidas</button>
        </div>
        <div id="notif-list" style="max-height:400px;overflow-y:auto;"></div>`;
      document.body.appendChild(panel);
      ACELERA_API.getNotifications().then(list => {
        notifications.render(list || []);
      });
      setTimeout(() => { document.addEventListener('click', notifications._outsideClick); }, 50);
    },
    _outsideClick(e) {
      const panel = document.getElementById('notif-panel');
      if (panel && !panel.contains(e.target) && !e.target.closest('[data-notif-bell]')) {
        panel.remove(); notifOpen = false;
        document.removeEventListener('click', notifications._outsideClick);
      }
    },
    render(list) {
      const container = document.getElementById('notif-list');
      if (!container) return;
      if (!list.length) {
        container.innerHTML = `<div style="padding:2rem;text-align:center;color:#717783;font-size:0.8rem;">Nenhuma notificação</div>`;
        return;
      }
      const iconMap = { alerta: '⚠', info: 'ℹ', sucesso: '✓' };
      const colorMap = { alerta: '#ab3600', info: '#004f96', sucesso: '#005b3b' };
      container.innerHTML = list.map(n => `
        <div onclick="ACELERA_UI.notifications.markRead('${n.id}')" style="padding:1rem 1.25rem;border-bottom:1px solid #f3f3f6;cursor:pointer;background:${n.read ? '#fff' : '#eff6ff'};transition:background 0.2s;" onmouseover="this.style.background='#f3f3f6'" onmouseout="this.style.background='${n.read ? '#fff' : '#eff6ff'}'">
          <div style="display:flex;gap:0.75rem;align-items:flex-start;">
            <span style="font-size:1.1rem;color:${colorMap[n.type] || '#004f96'};flex-shrink:0;margin-top:2px;">${iconMap[n.type] || 'ℹ'}</span>
            <div>
              <p style="font-size:0.8rem;font-weight:700;color:#1a1c1e;margin:0 0 0.25rem;">${n.title}</p>
              <p style="font-size:0.75rem;color:#414752;margin:0;">${n.message}</p>
              ${!n.read ? '<span style="display:inline-block;margin-top:0.375rem;width:6px;height:6px;background:#004f96;border-radius:50%;"></span>' : ''}
            </div>
          </div>
        </div>`).join('');
    },
    markRead(id) {
      ACELERA_API.markNotificationRead(id).then(() => {
        const panel = document.getElementById('notif-panel');
        if (panel) {
          ACELERA_API.getNotifications().then(list => notifications.render(list || []));
        }
        ACELERA_UI.toast.show('Notificação marcada como lida', 'success', 2000);
      });
    }
  };

  // ── Specific Modals ───────────────────────────────────────────────────────
  const modals = {
    gerarRelatorio(onGenerate) {
      modal.open({
        title: 'Gerar Relatório',
        content: `
          <div style="space-y:1rem;">
            <div style="margin-bottom:1.25rem;">
              <label style="${labelStyle}">Tipo de Relatório</label>
              <select id="report-type" style="${inputStyle}">
                <option value="executivo">Executivo</option>
                <option value="conformidade">Conformidade</option>
                <option value="engajamento">Engajamento</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <p style="font-size:0.8rem;color:#717783;">O relatório será gerado com dados do período atual e ficará disponível na seção Relatórios.</p>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="(async()=>{const t=document.getElementById('report-type').value;ACELERA_UI.modal.close();ACELERA_UI.toast.show('Gerando relatório...','info',2000);const r=await ACELERA_API.generateReport(t);if(r&&r.id){ACELERA_UI.toast.show('Relatório gerado com sucesso!','success');if(typeof onGenerate==='function')onGenerate(r);}else{ACELERA_UI.toast.show('Erro ao gerar relatório','error');}})()" style="${btnPrimary}">Gerar</button>`
      });
    },

    novaDiretriz() {
      modal.open({
        title: 'Nova Diretriz / Ação',
        content: `
          <div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Título</label><input id="dir-title" style="${inputStyle}" placeholder="Ex: Revisão de protocolo de triagem" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Descrição</label><textarea id="dir-desc" rows="3" style="${inputStyle}resize:vertical;" placeholder="Descreva a ação..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Prioridade</label>
              <select id="dir-priority" style="${inputStyle}">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Diretriz criada com sucesso!','success')" style="${btnPrimary}">Criar Diretriz</button>`
      });
    },

    novoFeedback(users) {
      const usersHtml = Array.isArray(users) ? users.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '';
      modal.open({
        title: 'Novo Feedback',
        content: `
          <div>
            ${usersHtml ? `<div style="margin-bottom:1rem;"><label style="${labelStyle}">Colaborador</label><select id="fb-user" style="${inputStyle}">${usersHtml}</select></div>` : ''}
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Tipo</label>
              <select id="fb-type" style="${inputStyle}">
                <option value="positivo">Positivo</option>
                <option value="construtivo">Construtivo</option>
                <option value="reconhecimento">Reconhecimento</option>
              </select>
            </div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Título</label><input id="fb-title" style="${inputStyle}" placeholder="Título do feedback" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Conteúdo</label><textarea id="fb-content" rows="4" style="${inputStyle}resize:vertical;" placeholder="Descreva o feedback em detalhes..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Tags (separadas por vírgula)</label><input id="fb-tags" style="${inputStyle}" placeholder="QUALIDADE, CELERIDADE" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="(async()=>{const data={userId:document.getElementById('fb-user')?.value||'',type:document.getElementById('fb-type').value,title:document.getElementById('fb-title').value,content:document.getElementById('fb-content').value,tags:document.getElementById('fb-tags').value.split(',').map(t=>t.trim()).filter(Boolean)};if(!data.title||!data.content){ACELERA_UI.toast.show('Preencha todos os campos','warning');return;}ACELERA_UI.modal.close();const r=await ACELERA_API.createFeedback(data);if(r&&r.id)ACELERA_UI.toast.show('Feedback enviado!','success');else ACELERA_UI.toast.show('Erro ao enviar feedback','error');})()" style="${btnPrimary}">Enviar Feedback</button>`
      });
    },

    agendarOneonone(users) {
      const usersHtml = Array.isArray(users) ? users.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '';
      modal.open({
        title: 'Agendar One-on-One',
        content: `
          <div>
            ${usersHtml ? `<div style="margin-bottom:1rem;"><label style="${labelStyle}">Colaborador</label><select id="oo-user" style="${inputStyle}">${usersHtml}</select></div>` : ''}
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Título</label><input id="oo-title" value="One-on-One Mensal" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
              <div><label style="${labelStyle}">Data</label><input id="oo-date" type="date" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Horário</label><input id="oo-time" type="time" value="14:30" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            </div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Pauta / Notas</label><textarea id="oo-notes" rows="3" style="${inputStyle}resize:vertical;" placeholder="Tópicos a discutir..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="(async()=>{const user=ACELERA_API.getUser();const data={supervisorId:user?.id||'',analistaId:document.getElementById('oo-user')?.value||'',title:document.getElementById('oo-title').value,date:document.getElementById('oo-date').value,time:document.getElementById('oo-time').value,notes:document.getElementById('oo-notes').value};if(!data.date){ACELERA_UI.toast.show('Selecione uma data','warning');return;}ACELERA_UI.modal.close();const r=await ACELERA_API.createOneonone(data);if(r&&r.id)ACELERA_UI.toast.show('One-on-One agendado!','success');else ACELERA_UI.toast.show('Erro ao agendar','error');})()" style="${btnPrimary}">Agendar</button>`
      });
    },

    hotspotDetail(hotspot) {
      if (!hotspot || typeof hotspot !== 'object') {
        ACELERA_API.getHotspot(hotspot).then(h => {
          if (h) ACELERA_UI.modals.hotspotDetail(h);
        });
        return;
      }
      const statusColor = { critico: '#ba1a1a', alerta: '#ab3600', mitigacao: '#005b3b' }[hotspot.status] || '#717783';
      const statusLabel = { critico: 'CRÍTICO', alerta: 'ALERTA', mitigacao: 'EM MITIGAÇÃO' }[hotspot.status] || hotspot.status?.toUpperCase();
      const actions = (hotspot.actions || []).map(a => `<li style="font-size:0.8rem;color:#414752;padding:0.375rem 0;border-bottom:1px solid #f3f3f6;">• ${a}</li>`).join('');
      modal.open({
        title: `Hotspot #${hotspot.rank} — Detalhes`,
        size: 'lg',
        content: `
          <div>
            <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;">
              <span style="background:${statusColor}20;color:${statusColor};padding:0.25rem 0.75rem;border-radius:9999px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;">${statusLabel}</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#717783;">${hotspot.occurrences} ocorrências · ${hotspot.period}</span>
            </div>
            <h4 style="font-size:1rem;font-weight:700;color:#1a1c1e;margin:0 0 0.5rem;">${hotspot.unit}</h4>
            <p style="font-size:0.8rem;color:#717783;margin:0 0 1rem;font-family:'JetBrains Mono',monospace;">${hotspot.process}</p>
            <p style="font-size:0.875rem;color:#414752;line-height:1.6;margin-bottom:1.25rem;">${hotspot.description}</p>
            <div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#717783;margin-bottom:0.5rem;">Ações Recomendadas</p>
              <ul style="list-style:none;padding:0;margin:0;">${actions}</ul>
            </div>
            ${hotspot.agents?.length ? `<div style="margin-top:1.25rem;"><p style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#717783;margin-bottom:0.5rem;">Agentes Envolvidos</p><div style="display:flex;gap:0.5rem;">${hotspot.agents.map(a => `<span style="width:32px;height:32px;border-radius:50%;background:#e8e8ea;display:inline-flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#004f96;">${a}</span>`).join('')}</div></div>` : ''}
          </div>`,
        footer: `<button onclick="ACELERA_UI.modal.close()" style="${btnPrimary}">Fechar</button>`
      });
    },

    suporte() {
      modal.open({
        title: 'Central de Suporte',
        content: `
          <div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
              <div style="padding:1.25rem;background:#f3f3f6;border-radius:0.5rem;text-align:center;">
                <div style="font-size:1.5rem;margin-bottom:0.5rem;">📧</div>
                <p style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#717783;margin:0 0 0.25rem;">E-mail</p>
                <p style="font-size:0.8rem;font-weight:600;color:#004f96;">suporte@quintoandar.com</p>
              </div>
              <div style="padding:1.25rem;background:#f3f3f6;border-radius:0.5rem;text-align:center;">
                <div style="font-size:1.5rem;margin-bottom:0.5rem;">📞</div>
                <p style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#717783;margin:0 0 0.25rem;">Telefone</p>
                <p style="font-size:0.8rem;font-weight:600;color:#004f96;">0800 123 4567</p>
              </div>
            </div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Assunto</label><input id="sup-subject" style="${inputStyle}" placeholder="Descreva brevemente o problema" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            <div><label style="${labelStyle}">Mensagem</label><textarea id="sup-msg" rows="4" style="${inputStyle}resize:vertical;" placeholder="Descreva em detalhes..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Mensagem enviada! Responderemos em até 24h','success')" style="${btnPrimary}">Enviar</button>`
      });
    },

    configuracoes(user) {
      user = user || ACELERA_API.getUser() || {};
      modal.open({
        title: 'Configurações de Perfil',
        size: 'lg',
        content: `
          <div>
            <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding:1.25rem;background:#f3f3f6;border-radius:0.5rem;">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#004f96,#0067c0);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;flex-shrink:0;">${user.avatar || 'U'}</div>
              <div>
                <p style="font-weight:700;font-size:1rem;color:#1a1c1e;margin:0 0 0.25rem;">${user.name || 'Usuário'}</p>
                <p style="font-size:0.8rem;color:#717783;margin:0;">${user.email || ''}</p>
                <p style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#004f96;margin:0.25rem 0 0;">${user.role || ''}</p>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div><label style="${labelStyle}">Nome Completo</label><input id="cfg-name" value="${user.name || ''}" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">E-mail</label><input id="cfg-email" value="${user.email || ''}" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Nova Senha</label><input id="cfg-pass" type="password" placeholder="Deixe em branco para manter" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Equipe / Setor</label><input id="cfg-team" value="${user.team || ''}" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            </div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="(async()=>{const updates={name:document.getElementById('cfg-name').value,email:document.getElementById('cfg-email').value,team:document.getElementById('cfg-team').value};const u=ACELERA_API.getUser();if(u){const r=await ACELERA_API.request('/users/'+u.id,{method:'PUT',body:updates});if(r&&r.id){ACELERA_API.setUser({...u,...updates});ACELERA_UI.modal.close();ACELERA_UI.toast.show('Perfil atualizado!','success');}else ACELERA_UI.toast.show('Erro ao salvar','error');}})()" style="${btnPrimary}">Salvar</button>`
      });
    },

    novoFuncionario() {
      modal.open({
        title: 'Inclusão de Novo Colaborador',
        size: 'lg',
        content: `
          <div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div style="grid-column:span 2;"><label style="${labelStyle}">Nome Completo</label><input id="nh-name" style="${inputStyle}" placeholder="Nome Completo" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">E-mail Corporativo</label><input id="nh-email" type="email" style="${inputStyle}" placeholder="usuario@quintoandar.com" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Perfil de Acesso</label>
                <select id="nh-role" style="${inputStyle}">
                  <option value="analista">Analista</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              <div><label style="${labelStyle}">Data de Início</label><input id="nh-start" type="date" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Equipe</label><input id="nh-team" style="${inputStyle}" placeholder="Ex: Equipe Alpha" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            </div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="(async()=>{const data={name:document.getElementById('nh-name').value,email:document.getElementById('nh-email').value,role:document.getElementById('nh-role').value,team:document.getElementById('nh-team').value,createdAt:document.getElementById('nh-start').value,avatar:document.getElementById('nh-name').value.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()};if(!data.name||!data.email){ACELERA_UI.toast.show('Preencha nome e e-mail','warning');return;}ACELERA_UI.modal.close();const r=await ACELERA_API.request('/users',{method:'POST',body:data});if(r&&r.id)ACELERA_UI.toast.show('Colaborador incluído com sucesso!','success');else ACELERA_UI.toast.show('Erro ao incluir colaborador','error');})()" style="${btnPrimary}">Incluir Colaborador</button>`
      });
    },

    agendarFerias(users) {
      const usersHtml = Array.isArray(users) && users.length ? users.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '<option value="">Carregando...</option>';
      modal.open({
        title: 'Agendar Férias',
        content: `
          <div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Colaborador</label><select id="feria-user" style="${inputStyle}">${usersHtml}</select></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
              <div><label style="${labelStyle}">Data de Início</label><input id="feria-start" type="date" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Data de Retorno</label><input id="feria-end" type="date" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
            </div>
            <div><label style="${labelStyle}">Observações</label><textarea id="feria-obs" rows="2" style="${inputStyle}resize:vertical;" placeholder="Informações adicionais..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Férias agendadas com sucesso!','success')" style="${btnPrimary}">Agendar</button>`
      });
    },

    registrarFalta(users) {
      const usersHtml = Array.isArray(users) && users.length ? users.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '<option value="">Carregando...</option>';
      modal.open({
        title: 'Registrar Falta',
        content: `
          <div>
            <div style="margin-bottom:1rem;"><label style="${labelStyle}">Colaborador</label><select id="falta-user" style="${inputStyle}">${usersHtml}</select></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
              <div><label style="${labelStyle}">Data</label><input id="falta-date" type="date" style="${inputStyle}" onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"/></div>
              <div><label style="${labelStyle}">Tipo</label>
                <select id="falta-tipo" style="${inputStyle}">
                  <option value="injustificada">Injustificada</option>
                  <option value="justificada">Justificada</option>
                  <option value="atestado">Atestado Médico</option>
                </select>
              </div>
            </div>
            <div><label style="${labelStyle}">Observações</label><textarea id="falta-obs" rows="2" style="${inputStyle}resize:vertical;" placeholder="Motivo ou detalhes..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Falta registrada com sucesso!','success')" style="${btnPrimary}${';background:#ba1a1a;'}">Registrar Falta</button>`
      });
    },

    pdiDetail(pdi) {
      pdi = pdi || { title: 'Especialização em Inteligência Preditiva', progress: 68, deadline: 'Julho 2024' };
      modal.open({
        title: 'Plano de Desenvolvimento Individual',
        size: 'lg',
        content: `
          <div>
            <h4 style="font-size:1.1rem;font-weight:700;color:#1a1c1e;margin:0 0 0.5rem;">${pdi.title}</h4>
            <p style="font-size:0.8rem;color:#717783;font-family:'JetBrains Mono',monospace;margin:0 0 1.5rem;">Conclusão estimada: ${pdi.deadline}</p>
            <div style="margin-bottom:1.5rem;">
              <div style="display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:11px;color:#717783;margin-bottom:0.5rem;"><span>PROGRESSO</span><span>${pdi.progress}%</span></div>
              <div style="background:#f3f3f6;border-radius:9999px;height:8px;overflow:hidden;"><div style="background:linear-gradient(135deg,#004f96,#0067c0);height:100%;width:${pdi.progress}%;border-radius:9999px;transition:width 0.5s;"></div></div>
            </div>
            <div style="display:grid;gap:1rem;">
              ${[
                { label: 'Módulo 1: Fundamentos de IA Comportamental', done: true },
                { label: 'Módulo 2: Análise Preditiva de Dados', done: true },
                { label: 'Módulo 3: Ferramentas ACELERA Avançado', done: false },
                { label: 'Módulo 4: Projeto Final de Certificação', done: false },
              ].map(m => `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:${m.done ? '#f0fdf4' : '#f3f3f6'};border-radius:0.375rem;"><span style="color:${m.done ? '#16a34a' : '#c1c6d4'};font-size:1.1rem;">${m.done ? '✓' : '○'}</span><span style="font-size:0.85rem;font-weight:${m.done ? '600' : '400'};color:${m.done ? '#15803d' : '#717783'};">${m.label}</span></div>`).join('')}
            </div>
          </div>`,
        footer: `<button onclick="ACELERA_UI.modal.close()" style="${btnPrimary}">Fechar</button>`
      });
    },

    slaDetail(sla) {
      sla = sla || { id: '#44921', title: 'Análise de Risco Pendente', status: 'expirado', time: '02:14h' };
      const isExpired = (sla.status || '').toLowerCase() === 'expirado' || (sla.time || '').includes('EXPIR');
      modal.open({
        title: `SLA ${sla.id || ''} — Detalhes`,
        content: `
          <div>
            <div style="padding:1rem;background:${isExpired ? '#fef2f2' : '#fffbeb'};border-radius:0.5rem;border-left:4px solid ${isExpired ? '#ba1a1a' : '#d97706'};margin-bottom:1.25rem;">
              <p style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:${isExpired ? '#ba1a1a' : '#92400e'};margin:0 0 0.25rem;">${isExpired ? '⚠ EXPIRADO' : '⏳ PRÓXIMO DO VENCIMENTO'}</p>
              <p style="font-size:0.875rem;font-weight:700;color:#1a1c1e;margin:0;">${sla.title || 'SLA'}</p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
              <div style="padding:0.75rem;background:#f3f3f6;border-radius:0.375rem;"><p style="${labelStyle}margin-bottom:0.25rem;">Status</p><p style="font-weight:700;font-size:0.875rem;color:${isExpired ? '#ba1a1a' : '#d97706'};">${isExpired ? 'Expirado' : 'Próximo Venc.'}</p></div>
              <div style="padding:0.75rem;background:#f3f3f6;border-radius:0.375rem;"><p style="${labelStyle}margin-bottom:0.25rem;">Tempo</p><p style="font-weight:700;font-size:0.875rem;color:#1a1c1e;">${sla.time || '—'}</p></div>
            </div>
            <div><label style="${labelStyle}">Ação de Resolução</label><textarea rows="3" style="${inputStyle}resize:vertical;" placeholder="Descreva a ação tomada para resolver..." onfocus="this.style.borderBottomColor='#004f96'" onblur="this.style.borderBottomColor='transparent'"></textarea></div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Fechar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Ação de SLA registrada!','success')" style="${btnPrimary}">Registrar Ação</button>`
      });
    },

    periodoFiltro() {
      modal.open({
        title: 'Filtrar Período',
        content: `
          <div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div><label style="${labelStyle}">Mês</label>
                <select id="pf-month" style="${inputStyle}">
                  ${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}
                </select>
              </div>
              <div><label style="${labelStyle}">Ano</label>
                <select id="pf-year" style="${inputStyle}">
                  <option value="2023">2023</option>
                  <option value="2024" selected>2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>`,
        footer: `
          <button onclick="ACELERA_UI.modal.close()" style="${btnSecondary}">Cancelar</button>
          <button onclick="ACELERA_UI.modal.close();ACELERA_UI.toast.show('Período atualizado!','success')" style="${btnPrimary}">Aplicar Filtro</button>`
      });
    },

    mapCompleto() {
      modal.open({
        title: 'Mapa Completo de Hotspots',
        size: 'xl',
        content: `
          <div style="text-align:center;padding:3rem 1rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🗺️</div>
            <p style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#717783;margin-bottom:0.5rem;">Mapa Geográfico de Operações</p>
            <p style="font-size:0.875rem;color:#414752;">Visualização cartográfica integrada em desenvolvimento.</p>
            <p style="font-size:0.8rem;color:#717783;margin-top:0.5rem;">Versão completa disponível no próximo release.</p>
          </div>`,
        footer: `<button onclick="ACELERA_UI.modal.close()" style="${btnPrimary}">Fechar</button>`
      });
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await ACELERA_API.logout().catch(() => {});
    ACELERA_API.clearToken();
    window.location.href = '/login.html';
  }

  return { modal, toast, nav, notifications, modals, logout };
})();
