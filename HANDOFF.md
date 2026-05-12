# RR Engine — Handoff de migração total

**Versão:** v3.1 — BDI "tudo por dentro" (substituiu NBR 12721 em 12/05)
**Data:** 12 de maio de 2026
**Para:** Reginaldo retomando depois da pausa

Este documento substitui o handoff v2. Sprints 5 (Stripe Live) e 6 (cutover) concluídos. Setembro de PRs P0 fechou 5 bugs de qualidade do output, BDI passou primeiro por NBR 12721 cascata (08/05) e depois pela fórmula "tudo por dentro" (12/05) após fechar com a visão de board, e foi adicionada feature de cancelar execução. Foco agora: smoke test pós-correções + checklist Live (FAQ, termos, pricing 50% margem).

> **Mudança 12/05/2026:** BDI deixou de usar a fórmula NBR 12721 (cascata: AC/S/R/G como % do custo, L sobre o custo carregado) e passou a usar "tudo por dentro" — todos os componentes (L, AC, DF, R, S, G, I) são % do preço de venda. Motivo: a decomposição P&L do board não fechava na cascata (no caso Maricá, diferença de −R$ 353,7k = −13% do markup). Nova fórmula: `PV = Custo / (1 − soma_componentes)`, `BDI = totalRate / (1 − totalRate)`. Gate: soma ≥ 95% lança erro. Reflete em `comercialCalculator.ts`, aba "BDI e Markup" do XLSX, `BdiSettingsForm.tsx`.

---

## 1. Resumo executivo

Migração total pra fora do Manus **completa**. Pipeline de 10 agentes roda end-to-end (memorial → proposta PDF + memória XLSX + cronograma), com UI completa, downloads, revisões, Stripe Live ativo e cap de quota por plano funcionando. Bugs P0 de qualidade do output corrigidos via fórmula NBR 12721 (BDI com tributos por dentro). Feature de cancelar execução durante o pipeline implementada (anti-abuso de quota).

| Sprint | Escopo | Status |
| --- | --- | --- |
| 1 | Infra + Next.js + DNS cutover (`engine.rres.com.br`) | ✅ |
| 2 | Auth Clerk + middleware + Header condicional | ✅ |
| 3 | Backend Express tRPC no Railway + R2 + MySQL + migrations | ✅ |
| 4 | UI completa (Dashboard, NewProject, ProjectDetails, Settings) + pipeline live + downloads + revisões + Auditor + upload PDF | ✅ |
| 5 | Stripe + 3 tiers (P1.7) | ✅ Mergeado, Stripe Live ativo |
| 6 | Smoke test + cutover total + desligar Manus | ✅ Engine fora do Manus |
| P0 quota cap | Cap mensal Starter=2 / Pro=7 / Business=20 (cobre custo R$ 70/orç.) | ✅ Mergeado, validado em produção |
| P0 BDI NBR + cronograma + cancel | Fórmula NBR 12721, totais lidos dos agentes, scheduleItems derivado, botão Interromper | ✅ Mergeados 08/05 |
| Sentry | Captura de erros backend + frontend via tunnel `/monitoring` | ✅ Validado |

Status operacional: app em `engine.rres.com.br`, API em `api.rres.com.br`, MySQL Railway, R2 storage, LLM Anthropic direto (streaming + prompt caching ephemeral), Stripe Live com webhook ativo, Sentry alertando produção.

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

Ordem cronológica (cada item foi commit/PR separado):

**Sprints 2-4 (até 06/05/2026):**

1. `assertApiKey` movido pra dentro do bloco Forge — não exige `BUILT_IN_FORGE_API_KEY` quando vai usar Anthropic direto
2. `tolerantJsonParse` — Claude varia formatos, então sanitizamos progressivamente: code fences markdown, `undefined`/`NaN`, trailing commas
3. Normalização do output do Tributário cobrindo 3 formatos observados (`classifiedItems` declarado, `taxClassification` aninhado, `classification[]` array)
4. Override server-side do Auditor: recalcula `price_consistency`, `gross_margin`, `cash_flow` com tolerância 1% e sobrescreve `passed=true`
5. Chunking do Engenheiro: instruções explícitas pra LLM não pedir as outras partes
6. Streaming SSE + prompt caching ephemeral — elimina headers timeout em outputs longos, reduz custo dos chunks paralelos
7. `nixpacks.toml` força `pnpm install --no-frozen-lockfile`

**Sprint 5 (07/05):**

8. Stripe Live: 3 produtos (Starter / Pro / Business), webhook configurado, key rotacionada após exposição em chat
9. P3 type-safety: `@juniu86/rr-engine-api-types` publicado em GitHub Packages, 24 chamadas tRPC migradas pra cliente tipado via `inferRouterOutputs`
10. Cap mensal Starter=2 / Pro=7 / Business=20 — protege contra cliente Business "estourar" 100 orçamentos no mês

**P0 qualidade output (08/05) — 4 PRs do Code:**

11. **Tributos R$ 0,00**: agente Tributário tinha schema com 3 formatos. Resolvido em PR #32 (Code).
12. **Total dashboard ≠ planilha**: agente Comercial resolvia BDI antes do projeto persistir. Fix gravando totalPrice em `confirmProposal`.
13. **Custo direto inflado** (incluía logística somada): `confirmProposal` somava `budget_items` direto da DB, mas o LLM enfia logística junto. Resolvido em `feat/p0-bdi-cronograma` lendo de `extractFinalTotalsFromExecutions` (output dos agentes Orçamentista + Logística separadamente).
14. **Coluna logística R$ 0**: mesmo bug do #13. Resolvido junto.
15. **Fluxo de caixa fixo 4 semanas**: deterministicCashFlow agora usa `totalDuration` real do agente Gestão.

**P0 BDI NBR 12721 + cancel + cronograma (08/05) — 3 PRs hoje:**

16. **`feat/cancel-execution`**: mutation `agent.cancelExecution`, guard no loop `executeRemainingAgents`, status `cancelled` em projects + agent_executions (migration 0022). Botão "Interromper" no `AgentPipelineLive`. Quota NÃO devolvida (anti-abuso).

17. **`feat/p0-bdi-cronograma`**: substitui `× 1,25` flat por fórmula NBR 12721:

    ```
    BDI = ((1 + AC + S + R + G) × (1 + DF) × (1 + L)) / (1 − I) − 1
    ```

    Tributos por dentro (denominador `1 − I`). Resolução de I: `taxRateResolver.ts` — override > tabela Simples Anexo IV > soma de ISS+PIS+COFINS+IRPJ+CSLL > fallback 8%. Migration 0023 adiciona `seguroPercentual`, `garantiaPercentual`, `aliquotaTributosOverride` em `company_settings`.

    `confirmProposal` (e gêmeos no auto-approve e applyAuditCorrections) agora lê de `extractFinalTotalsFromExecutions(executions)` em `services/projectTotals.ts` — fonte canônica são os outputs dos agentes (`orcOutput.totalDirectCost`, `logOutput.totalLogisticsCost`, `tribOutput.totalTaxes`, `comercialOutput.{finalPrice, totalBdiAmount}`), não soma de `budget_items` direto.

    Cronograma: `agentPersistence.ts` lia `output.schedule` (campo errado) — agora lê `output.scheduleItems` com fallback pra `deriveScheduleFromDaily(dailySchedule)` que agrupa fases. Mesmo fallback no gerador de PDF (`generateSchedulePDF` em `routers.ts`). Prompt do agente Gestão (`agents/index.ts`) reforçado com lista explícita de campos obrigatórios da saída.

18. **`feat/p0-settings-bdi-readonly`** (frontend, pushed aguarda merge): `BdiSettingsForm.tsx` (Client Component) renderiza Settings com BDI total **readonly**, calculado em tempo real pelos componentes. Campos novos: Seguros (S), Garantias (G), override de I. Tabela Simples Nacional Anexo IV pré-preenche I por faixa. No mesmo PR vai cancelExecution no `lib/api.ts` e botão Interromper no `AgentPipelineLive.tsx`.

---

## 5. Bugs conhecidos / monitorar

- **Tributário schema instável**: Claude varia entre runs. Mitigação cobre 3 formatos. Risco: novo formato → `totalTaxes=0`. Logs `[Tributario] Derived totalTaxes: ... (format: F1/F2/F3-...)` ajudam a diagnosticar.
- **Auditor falsos positivos**: Claude marca `passed=false` em validações cuja matemática bate. Override server cobre 3 regras (price_consistency, gross_margin, cash_flow). Outras regras podem aparecer com falso positivo sem override.
- **Bug #82**: status `approved` com `auditSeal: rejected` (caso PAA DGOA). Decisão de produto: "allow + log warning". Implementado em `warnIfAuditorRejected`. Ainda pendente: investigar caso específico se reproduzir.
- **Bug #76**: handler `customer.subscription.updated` grava campos de período como epoch 0. Pendente fix.
- **Engenheiro re-executa todos os chunks** quando user responde missingInfoRequests. Otimização possível: rodar só chunks com pendências (ticket P2 em fila).
- **DeterministicValidator desabilitado em produção** via env flag. Reativar em produção real depois de calibrar.
- **Bug "Criar conta" no header**: ainda ilegível mesmo após fix de especificidade. Investigar mais profundo (DevTools → Computed Styles).
- **Sentry Express não instrumentado (11/05/2026)**: log do Railway mostra `[Sentry] express is not instrumented. Please make sure to initialize Sentry in a separate file that you --import when running node`. Não afeta captura básica de erros, mas perde auto-instrumentação de routes/middleware do Express. Fix: separar init do Sentry em `instrument.mjs` na raiz do `server/` e adicionar `--import ./instrument.mjs` no comando de start do Node. Sem urgência — Sentry continua capturando erros via `Sentry.captureException` explícito; só falta a parte de tracing automático.

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
| `CLERK_SECRET_KEY` | Clerk dashboard | validar JWT (DEV — migrar pra Production) |
| `CLERK_PUBLISHABLE_KEY` | Clerk dashboard | meta |
| `ANTHROPIC_API_KEY` | console.anthropic.com | LLM (Claude direto) |
| `LLM_MODEL=claude-sonnet-4-6` | manual | default |
| `LLM_MODEL_CRITICAL=claude-opus-4-6` | manual | Engenheiro, Orçamentista |
| `LLM_MODEL_INTERMEDIATE=claude-sonnet-4-6` | manual | Tributário, Gestão, Auditor, Board, Jurídico |
| `STRIPE_SECRET_KEY` (sk_live) | Stripe Live | pagamentos reais |
| `STRIPE_WEBHOOK_SECRET` | Stripe Live webhook | validar eventos |
| `STRIPE_PRICE_STARTER` | Stripe Live | price_id Starter |
| `STRIPE_PRICE_PRO` | Stripe Live | price_id Pro |
| `STRIPE_PRICE_BUSINESS` | Stripe Live | price_id Business |
| `FRONTEND_URL=https://engine.rres.com.br` | manual | success/cancel URL do checkout |
| `SENTRY_DSN` | Sentry | captura backend |
| `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com` | Cloudflare R2 | storage |
| `AWS_ACCESS_KEY_ID` | Cloudflare R2 token | storage |
| `AWS_SECRET_ACCESS_KEY` | Cloudflare R2 token | storage |
| `AWS_REGION=auto` | manual | R2 ignora região |
| `S3_BUCKET=rr-engine` | manual | bucket name |
| `CORS_ORIGINS=https://engine.rres.com.br` | manual | CORS allow list |
| `PINI_USER`, `PINI_PASS` | manual | scraping PINI (rotacionar pendente) |

### Vercel (`rr-engine-app`)

- `NEXT_PUBLIC_GA_ID=G-CJP1H6K66N`
- `NEXT_PUBLIC_API_URL=https://api.rres.com.br`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/`
- `NPM_TOKEN` — read:packages no GitHub (auth pra `@juniu86/rr-engine-api-types`)
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry frontend (tunnel `/monitoring`)
- `SENTRY_AUTH_TOKEN` — upload de source maps

---

## 8. Próximos passos

### Roadmap pra amanhã (12/05/2026)

**Primeira coisa ao retomar:** validar resultado do memorial simples que
Reginaldo testou no fim do dia 11/05. Quando ele mandar:

- Confirmar `Logística > 0` no card (Bug B do agente Logística)
- Confirmar `Impostos > 0` no card (gravação universal)
- Confirmar XLSX no formato novo: 5 abas, Mat/MO sem BDI, componentes
  do BDI editáveis em azul, fórmulas Excel nativas
- Confirmar `componentsApplied` no output do Comercial (BDI da planilha
  = BDI do card)
- Confirmar log do Railway sem warning Sentry `express is not
  instrumented`

**Bugs técnicos pendentes** (não bloqueiam Live mas ficaram na fila):

- [ ] **Bug #76**: `customer.subscription.updated` grava campos de
  período como epoch 0. Webhook handler em `server/routers/stripe.ts`
  ou `server/stripe/webhook.ts`. Investigação + fix.
- [ ] **Bug #82**: status `approved` com `auditSeal: rejected` (caso
  PAA DGOA). Revalidar — pode estar resolvido pelos PRs novos.
- [ ] **Melhoria #103**: `numericFingerprintsMatch` aceitar match
  exato (qty + unitCost zero delta) sem threshold textual mínimo.
  Pega Aço CA-50 do REV_07 que escapou ao dedup numérico atual.

### Bloqueando Live (P0) — checklist 12 itens

A fonte canônica está em `02 - MKT/STATUS_E_ROADMAP_RR_ENGINE.md` seção 3. Resumo do que falta:

- [ ] **Smoke test Maricá** com produto corrigido (já corrigido em 11/05, falta validar)
- [ ] **Smoke test Paulo Sérgio + Fórmula 1** com mesma validação
- [ ] **PR separado pra blog**: migração `content/blog/` + `Header.tsx` que ficaram fora
- [ ] **Backup MySQL Railway** (R$ 30/mês, 5 min) — depende de Reginaldo
- [ ] **Migrar Clerk dev keys → production** (~10 min) — depende de Reginaldo
- [ ] **FAQ / Termos / Política cancelamento / Política reembolso** — Cowork escreve
- [ ] **Email `contato@rres.com.br`** ativo recebendo dúvidas — depende de Reginaldo
- [ ] **Subir preços 50% margem**: Starter R$ 299 / Pro R$ 999 / Business R$ 2.999. Atualizar em 7 lugares (Stripe Live, Railway env, products.ts, scripts/create-stripe-products.mjs, lib/site-config.ts, app/page.tsx, schema SoftwareApplication)
- [ ] **Bug "Criar conta" no header** — investigar Computed Styles
- [ ] **Vídeo de onboarding** 90s (Reginaldo grava com Loom/Tella)

### Onda 1 (Mês 1 pós-Live)

- Wizard guiado segmentado — fluxo "Reforma residencial" primeiro
- Threshold Opus → Sonnet automático por complexidade da obra (reduz custo unitário ~30%)

### Onda 2 (Mês 2-3)

- Multi-agente perguntando: Logística + Tributário também podem fazer `missingInfoRequests`, batch único
- Embeddings pra dedup semântica do Auditor

### Onda 3 (Mês 4-6)

- Agente Conversor de Laudo (`feat/p3-agente-conversor-laudo` em fila, spec pronta)
- Cache semântico de orçamentos (gatilho: > 100 orçamentos/mês)

### Pendências secundárias (não bloqueantes)

- [ ] Rotacionar `PINI_PASS` (passou pelo chat na migração — declinado, ainda pendente)
- [ ] Rotacionar senha MySQL Railway (passou pelo chat 07/05 — declinado, ainda pendente)
- [ ] Bug #82: status `approved` com `auditSeal: rejected` (caso PAA DGOA)
- [ ] Bug #76: handler `customer.subscription.updated` grava período como epoch 0
- [ ] Reativar `DeterministicValidator` em produção (hoje desabilitado via env flag)
- [ ] Estabilizar prompts do Tributário e Auditor com few-shot (ticket P2)
- [ ] Limpar branch zombie `feat/p3-trpc-type-safety-frontend`

---

## 9. Histórico de sessões

### Sessões pré-migração (até 06/05/2026)

44 tasks concluídas. Highlights:

- **Sprint 2**: Clerk auth (3 fixes de v7 deprecation)
- **Sprint 3**: Railway provisioned, MySQL migrations, R2 storage, domínio custom
- **Sprint 4**: 8 sub-sprints da UI (4.1 a 4.8) + correções (Comercial, Tributário, Auditor)
- **Otimizações**: reaproveitamento, invalidação cascata, paralelismo de chunks
- **LLM**: streaming + prompt caching no Anthropic
- **Polish**: warnings Auditor, upload PDF, revisões, contraste botões

### Sessão 07/05/2026 — Stripe Live + grill estratégico

- Stripe Live ativado, 3 produtos criados, webhook configurado
- Key `sk_live` rotacionada após exposição em chat
- Cap mensal por plano (Starter=2 / Pro=7 / Business=20) — testado, 3º bloqueia
- Sentry deployado e validado via tunnel `/monitoring` (resolve bloqueio Safari ITP / adblocker)
- Grill estratégico de 7 perguntas → `STATUS_E_ROADMAP_RR_ENGINE.md` v1.0
- 12 itens "Pronto pra Cobrar" definidos
- Roadmap em 3 ondas (Wizard / Multi-agente / Conversor de Laudo)
- Análise técnica de 5 bugs P0 do output (planilha XLSX vs dashboard)
- Conversão de laudo Posto Paulo Sérgio + Fórmula 1 em memorial Engine-readable

### Decisão de processo (08/05, fim do dia)

**Daqui em diante só faz frente nova quando o que já está em andamento estiver pronto.** Não acumular Ondas 1/2/3 enquanto smoke tests pós-correção P0 não validarem os números do output e enquanto FAQ + termos + políticas + pricing 50% + backup MySQL + Clerk production keys não estiverem fechados. Princípio: terminar antes de abrir nova frente.

### Regra de validação antes de teste pago (11/05/2026)

Origem: 5 PRs + 5 revisões pagas no Maricá sem fechar o gap dos totais
corretos. Cada execução custa dinheiro real (Anthropic API por chamada
de agente, 10 chamadas por orçamento).

**Nenhum smoke test ou execução de pipeline novo pode ser pedido sem
Cowork antes pronunciar literalmente:**

> "Todos os erros que você reportou foram corrigidos, todos os testes
> necessários à validação desta informação foram feitos e agora você pode
> ensaiar o modelo XPTY para me entregar o resultado e termos capacidade
> de criticar possíveis novas melhorias."

Condições pra Cowork poder dizer essa frase:

1. Análise ampla, geral e irrestrita do código — todos os caminhos do
   problema, não só o óbvio. Bug de "totais não gravados" exige varrer
   `confirmProposal`, auto-approve, `applyAuditCorrections` **e** o
   caminho `status="review"` que historicamente não grava.
2. `pnpm check` passa no repo afetado.
3. Testes unitários relevantes existem e cobrem o cenário (ler asserts
   manualmente se não puder rodar).
4. Validação matemática quando há número envolvido.
5. Hipótese clara do resultado esperado antes do teste.

Gravada em 3 lugares (este HANDOFF, `rr-engine/CLAUDE.md`, e
`02 - MKT/Claude/03_CONFIGURACAO_CLAUDE/modo-de-trabalho.md`) pra próxima
sessão de Cowork ou Code não esquecer.

### PR #33 obsoleto

`fix(P0): normaliza BDI percent vs decimal — projeto 12 caso 0,13%` ficou em conflito quando o PR `feat/p0-bdi-cronograma` foi mergeado. Causa: o fix do PR #33 era um remendo no `comercialCalculator.ts` antigo (decimal vs percentual). O novo `comercialCalculator.ts` com fórmula NBR 12721 reescreveu o arquivo e elimina o bug pela raiz — `companyBdiSettings.bdiPercentual` (que era a fonte da ambiguidade decimal/percent) não existe mais como input. Em vez disso, os componentes Lucro/AC/DF/R/S/G entram em pontos percentuais e são divididos por 100 no calculador. **Fechar PR #33 sem mergear.**

### Sessão 11/05/2026 — Cadeia de fixes P0 + XLSX novo layout + Sentry

Sessão longa (~12h). Diagnóstico via SQL direto no MySQL Railway evitou
revisões pagas. 7 PRs backend + 1 PR frontend mergeados sequencialmente.

**PRs mergeados:**

1. `fix/p0-split-totals` — `extractFinalTotalsFromExecutions` aplica
   `splitBudgetAndLogistics` em `services/projectTotals.ts`. Resolve
   "Logística R$ 0" no card do dashboard.

2. `fix/p0-auditor-modal-dedup` — dois fixes em `server/agents/dedupUtils.ts`
   e `server/agents/index.ts`:
   - `numericFingerprintsMatch`: mesma unit + qty + unitCost (tolerância
     1%) marca como duplicata mesmo com Jaccard textual baixo. Pega
     casos de chunking que regerou item com texto parafraseado.
   - `inferRemovalsFromValidations`: quando o Auditor sinaliza overlap
     em `validations` (passed=false) mas esquece de popular
     `corrections.budgetItemsToRemove`, parser extrai "Item N", "Itens
     M e P" do texto da validation e promove automaticamente.

3. `fix/p0-auditor-report-cleanup` (frontend) — `AuditorReport.tsx`
   esconde validações `scope_overlap_*` da lista crua quando há
   `corrections.budgetItemsToRemove` populado (o modal cobre o caso).

4. `fix/p0-tributario-faixa-simples` — `buildAgentInput` case
   `"tributario"` no `routers.ts:3085` faltava propagar `faixaSimples`.
   Quando regime=Simples Nacional, `isCompleteTaxSettings` rejeitava
   internamente no agente. Erro no log Railway:
   `Tributario: companyTaxSettings ausente ou incompleto`. Fix: propagar
   campo + adicionar gate `isCompleteTaxSettings` em `continueAgent`
   (defesa em profundidade).

5. `fix/p0-persist-totals-all-paths` — `persistFinalTotals` em
   `server/services/projectTotals.ts` (helper único). Chamado em todos
   os 7 caminhos terminais do pipeline (blocked, pending_confirmation,
   review×3, approved×2 + falha single agent). Antes só 3 caminhos
   gravavam totais — bug grave do `executeRemainingAgents` (background)
   marcando `approved` sem gravar. Mutation nova `agent.recomputeTotals`
   pra projetos legados (custo zero).

6. `fix/p0-auditcorrect-logistica-formato` — dois fixes:
   - `applyAuditCorrections` preserva `comercial.adjustedBdi` original
     em vez de recalcular com `fiscalRisk:"low"` hardcoded. Antes
     sobrescrevia BDI 55,90% (do Comercial com ajuste fiscalRisk=high)
     por 48,94% (NBR sem ajustes), perdendo R$ 237k. Tributos
     proporcional ao novo preço final.
   - `agentPersistence.ts` linha 370+ persiste Logística quando output
     vem como `items` (formato novo do agente), não só `costs`.
     Cascateava em tabela `logistics_costs` vazia.
   - `extractFinalTotalsFromExecutions` também lê `logOutput.items`.

7. `feat/p0-xlsx-sem-bdi-formulado` — `services/documents.ts` reescrito.
   XLSX gerado pelo Engine agora tem 5 abas com layout do REV_07_REVISADO
   manual: Resumo Executivo (fórmulas cruzando abas), Orçamento de
   Custo SEM BDI nos itens (Mat/MO em azul editáveis), Custos
   Logísticos sem BDI, BDI e Markup com componentes NBR 12721
   editáveis, Fluxo de Caixa. Cores: azul nos inputs, fórmulas Excel
   nativas (zero hardcode de cálculo). `computeComercial` preenche
   `output.componentsApplied` com valores AJUSTADOS pra aba BDI bater
   com o card. Sentry corrigido pra Express ESM via `--import`:
   - `server/instrument.ts` (novo) só com `Sentry.init`
   - `_core/sentry.ts` virou re-export
   - `package.json` start: `node --import ./dist/instrument.js dist/index.js`
   - `build`: esbuild compila 2 entrypoints

**Análises técnicas via SQL direto** (sem rodar pipeline):

- Projeto 18 (REV_06) — diagnóstico de bug do Tributário via log
  Railway + queries em `agent_executions` mostraram que
  `applyAuditCorrections` foi chamado automaticamente quando user
  aprovou o `AuditCorrectionsModal`. Recalculou BDI com parâmetros
  errados. Tabela `logistics_costs` vazia confirmou Bug B.

- Auditor identificou Aço CA-50 com mesma qty/unit/unitCost como
  duplicado, mas o `numericFingerprintsMatch` tinha threshold textual
  0,30 que bloqueava (Jaccard era 0,07). Melhoria registrada como #103.

**Deliverable manual:** `Marica_Eu_te_Amo_REV_07_REVISADO.xlsx` criado
fora do sistema (Python + openpyxl) pra time RR usar agora, sem
esperar deploy. Salvo em `~/Downloads/rr-engine-main/`.

**Regra de processo gravada** (4 docs):

> "Todos os erros que você reportou foram corrigidos, todos os testes
> necessários à validação desta informação foram feitos e agora você pode
> ensaiar o modelo XPTY..."

Sem essa frase ritual, nenhum teste pago. Origem: 5 PRs + 5 revisões
pagas no Maricá sem fechar o gap.

### Sessão 08/05/2026 — P0 BDI NBR + cronograma + cancel

- **Análise XLSX projeto 13 Maricá** — diagnóstico do delta entre dashboard (R$ 2.450.190) e planilha. Causa: `confirmProposal` somava `budget_items` direto da DB, e o LLM enfia logística junto. Fix lendo direto dos outputs dos agentes.
- **3 PRs mergeados no backend**: `feat/cancel-execution`, `feat/p0-bdi-cronograma` (que combinou BDI NBR + cronograma fix em um PR só)
- **Migrations 0022 + 0023** rodadas no MySQL Railway via `railway connect MySQL` (precisou instalar `mysql-client` via brew)
- **PR frontend pushed** (aguardando merge): `feat/p0-settings-bdi-readonly` com `BdiSettingsForm.tsx` (BDI total readonly + Seguros/Garantias) + cancelExecution UI no `AgentPipelineLive`
- Decisão de produto: **Tributos sempre dentro do preço** (cliente paga preço cheio, RR não come da margem). Implementado via fórmula NBR 12721 com `1/(1−I)`.
- Decisão UI: **BDI total não é editável** — é derivado dos componentes em tempo real. Aumentar Lucro 1pp aumenta BDI ~1,2pp (efeito do `1/(1−I)`).
- Empresas de qualquer tamanho podem usar — campos de Simples Nacional Anexo IV + Lucro Presumido + Lucro Real + override manual da alíquota I.

Histórico via git:

```bash
git log main --oneline -50  # rr-engine
git log main --oneline -30  # rr-engine-app
```

---

## 10. Documentação relacionada

- **`STATUS_E_ROADMAP_RR_ENGINE.md`** (em `02 - MKT/`) — fonte canônica de gestão. Estado, checklist Pronto-pra-Cobrar, decisões estratégicas, ondas de roadmap, riscos, métricas.
- **`PLANO_GTM_FASE1_EMPREITEIRA_PEQUENA.md`** (em `02 - MKT/`) — go-to-market Fase 1.
- **`MEMORIAL_PAULO_SERGIO_ENGINE.md`** + **`MEMORIAL_FORMULA1_RECUPERACAO_ESTRUTURAL.md`** + **`COMO_CONVERTER_LAUDO_EM_MEMORIAL.md`** (em `02 - MKT/`) — conversão de laudo técnico em memorial Engine.
- **`CLAUDE.md`** (em ambos repos) — guia técnico pro Claude Code, com referências aos PRs P0 e fluxo de trabalho.
- **`modo-de-trabalho.md`** + **`estilo-comunicacao.md`** + **`sobre-mim.md`** (em `02 - MKT/Claude/03_CONFIGURACAO_CLAUDE/`) — protocolo Cowork.

## 11. Quem assume daqui

- **Smoke tests pós-correções** → Reginaldo (manual, com obras reais Maricá / Paulo Sérgio / Fórmula 1).
- **Conteúdo Live** (FAQ, termos, políticas) → Cowork (eu, próxima sessão).
- **Migração blog Astro→Next.js** → Cowork.
- **Pricing 50% margem** (7 lugares) → Code via PR.
- **Onda 1 (Wizard residencial + Threshold modelos)** → Code via spec.
- **Onda 3 (Conversor de Laudo)** → Code, spec já existe (`feat/p3-agente-conversor-laudo`).
