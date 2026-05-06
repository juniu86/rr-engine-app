# RR Engine — Handoff de migração total

**Versão:** v2 — pós-Sprint 4
**Data:** 06 de maio de 2026
**Para:** Reginaldo retomando depois da pausa

Este documento substitui o handoff v1. Tudo que estava marcado como pendente lá foi feito (Sprints 2, 3, 4 e auxiliares). Foco agora: Sprint 5 (Stripe) e Sprint 6 (cutover).

---

## 1. Resumo executivo

A migração total pra fora do Manus está **5 de 6 sprints concluídos**. Pipeline de orçamentação roda end-to-end (memorial → 10 agentes → proposta PDF + memória XLSX + cronograma), com UI completa, downloads e revisões funcionais.

| Sprint | Escopo | Status |
| --- | --- | --- |
| 1 | Infra + Next.js + DNS cutover (`engine.rres.com.br`) | ✅ |
| 2 | Auth Clerk + middleware + Header condicional | ✅ |
| 3 | Backend Express tRPC no Railway + R2 + MySQL + migrations | ✅ |
| 4 | UI completa (Dashboard, NewProject, ProjectDetails, Settings) + pipeline live + downloads + revisões + Auditor + upload PDF | ✅ |
| 5 | Stripe + 3 tiers (P1.7) | ⏳ Próximo — Claude Code |
| 6 | Smoke test + cutover total + desligar Manus | ⏳ |

Status atual da operação: app funcional em `engine.rres.com.br`, backend em `api.rres.com.br`, banco MySQL no Railway, storage no Cloudflare R2, LLM via Anthropic direto com streaming + prompt caching.

---

## 2. O que é o RR Engine

SaaS de orçamentação automatizada de obras civis. Entrada: memorial descritivo. Saída: proposta comercial PDF + memória de cálculo XLSX + cronograma físico. Motor é pipeline sequencial de 10 agentes IA orquestrados via tRPC.

Versão atual: 3.1.0. Antes hospedado em `rrengine.manus.space` (tenant Manus). Agora rodando em infraestrutura própria.

---

## 3. Arquitetura atual

### Frontend — `juniu86/rr-engine-app`

**Stack:** Next.js 16.2.4 + Tailwind 4 + Clerk + shadcn/ui

**Hospedagem:** Vercel (auto-deploy da branch `main`). Domínio `engine.rres.com.br` (CNAME no GoDaddy).

**Páginas:**

- `/` — landing institucional
- `/sign-in`, `/sign-up` — Clerk catch-all
- `/dashboard` — lista de projetos do user
- `/dashboard/new` — criar projeto (form com upload PDF cliente-side via `pdfjs-dist`)
- `/dashboard/[projectId]` — detalhes: pipeline live, AuditorReport, downloads, revisões
- `/dashboard/settings` — config empresa (BDI, regime, alíquotas)

**Componentes-chave** em `components/`:

- `AgentPipelineLive` (Client) — polling 5s pra status dos 10 agentes
- `MissingInfoModal` (Client) — popup quando Engenheiro pede dados extras
- `AuditorReport` (Server) — score, seal, validações
- `ProjectDownloads` (Client) — gerar e baixar PDF/XLSX
- `ProjectRevisions` (Client) — lista revisões + modal pra criar nova
- `MemorialPdfUpload` (Client) — extração cliente-side de PDF (lazy import 3MB)

**Cliente HTTP** em `lib/api.ts` — fetch + Bearer token Clerk, envelope superjson `{json: ...}` no body. Sem dependência de `@trpc/client` por enquanto.

### Backend — `juniu86/rr-engine`

**Stack:** Node 20 + Express 4 + tRPC 11 + Drizzle ORM + MySQL 8 + R2 (S3-compatible)

**Hospedagem:** Railway (projeto `gracious-amazement`, branch `feat/sprint-3-railway-deploy` em auto-deploy). Domínio `api.rres.com.br` (CNAME + TXT verify no GoDaddy).

**Pipeline** em `server/routers.ts` — 10 agentes em sequência fixa, com:

- Reaproveitamento de agentes já completed em retentativas (economia de tokens)
- Invalidação cascata: ao continuar pipeline depois de falha, agentes posteriores ao ponto de falha são resetados
- Chunks paralelos via `Promise.all` no Engenheiro (memorial grande) e Orçamentista (orçamento grande)

**LLM** em `server/_core/llm.ts` — Anthropic direto via streaming SSE com prompt caching ephemeral (5 min TTL). Forge da Manus continua disponível como fallback mas não é usado em produção.

**Auth** em `server/_core/clerk-auth.ts` — `@clerk/backend.verifyToken` + sync automático de user no banco no primeiro acesso.

### Banco — MySQL Railway

`DATABASE_URL` referencia o plugin MySQL do Railway. 16 tabelas (users, projects, agent_executions, budget_items, etc) — schema canônico em `drizzle/schema.ts`.

Migrations rodaram via `pnpm db:push` apontando pra `MYSQL_PUBLIC_URL`. 1 fix manual na 0020 (prefix length em index TEXT). Pra rodar de novo:

```bash
DATABASE_URL='<MYSQL_PUBLIC_URL>' pnpm db:push
```

### Storage — Cloudflare R2

Bucket `rr-engine`. `server/storage.ts` reescrito pra usar `@aws-sdk/client-s3` apontando pro endpoint R2 (`forcePathStyle: true`). Mantém assinatura `storagePut`/`storageGet` — todos callers do código antigo funcionam sem mudança.

### Auth — Clerk

App: `pk_test_dW5jb21tb24tZHVjay0zNC5jbGVyay5hY2NvdW50cy5kZXYk`.

Middleware em `rr-engine-app/middleware.ts` protege `/dashboard/*`, `/projects/*`, `/settings/*`. Login via OAuth Google + senha.

---

## 4. Fixes técnicos importantes

Ordem de aplicação resumida (cada um foi commit separado):

1. `assertApiKey` movido pra dentro do bloco Forge — não exige `BUILT_IN_FORGE_API_KEY` quando vai usar Anthropic direto
2. `tolerantJsonParse` — Claude varia formatos, então sanitizamos progressivamente: code fences markdown, `undefined`/`NaN`, trailing commas
3. Normalização do output do Tributário cobrindo 3 formatos observados (`classifiedItems` declarado, `taxClassification` aninhado, `classification[]` array)
4. Override server-side do Auditor: recalcula `price_consistency`, `gross_margin`, `cash_flow` com tolerância 1% e sobrescreve `passed=true`
5. Chunking do Engenheiro: instruções explícitas pra LLM não pedir as outras partes
6. Streaming SSE + prompt caching ephemeral — elimina headers timeout em outputs longos, reduz custo dos chunks paralelos
7. `nixpacks.toml` força `pnpm install --no-frozen-lockfile`

---

## 5. Bugs conhecidos / monitorar

- **Tributário schema instável**: Claude varia entre runs. Mitigação cobre 3 formatos. Risco: novo formato → `totalTaxes=0`. Logs `[Tributario] Derived totalTaxes: ... (format: F1/F2/F3-...)` ajudam a diagnosticar.
- **Auditor falsos positivos**: Claude marca `passed=false` em validações cuja matemática bate. Override server cobre 3 regras (price_consistency, gross_margin, cash_flow). Outras regras podem aparecer com falso positivo sem override.
- **Engenheiro re-executa todos os chunks** quando user responde missingInfoRequests. Otimização possível: rodar só chunks com pendências.
- **Output do Logística com `totalLogisticsCost=0`** em memoriais simples — pode ser correto, validar caso a caso.
- **DeterministicValidator desabilitado em produção** via env flag. Reativar em produção real depois de calibrar.

---

## 6. Comandos úteis

### Inspecionar projeto no banco

```bash
cd ~/Documents/GitHub/rr-engine
DATABASE_URL='<MYSQL_PUBLIC_URL>' node scripts/debug-project.mjs <projectId>
```

### Listar erros de agentes

```bash
DATABASE_URL='<MYSQL_PUBLIC_URL>' node scripts/check-agent-errors.mjs
```

### Adicionar créditos de teste (dev/staging)

```bash
DATABASE_URL='<MYSQL_PUBLIC_URL>' node scripts/seed-credits.mjs
```

### Logs Railway em tempo real

Railway → projeto `gracious-amazement` → card `rr-engine` → Deployments → deploy ativo → Deploy Logs.

### Acessar console MySQL Railway

Railway → card MySQL → "Data" tab (GUI). Variável `MYSQL_PUBLIC_URL` no card MySQL → Variables.

---

## 7. Variáveis de ambiente em produção

### Railway (`rr-engine`)

| Variável | Origem | Uso |
| --- | --- | --- |
| `NODE_ENV=production` | manual | runtime mode |
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` | banco MySQL Railway |
| `CLERK_SECRET_KEY` | Clerk dashboard | validar JWT |
| `CLERK_PUBLISHABLE_KEY` | Clerk dashboard | meta |
| `ANTHROPIC_API_KEY` | console.anthropic.com | LLM (Claude direto) |
| `LLM_MODEL=claude-sonnet-4-6` | manual | default |
| `LLM_MODEL_CRITICAL=claude-opus-4-6` | manual | Engenheiro, Orçamentista |
| `LLM_MODEL_INTERMEDIATE=claude-sonnet-4-6` | manual | Tributário, Gestão, Auditor, Board, Jurídico |
| `STRIPE_SECRET_KEY` | Stripe dashboard | pagamentos (TESTE) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard | validar webhook (TESTE) |
| `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com` | Cloudflare R2 | storage |
| `AWS_ACCESS_KEY_ID` | Cloudflare R2 token | storage |
| `AWS_SECRET_ACCESS_KEY` | Cloudflare R2 token | storage |
| `AWS_REGION=auto` | manual | R2 ignora região |
| `S3_BUCKET=rr-engine` | manual | bucket name |
| `CORS_ORIGINS=https://engine.rres.com.br` | manual | CORS allow list |
| `PINI_USER`, `PINI_PASS` | manual | scraping PINI |

### Vercel (`rr-engine-app`)

- `NEXT_PUBLIC_GA_ID=G-CJP1H6K66N`
- `NEXT_PUBLIC_API_URL=https://api.rres.com.br`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/`

---

## 8. Próximos passos

### Sprint 5 — Stripe (recomendado: Claude Code via PR)

Spec completa em `rr-engine/implementacao/SPRINT_5_STRIPE.md` (criada nesta sessão, baseada em P1.7).

Branch: `feat/sprint-5-stripe-tiers` a partir de `main` no rr-engine.

Prompt inicial sugerido pro Claude Code:

```
Implementar Sprint 5 — Stripe com 3 tiers do P1.7.

Spec completa em implementacao/SPRINT_5_STRIPE.md.

Backend (rr-engine):
- 3 produtos no Stripe BR (criar via API ou variáveis com price IDs)
- Endpoint tRPC stripe.createCheckout(tier) → retorna sessionId
- Webhook /api/stripe/webhook valida e sincroniza tabela subscriptions
- Gate canCreateBudget já existe, só popular subscriptions corretamente

Frontend (rr-engine-app):
- /planos: 3 cards (Starter / Pro / Business) com preços
- Botão "Assinar" chama stripe.createCheckout, redireciona pro Stripe Checkout
- /dashboard: badge "Plano: Starter" quando logado

Testes: incluir suite de webhook + gate. Manter as 25 suites Vitest verdes.

Quando terminar, abrir PR pra main do rr-engine.
```

### Sprint 6 — Cutover

- Smoke test com obra real cobrindo todas as features (criar projeto, pipeline, revisão, downloads, settings, planos)
- Apontar `rrengine.manus.space` pra `engine.rres.com.br` (302 ou banner deprecation)
- Migrar users existentes do Manus (se houver) — provavelmente zero, pq usuário é beta
- Desligar app no painel Manus
- Arquivar repos antigos do tenant Manus se aplicável

### Pendências secundárias (não bloqueantes)

- [ ] Rotacionar `PINI_PASS` (passou pelo chat) — usuário declinou explicitamente
- [ ] Rotacionar senha MySQL Railway (passou pelo chat) — usuário declinou explicitamente
- [ ] Reativar `DeterministicValidator` em produção (hoje desabilitado via env flag)
- [ ] Estabilizar prompts do Tributário e Auditor com poucos exemplos few-shot (poder ir pro Code junto com Sprint 5)

---

## 9. Histórico desta sessão

44 tasks concluídas em sequência. Highlights:

- **Sprint 2**: Clerk auth (3 fixes de v7 deprecation)
- **Sprint 3**: Railway provisioned, MySQL migrations, R2 storage, domínio custom
- **Sprint 4**: 8 sub-sprints da UI (4.1 a 4.8) + correções (Comercial, Tributário, Auditor)
- **Otimizações**: reaproveitamento, invalidação cascata, paralelismo de chunks
- **LLM**: streaming + prompt caching no Anthropic
- **Polish**: warnings Auditor, upload PDF, revisões, contraste botões

Histórico completo:

```bash
git log feat/sprint-3-railway-deploy --oneline -50  # rr-engine
git log main --oneline -30                          # rr-engine-app
```

---

## 10. Quem assume daqui

- **Sprint 5 (Stripe)** → Claude Code via PR. Trabalho de backend isolado, baixíssimo risco em produção, fluxo de PR já estabelecido.
- **Sprint 6 (Cutover)** → pode ser Cowork (eu) ou Code. Envolve coordenação multi-serviço, testes manuais, ações de DNS.
- **Estabilização de prompts (Tributário / Auditor)** → Claude Code junto com Sprint 5, agrupar como feat/p2-stable-prompts.
