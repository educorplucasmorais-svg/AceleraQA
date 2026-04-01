# 🏴‍☠️ POC.MD — Plataforma ACELERA
## Modelo de Projeto - Incubadora Piratas do Caribe

---

## Informações Gerais do Projeto

| Categoria | Detalhe |
|---|---|
| **Título do Projeto** | Plataforma ACELERA — Intelligence Suite |
| **Sponsor (Patrocinador)** | [A preencher] |
| **Líder do Projeto (PO)** | [A preencher] |
| **Time (Squad)** | [A preencher] |
| **Formato da entrega** | Produto Web (SPA + Backend Express) |
| **Justificativa** | Centralizar gestão de performance, feedbacks, conformidade e 1:1s em uma única plataforma inteligente para equipes operacionais |
| **Ferramentas necessárias** | HTML/CSS/JS (Vanilla), TailwindCSS, Node.js/Express (Backend), JSON File DB, JWT (Auth), **Base44** (Plataforma de Deploy/Hosting) |
| **Data de Início** | [DD/MM/AAAA] |
| **Status Atual** | Fase 2 — MVP Funcional (V1) com backend interno |

---

## [FASE 1: ESCRITA E MAPA MENTAL]

### 1. A "Dor" (Problema/Oportunidade)
Equipes operacionais não possuem visibilidade centralizada de métricas de performance, feedbacks e conformidade. Os dados são fragmentados em planilhas e sistemas isolados, dificultando a tomada de decisão em tempo real por coordenadores, supervisores e analistas.

### 2. Objetivo Estratégico
Criar uma plataforma unificada que consolide KPIs operacionais, feedbacks comportamentais e indicadores de conformidade, permitindo gestão por quartis e identificação proativa de hotspots de reincidência.

### 3. Ideia Inicial do Projeto
Dashboard multi-perfil (Coordenador, Supervisor, Analista) com visões diferenciadas por role, backend interno Node.js/Express, banco de dados JSON local, autenticação JWT e módulos funcionais de Feedbacks, 1:1, Documentos e Relatórios. Para escalar o produto em produção, será utilizada a plataforma **Base44** como ambiente de hosting e deploy.

### 4. Mapa Mental da Solução
[Link para o Mapa Mental — a preencher]

---

## [FASE 2: PROTÓTIPO (MVP/PoC)]

### 5. Hipótese a Validar
A centralização das métricas RVV, score ACELERA e feedbacks em dashboards por perfil de usuário irá reduzir o tempo de análise gerencial e aumentar a velocidade de identificação de colaboradores em zona crítica (Q4).

### 6. Arquitetura da Solução (V1 — MVP Funcional)
- [x] **Frontend Static**: HTML/CSS/JS (TailwindCSS + Material Symbols) servido via Express
- [x] **Auth Real**: JWT assinado pelo backend, verificado por middleware, armazenado em localStorage
- [x] **Backend**: Node.js + Express rodando na porta 3000 (`server/index.js`)
- [x] **DB local**: `server/data/db.json` — arquivo JSON com usuários, feedbacks, 1:1s, notificações, documentos, hotspots, relatórios, equipes
- [x] **Módulo Feedbacks**: CRUD completo (POST/GET/PUT/DELETE `/api/feedbacks`) com persistência real
- [x] **Módulo 1:1**: CRUD completo (POST/GET/PUT/DELETE `/api/oneonones`) com agendamento, conclusão e cancelamento
- [x] **3 Visões diferenciadas**: Coordenador (7 seções), Supervisor (6 seções), Analista (5 seções)
- [ ] **Deploy em produção**: Solicitar acesso à plataforma **Base44** para hosting
- [ ] **Banco de dados AWS/PostgreSQL**: Migrar de db.json para banco relacional
- [ ] **SSO / Google Auth**: Autenticação corporativa
- [ ] **Integração Google Calendar**: Sync de 1:1s

### 7. Stack de Ferramentas

| Ferramenta | Finalidade | Status |
|---|---|---|
| TailwindCSS (CDN) | Estilização UI | ✅ Ativo |
| Material Symbols (Google Fonts) | Ícones | ✅ Ativo |
| Inter + JetBrains Mono | Tipografia | ✅ Ativo |
| Node.js + Express | Backend/API REST | ✅ Ativo |
| JSON File (db.json) | Banco de dados local (dev) | ✅ Ativo |
| jsonwebtoken | Autenticação JWT | ✅ Ativo |
| uuid | IDs únicos para registros | ✅ Ativo |
| **Base44** | **Plataforma de hosting/deploy para produção** | 🔴 **Solicitar acesso** |
| AWS RDS / PostgreSQL | Banco de dados produção | 🔴 Fase futura |
| Google Calendar API | Sync de agendamentos | 🔴 Fase futura |

### 7.1 ⚠️ Solicitação: Acesso à Plataforma Base44

> **Ação necessária:** Para avançar com o deploy do MVP em ambiente de produção acessível pelos usuários finais (coordenadores, supervisores, analistas), o projeto precisa ser hospedado em uma plataforma robusta.
>
> **Base44** é a plataforma indicada para hosting desta aplicação por ser:
> - Compatível com aplicações Node.js/Express
> - Suporte a variáveis de ambiente (JWT_SECRET, DB strings)
> - Deploy contínuo via repositório Git
> - Painel de monitoramento e logs
>
> **Solicitar ao Sponsor/TI:** Provisionar um ambiente na Base44 para o projeto ACELERA com:
> - Runtime: Node.js 18+
> - Porta: 3000
> - Variáveis: `JWT_SECRET`, `PORT`, `DATABASE_URL` (futuro)
> - Domínio sugerido: `acelera.base44.app` ou equivalente corporativo

### 8. Escopo do Protótipo

**CONCLUÍDO (V0 + V1 — MVP Funcional):**
- [x] Página de Login com seleção de perfil e autenticação JWT real
- [x] Dashboard Coordenador (7 seções: KPIs, Intelligence Report, Hotspots, Supervisores, Relatórios, Administração, Configurações)
- [x] Dashboard Supervisor (6 seções: Visão Geral, Minha Equipe, RVV, 1:1s, Feedbacks, Conformidade)
- [x] Dashboard Analista (5 seções: Meu Dashboard, Score, PDI, Feedbacks, Documentos)
- [x] Auth real com JWT + middleware de proteção de rotas
- [x] CRUD completo de Feedbacks com persistência em db.json
- [x] CRUD completo de 1:1s (agendar, concluir, cancelar, excluir) com persistência
- [x] Sistema de notificações por role
- [x] Geração de relatórios com registro no banco
- [x] Backend interno Node.js/Express (sem dependência de Google Apps Script)

**PRÓXIMAS FASES:**
- [ ] Deploy em Base44 (produção)
- [ ] Migração de db.json para PostgreSQL/AWS
- [ ] CRUD de usuários completo (criar, editar, desativar)
- [ ] Exportação de relatórios em PDF
- [ ] Integração Google Calendar para 1:1s
- [ ] SSO corporativo (Google / SAML)
- [ ] Integração PIN (férias, faltas, desligamentos)
- [ ] Notificações em tempo real (WebSocket)

---

## [FASE 3: TESTE GRUPO CONTROLE]

### 9. Métricas de Sucesso (KPIs do Teste)

| Métrica | Baseline | Meta |
|---|---|---|
| Tempo de análise de performance por gestor | [A medir] | Redução de 30% |
| Identificação de colaboradores Q4 | [A medir] | < 5 minutos |
| Satisfação do usuário com a interface | N/A | > 4.0/5 |

### 10. Grupo de Controle
[A preencher — Ex: "5 coordenadores regionais + 10 supervisores"]

### 11. Duração do Teste
- Início: [DD/MM/AAAA]
- Fim: [DD/MM/AAAA]

---

## [FASE 4: RESULTADOS + REAJUSTES]
*(A preencher após testes)*

### 12. Análise dos Resultados
[A preencher]

### 13. Riscos Identificados e Plano de Mitigação

| Risco | Plano de Mitigação |
|---|---|
| Google Sheets com alto volume de dados (>10k linhas) | Implementar paginação e cache no Apps Script |
| Latência da API do Google | Otimizar queries, usar batch requests |
| Baixa adoção por falta de treinamento | Criar onboarding in-app + vídeo tutorial |

### 14. Reajustes Propostos
[A preencher após testes]

---

## [FASE 5: VERSÃO FINAL + ROADMAP]

### 15. Pitch de Valor
*A preencher após validação do grupo controle.*

### 16. Roadmap Pós-Incubadora

**V1 — MVP Funcional (CONCLUÍDO — localhost):**
- [x] Backend interno Node.js/Express com rotas REST
- [x] Módulos de Feedbacks e 1:1 com CRUD real
- [x] 3 visões diferenciadas por seniority (Coordenador, Supervisor, Analista)
- [x] Auth JWT real com middleware de proteção

**V2 — Produção (próxima fase):**
1. **Deploy na plataforma Base44** — solicitar acesso ao ambiente corporativo
2. Migrar banco de db.json para PostgreSQL/AWS RDS
3. Implementar CRUD de usuários (convite por e-mail)
4. Exportação de relatórios em PDF
5. Integrar Google Calendar para agendamento de 1:1s

**V3 — Escala:**
6. SSO corporativo (Google Workspace / SAML 2.0)
7. Notificações em tempo real (WebSocket / Socket.io)
8. Integração com sistemas PIN (férias, faltas, desligamentos)
9. Dashboard de BI com gráficos históricos reais
10. App mobile (PWA)

---

## GOVERNANÇA E DADOS (AI & LGPD)

### 17. Governança de Dados
- [x] Dados Pessoais: Nome, e-mail, cargo
- [x] Informação Corporativa Estratégica: Métricas de performance, scores, feedbacks

**Fonte dos Dados:** Google Sheets (controlado pela empresa)

### 18. Supervisão Humana
- [x] **Human-in-the-loop (HITL)**: Feedbacks e avaliações requerem aprovação de supervisor antes de publicação

**Justificativa:** Métricas de performance impactam carreira dos colaboradores; toda avaliação deve ter revisão humana.

### 19. Integrações Planejadas
- **Base44** — Plataforma de hosting/deploy para produção *(solicitar acesso)*
- AWS RDS / PostgreSQL — Banco de dados produção
- Google Calendar (1:1 scheduling — V2)
- Slack / Teams (notificações — V2)
- SSO Corporativo / SAML 2.0 (V3)

---

*Documento atualizado em: 2025 | Status: FASE 2 — V1 MVP Funcional com backend interno concluído*
