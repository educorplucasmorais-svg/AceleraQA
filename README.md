# 🚀 Plataforma ACELERA — Intelligence Suite

> **Sistema de Inteligência Comportamental e Gestão de Performance**  
> Multi-perfil · JWT Auth · Backend Express · Deploy Vercel

---

## 📋 Visão Geral

A **Plataforma ACELERA** é um dashboard corporativo de inteligência comportamental que centraliza KPIs operacionais, feedbacks, 1:1s e conformidade em uma única interface — com visões diferenciadas por nível de senioridade.

| Perfil | Acesso | Seções |
|--------|--------|--------|
| **Coordenador** | Estratégico / Executivo | 7 seções (Admin, Hotspots, Relatórios...) |
| **Supervisor** | Gestão de Equipe | 6 seções (Equipe, RVV, 1:1s, Feedbacks...) |
| **Analista** | Performance Individual | 5 seções (Score, PDI, Feedbacks, Docs...) |

---

## 🧱 Arquitetura

```
Acelera/
├── server/
│   ├── index.js              # Express app — porta 3000
│   ├── middleware/auth.js    # JWT middleware
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login|logout
│   │   ├── feedbacks.js      # CRUD /api/feedbacks
│   │   ├── oneonones.js      # CRUD /api/oneonones
│   │   ├── dashboard.js      # GET /api/dashboard (role-aware)
│   │   ├── notifications.js  # GET/PUT /api/notifications
│   │   ├── users.js          # GET /api/users
│   │   ├── reports.js        # GET/POST /api/reports
│   │   └── hotspots.js       # GET /api/hotspots
│   └── data/db.json          # JSON Database (local dev)
├── assets/
│   └── js/
│       ├── api.js            # ACELERA_API — fetch wrapper + JWT
│       └── ui.js             # UI system (modals, toasts, nav)
├── dashboard-coordenador.html
├── dashboard-supervisor.html
├── dashboard-analista.html
├── login.html
├── index.html
├── vercel.json               # Vercel deploy config
└── package.json
```

---

## ⚡ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + TailwindCSS (CDN) + Vanilla JS |
| Ícones | Material Symbols Outlined (Google Fonts) |
| Tipografia | Inter + JetBrains Mono |
| Backend | Node.js 18 + Express 4 |
| Auth | JWT (`jsonwebtoken`) — 8h expiry |
| DB (dev) | JSON File (`server/data/db.json`) |
| Deploy | Vercel (static + serverless) |

---

## 🚀 Rodando Localmente

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação

```bash
git clone https://github.com/lucasQA-treinamento/Acelera.git
cd Acelera
npm install
```

### Configuração

Crie o arquivo `.env` na raiz:

```env
JWT_SECRET=acelera_secret_jwt_2025
PORT=3000
```

### Iniciar servidor

```bash
npm start
# ou em modo watch:
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔑 Credenciais Demo

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `eduardo@acelera.gov.br` | `demo123` | Coordenador |
| `carlos@acelera.gov.br` | `demo123` | Supervisor |
| `ana@acelera.gov.br` | `demo123` | Analista |
| `renata@acelera.gov.br` | `demo123` | Supervisor |

---

## 🔌 API Reference

### Autenticação

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "carlos@acelera.gov.br", "password": "demo123" }
```

Retorna: `{ token: "...", user: { id, name, email, role, avatar, team } }`

> Todas as rotas protegidas requerem: `Authorization: Bearer <token>`

### Feedbacks

```http
GET    /api/feedbacks           # Lista (filtrado por role)
POST   /api/feedbacks           # Criar { userId, type, title, content, tags[] }
GET    /api/feedbacks/:id       # Detalhes
PUT    /api/feedbacks/:id       # Atualizar
DELETE /api/feedbacks/:id       # Excluir
```

### One-on-Ones

```http
GET    /api/oneonones           # Lista (filtrado por role)
POST   /api/oneonones           # Agendar { supervisorId, analistaId, title, date, time, notes }
PUT    /api/oneonones/:id       # Atualizar status (agendado → concluido/cancelado)
DELETE /api/oneonones/:id       # Excluir
```

### Outros endpoints

```http
GET /api/dashboard              # KPIs e dados por role
GET /api/users                  # Lista de usuários
GET /api/notifications          # Notificações do usuário
GET /api/hotspots               # Hotspots críticos
GET /api/reports                # Relatórios gerados
POST /api/reports               # Gerar relatório
```

---

## 🏗️ Fluxo de Autenticação

```
Login Form → POST /api/auth/login
          → JWT (8h) salvo em localStorage
          → Redireciona por role:
              coordenador → dashboard-coordenador.html
              supervisor  → dashboard-supervisor.html
              analista    → dashboard-analista.html

401 em qualquer rota → api.js auto-redireciona para /login.html
```

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| Primary | `#004f96` |
| Primary Container | `#0067c0` |
| Secondary | `#ab3600` |
| Tertiary | `#005b3b` |
| Surface | `#f9f9fc` |
| On Surface | `#1a1c1e` |
| Error | `#ba1a1a` |

---

## 📦 Scripts

```bash
npm start       # Inicia servidor (node server/index.js)
npm run dev     # Watch mode (node --watch server/index.js)
```

---

## 🗺️ Roadmap

### ✅ V1 — MVP Funcional (Concluído)
- [x] Auth JWT real com middleware de proteção
- [x] 3 dashboards diferenciados por role/senioridade
- [x] CRUD Feedbacks com persistência
- [x] CRUD 1:1s com agendamento/conclusão/cancelamento
- [x] Notificações por role
- [x] Geração de relatórios

### 🔄 V2 — Produção (Em Andamento)
- [ ] Deploy Vercel + Base44
- [ ] Migrar db.json → PostgreSQL/AWS RDS
- [ ] Exportação PDF de relatórios
- [ ] Integração Google Calendar

### 🔮 V3 — Escala
- [ ] SSO Corporativo (Google / SAML 2.0)
- [ ] Notificações em tempo real (WebSocket)
- [ ] App mobile (PWA)
- [ ] Integração PIN (férias, faltas, desligamentos)

---

## 📄 Licença

Projeto interno — Incubadora Piratas do Caribe © 2025  
Documentação completa: [POC.md](./POC.md)
