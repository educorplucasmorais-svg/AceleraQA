# 🚀 Como fazer o Push para o GitHub e Deploy no Vercel

## ⚠️ Problema identificado
A conta Windows autenticada (`educorplucasmorais-svg`) não tem permissão de escrita em `lucasQA-treinamento/Acelera`.

---

## PASSO 1 — Gerar Personal Access Token (PAT) do GitHub

1. Acesse: https://github.com/settings/tokens/new
2. **Note**: "Acelera Deploy"
3. **Expiration**: 90 days
4. **Scopes**: marcar `repo` (checkbox completo)
5. Clique **Generate token**
6. **COPIE o token** (começa com `ghp_...`) — você só vê uma vez!

---

## PASSO 2 — Push para o GitHub

Abra o PowerShell na pasta do projeto e execute:

```powershell
cd "c:\Users\Pichau\Desktop\Acelera"

# Substitua SEU_TOKEN pelo token gerado acima
git remote set-url origin https://lucasQA-treinamento:SEU_TOKEN@github.com/lucasQA-treinamento/Acelera.git
git push -u origin main
```

✅ Após o push, o repositório estará em:
https://github.com/lucasQA-treinamento/Acelera

---

## PASSO 3 — Configurar Variável de Ambiente no Vercel

Como o Vercel usa `@jwt_secret` no vercel.json, você precisa:

1. Acesse: https://vercel.com/lucassmorais-8361s-projects/acelera/settings/environment-variables
2. Adicionar:
   - **Key**: `JWT_SECRET`
   - **Value**: `acelera_secret_jwt_2025`
   - **Environment**: Production + Preview + Development
3. Clique **Save**

---

## PASSO 4 — Deploy no Vercel (automático após o push)

O projeto "acelera" no Vercel já está conectado ao repositório GitHub (visto no screenshot).

Assim que o `git push` for executado no Passo 2:
- Vercel detecta o push automaticamente
- Inicia o build usando `server/index.js` como entry point
- Deploy em ~1-2 minutos

Verifique em: https://vercel.com/lucassmorais-8361s-projects/acelera/deployments

---

## ⚠️ Limitação importante no Vercel

O Vercel é **serverless** — escritas no arquivo `server/data/db.json` **não persistem** entre requests.

Isso significa:
- ✅ **Login, leitura de dados** funcionam normalmente
- ⚠️ **Criar feedback, agendar 1:1** — funcionam na requisição mas resetam ao reiniciar
- Para persistência real → migrar para PostgreSQL/Supabase (V2)

**Para demo/POC** isso é aceitável — os dados seed do db.json sempre aparecerão.

---

## Tudo já commitado localmente ✅

```
git log --oneline
d848558 feat: ACELERA Platform V1 — MVP Funcional (27 arquivos)
```

Só falta o push!
