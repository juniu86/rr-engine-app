# RR Engine — documento de retomada

**Versão:** v1
**Data do snapshot:** 04/05/2026
**Para:** Reginaldo retomando trabalho depois da pausa

Leia este arquivo primeiro quando retomar o trabalho. Ele consolida onde estamos, o que vem, e como destravar cada próximo passo.

---

## 1. Por onde começar quando voltar

1. Abrir este arquivo (`HANDOFF.md` na raiz do `rr-engine-app`).
2. Ler `docs/perfil/sobre-mim.md`, `docs/perfil/estilo-comunicacao.md`, `docs/perfil/estilo-de-trabalho.md` — esses três são instruções operacionais para qualquer assistente que entrar contigo.
3. Conferir o status atual em **Seção 4** abaixo.
4. Decidir entre **Sprint 2** (continuar migração) ou **outra prioridade** listada em **Seção 6**.

---

## 2. O que é o RR Engine

SaaS de orçamentação automatizada de obras civis. Pipeline sequencial de **10 agentes de IA** que recebe memorial descritivo e devolve, em 5 a 15 minutos:

- Proposta comercial (PDF)
- Memória de cálculo (XLSX)
- Cronograma físico (semanas)
- Análise de fluxo de caixa

**Diferenciais reais:** velocidade, geração automática de proposta jurídica, auditoria matemática no fim do pipeline, base SINAPI/PINI atualizada.

**Concorrentes diretos:** OrçaFascio (R$ 89-249/mês), Sienge eCustos (enterprise R$ 600+), Compor 90 (desktop legado), ORSE (gratuito SE).

**Estado comercial atual:** zero clientes pagantes, em preparação para primeira venda.

---

## 3. Estrutura de pastas e repositórios

### Pastas que tenho hoje no Mac

```
~/Downloads/rr-engine-main/                — workspace inicial recebido para análise (ARQUIVAR)
~/Documents/GitHub/rr-engine/              — repo principal de implementação (manter ativo até Sprint 6)
~/Documents/GitHub/rr-engine-landing/      — landing institucional Astro (substituída pelo rr-engine-app)
~/Documents/GitHub/rr-engine-app/          — repo novo Next.js 16 (SERÁ o app oficial pós-migração)
~/Library/CloudStorage/OneDrive-Pessoal/Documentos/RR Engenharia/02 - MKT/  — assets de marca
```

### Estado de cada repo

| Repo | Estado | Vai virar |
|---|---|---|
| `juniu86/rr-engine` (privado) | Repo do app atual rodando no Manus. P0+P1 implementados, parte do P2 também. Versão 3.1.0 | Arquivar quando Sprint 6 terminar (cutover total) |
| `juniu86/rr-engine-landing` (público) | Astro com landing institucional, vivo em `engine.rres.com.br` via GitHub Pages | Substituído pelo `rr-engine-app` no Sprint 1 (em curso). Após cutover do DNS, arquivar |
| `juniu86/rr-engine-app` (privado) | Next.js 16 + React 19 + Tailwind 4. Sprint 1 quase pronto (falta deploy Vercel + cutover) | **Repo principal do produto pós-migração** |

### Saneamento proposto

**Hoje (durante a pausa):** nada apagar. Manter tudo até Sprint 6 fechar.

**Depois do Sprint 6 (cutover total concluído):**

1. Arquivar `rr-engine` (`Settings → General → Archive`). Mantém histórico, não permite mais commits.
2. Arquivar `rr-engine-landing` (mesmo procedimento).
3. Apagar `~/Downloads/rr-engine-main/` localmente — todo conteúdo importante já foi commitado em algum repo.
4. Apagar clones locais de `rr-engine` e `rr-engine-landing` se quiser liberar espaço (`rm -rf` — eles ficam no GitHub arquivado de qualquer forma).
5. **Manter** `~/Documents/GitHub/rr-engine-app/` como repo único do produto.
6. **Manter** `02 - MKT/` da OneDrive — referência de assets visuais permanece útil.

---

## 4. Status atual — o que está feito

### 4.1 Análise estratégica (concluída)

Em `~/Documents/GitHub/rr-engine/analise-estrategica/`:

- **A — Diagnóstico mecânico** (`01_diagnostico_mecanica_v1.md`) — análise dos 10 agentes, débitos técnicos P0/P1/P2.
- **B — Unit economics** (`02_unit_economics.xlsx` + `_script.py`) — planilha com 231 fórmulas, 3 cenários, stress test.
- **C — Plano de migração** (`03_plano_migracao_v1.md`) — duas fases, stack proposta, custos.
- **D — Plano de SEO** (`04_plano_seo_indexacao_v1.md`) — 30 keywords, 12 artigos pilar, cronograma 12 meses.
- **E — Plano comercial** (`05_plano_comercial_v1.md`) — pricing 4 tiers, 50 construtoras-alvo, outbound, parcerias.
- **F — Resumo executivo** (`06_resumo_executivo_v1.md`) — uma página com tese, decisões críticas, MRR projetado.

### 4.2 Implementação no `rr-engine` atual (Manus)

Em `~/Documents/GitHub/rr-engine/implementacao/`:

**Tickets P0 (todos mergeados):**
- P0.5 — CI no GitHub Actions
- P0.2 — Temperature explícita por agente
- P0.3 — Telemetria de tokens (`agent_llm_calls`)
- P0.1 — Engine determinístico como validador cruzado
- P0.4 — Hard limits silenciosos removidos

**Tickets P1 (todos mergeados):**
- P1.5 — Bloquear fallback silencioso de impostos
- P1.5.1 — Coluna `faixa_simples` (spillover do P1.5)
- P1.3 — Dedup pós-merge entre chunks
- P1.1 — Tributário/Jurídico/Board migrados para Sonnet
- P1.2 — Comercial e Financeiro determinísticos
- P1.4 — SINAPI/PINI versionadas (Phase 3 de scraping ativo de PINI fica pendente — P1.4.1)
- P1.6 — Templating estruturado para Jurídico

**Tickets P2 (parcialmente mergeados):**
- ✅ P2.3 — Minify JSON em prompts
- ✅ P2.6 — Dedup determinístico
- ✅ P2.7 — Limpeza de arquivos antigos
- ✅ P2.2 — Langfuse (observabilidade)
- ⏸ P2.1, P2.4, P2.5 — em backlog para revisitar pós-migração

**Tickets escritos mas não implementados:**
- P1.4.1 — Implementação de scraping PINI/TCPO (pendente decisão de fonte)
- P1.7 — Pricing 3 tiers no Stripe + cap de tamanho

### 4.3 Landing institucional (Astro)

Em `~/Documents/GitHub/rr-engine-landing/`:

- **Vivo em `https://engine.rres.com.br`** (HTTPS via GitHub Pages)
- **Identidade visual da RR aplicada** (logo isotipo, paleta azul-marinho/azul-vibrante, gradientes)
- **8 seções:** Hero, Como funciona (3 passos), Features bento, 10 Agentes, Comparativo técnico, Personas, Planos (4 tiers), FAQ, CTA
- **SEO técnico completo:** sitemap, robots, schemas JSON-LD (SoftwareApplication, Organization, FAQPage, Article), Open Graph, Twitter Card, canonical
- **Analytics:** GA4 ativo (`G-CJP1H6K66N`)
- **Search Console:** propriedade verificada, sitemap submetido (status: dados em processamento)
- **Páginas legais:** `/privacidade` e `/termos` em dark mode

### 4.4 App novo (Next.js — Sprint 1 em curso)

Em `~/Documents/GitHub/rr-engine-app/`:

- ✅ Repo `juniu86/rr-engine-app` criado (privado)
- ✅ Next.js 16 + React 19 + Tailwind 4 + TypeScript
- ✅ Componentes: `Header`, `Footer`, `Icons`, `LegalLayout`
- ✅ Páginas: `/`, `/login`, `/privacidade`, `/termos`
- ✅ Paleta dark mode + glassmorphism replicada
- ✅ Assets copiados (logo, favicon, og-image, sitemap, robots)
- ⏳ **Pendências Sprint 1:** rodar `npm run dev` localmente e validar visualmente, commit + push, provisionar Vercel, cutover DNS no GoDaddy

---

## 5. Próximas etapas — Sprints 2 a 6 da migração

### Sprint 1 — Infra + Next.js base + cutover DNS

**Status:** ~85% feito. Falta apenas validar local + deploy + cutover.

**O que falta executar quando voltar:**

```bash
cd ~/Documents/GitHub/rr-engine-app

# 1. Apagar SVGs default que sandbox não conseguiu apagar
rm -f public/file.svg public/vercel.svg public/next.svg public/globe.svg public/window.svg
rm -f app/favicon.ico

# 2. Testar local
npm run dev
# Abre http://localhost:3000 — confere visual

# 3. Commit + push
git add -A
git commit -m "feat: Sprint 1 — Next.js 16 + landing portada (dark mode + glass + identidade RR)"
git push

# 4. Provisionar Vercel
# - https://vercel.com → New Project → Import GitHub → juniu86/rr-engine-app
# - Variáveis de ambiente: NEXT_PUBLIC_GA_ID=G-CJP1H6K66N
# - Deploy automático no push para main

# 5. Cutover DNS no GoDaddy
# - Atualizar CNAME de engine.rres.com.br
#   - Hoje: aponta pra juniu86.github.io (landing Astro)
#   - Mudar para: cname.vercel-dns.com (Vercel app)
# - SSL: Vercel emite automaticamente
```

**Resultado esperado:** site novo (Next.js) substitui o Astro em `engine.rres.com.br`, mesmo visual. Botão "Entrar" aponta pra `rrengine.manus.space` durante a transição.

### Sprint 2 — Auth com Clerk

- Criar conta Clerk (free tier 10k MAU)
- Configurar provedor (Google + Email/Magic Link)
- Adicionar `@clerk/nextjs` no `rr-engine-app`
- Páginas reais `/login`, `/signup`, `/dashboard` (protegida)
- Webhook Clerk → cria/atualiza usuário no TiDB
- Migração da sua conta Manus: signup novo no Clerk, vincular ao `userId` existente no TiDB

### Sprint 3 — Backend e pipeline

- Provisionar Railway, hospedar o Express + tRPC + Drizzle
- Configurar variáveis: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`, `STRIPE_*`, `AWS_*`, `LANGFUSE_*`
- Remover wrappers Manus (`_core/sdk.ts`, `dataApi.ts`, `notification.ts`, `imageGeneration.ts`, `voiceTranscription.ts`)
- Substituir OAuth Manus por validação de token Clerk em todas as procedures tRPC
- Apontar Next.js para o backend novo (Railway URL via env)
- Smoke test: rodar 1 orçamento end-to-end no novo stack

### Sprint 4 — UI completa

- Portar páginas do app atual (`Dashboard`, `NewProject`, `ProjectDetails`, `Settings`, `Planos`, `AdminDashboard`, `CompareRevisions`, `ComponentShowcase`) do React+Vite para Next.js
- Manter componentes que dão certo (`AgentProgressPipeline`, `AIChatBox`, `MoneyValue`, etc.)
- Migrar tRPC client para usar fetch dentro do Next.js (Server Components onde fizer sentido)

### Sprint 5 — Stripe + planos 4 tiers (P1.7)

- Implementar ticket P1.7 do índice (`implementacao/P1.7_pricing_3_tiers_cap_tamanho.md`)
- Criar produto Empresarial no Stripe
- Tabela `subscriptions` no banco
- Middleware de cap por plano
- Frontend mostrando contador "X de N orçamentos usados"
- Webhook Stripe sincronizando subscriptions

### Sprint 6 — Smoke test + cutover total + desligar Manus

- Rodar 5-10 orçamentos reais comparando output do app novo com produção atual no Manus
- Conferir: telemetria de tokens, SLA, latência total, qualidade da proposta gerada
- Atualizar comunicação interna (e-mail para você mesmo) com URL nova
- Apontar `rrengine.manus.space` (DNS / redirect) para `engine.rres.com.br` durante 30 dias
- Desligar tenant Manus (cancelar plano, exportar dados que ainda não saíram)
- Arquivar repos `rr-engine` e `rr-engine-landing` no GitHub

---

## 6. Decisões pendentes — resolver quando retomar

### 6.1 Bloqueantes para Sprint 2+

1. **Clerk:** criar conta antes do Sprint 2 começar. Free tier serve. URL: [clerk.com](https://clerk.com).
2. **Railway:** criar conta antes do Sprint 3. Plano Hobby R$ 25/mês cobre fase atual. URL: [railway.app](https://railway.app).
3. **Anthropic API key:** provisionar uma chave dedicada para produção (separada da que usa em dev). URL: [console.anthropic.com](https://console.anthropic.com).
4. **Google AI Studio API key:** para o agente Logística (Gemini Flash). URL: [aistudio.google.com](https://aistudio.google.com).
5. **CNPJ separado para o SaaS:** RR Engenharia não tem CNAE de software. Decisão: criar PJ nova para faturar o RR Engine. **Pendente — atalha quando primeiro cliente real entrar**.

### 6.2 Não-bloqueantes mas valem decidir

6. **Bing Webmaster:** importação direta do GSC, 3 minutos. Captura tráfego de Edge/Bing.
7. **PINI scraping (P1.4.1):** decidir entre TCPOWeb pago, fonte alternativa, ou continuar com base estática. Sem cliente exigindo, não tem urgência.
8. **Conteúdo SEO (Plano D):** primeiros 3 artigos pilar — você escreve, contrata redator, ou eu escrevo drafts pra você revisar?
9. **Outbound (Plano E):** quando começar prospecção das 50 construtoras-alvo? Recomendado: depois do Sprint 6, quando tem produto vendável estável.

### 6.3 Decisões já tomadas (registradas para não revisitar)

- ✅ Reconstruir fora do Manus
- ✅ Domínio principal: `engine.rres.com.br`
- ✅ Stack: Next.js 16 (frontend) + Railway (backend Express continua) + TiDB Cloud (banco) + Clerk (auth) + Stripe (pagamento)
- ✅ Pricing 4 tiers: Avulso R$ 89,90 / Profissional R$ 450 / Empresarial R$ 990 / White-label R$ 2.500 + R$ 30
- ✅ Logo: isotipo da RR Engenharia em azul vibrante
- ✅ Migração total imediata (não em duas fases)
- ✅ Manter SINAPI/PINI como referência interna, sem trocar fonte primária
- ✅ Páginas legais: `/privacidade` e `/termos` LGPD-compliant publicadas
- ✅ Foro contratual: comarca da cidade onde a obra está sendo feita

---

## 7. Métricas de acompanhamento — próximos 90 dias

Definidas no Resumo Executivo (`analise-estrategica/06_resumo_executivo_v1.md`):

1. **Custo médio de LLM por orçamento** — meta < R$ 25 médio. Coletar via tabela `agent_llm_calls`.
2. **Taxa de demo agendada por toque 1** — meta > 3% após começar outbound.
3. **CAC por cliente Profissional fechado** — meta < R$ 1.500 (LTV/CAC > 3).

**MRR projetado:**
- Mês 6: R$ 5-15k
- Mês 12: R$ 20-50k
- Mês 18: R$ 50-100k

---

## 8. Onde encontrar coisas

| Quero... | Está em... |
|---|---|
| Briefing técnico para Claude Code rodar implementação | `~/Documents/GitHub/rr-engine/implementacao/P*.md` |
| Diagnóstico dos 10 agentes (modelo, tokens, riscos) | `~/Documents/GitHub/rr-engine/analise-estrategica/01_diagnostico_mecanica_v1.md` |
| Planilha de unit economics (custo por orçamento) | `~/Documents/GitHub/rr-engine/analise-estrategica/02_unit_economics.xlsx` |
| Pricing dos 4 tiers + 50 construtoras-alvo + outbound 5 toques | `~/Documents/GitHub/rr-engine/analise-estrategica/05_plano_comercial_v1.md` |
| Plano de SEO com 30 keywords + 12 artigos pilar | `~/Documents/GitHub/rr-engine/analise-estrategica/04_plano_seo_indexacao_v1.md` |
| Logo, paleta, fontes da RR Engenharia | `~/Library/CloudStorage/OneDrive-Pessoal/Documentos/RR Engenharia/02 - MKT/` |
| Código do app atual rodando no Manus | `~/Documents/GitHub/rr-engine/server/`, `client/` |
| Código do app novo (em construção) | `~/Documents/GitHub/rr-engine-app/` |
| Landing institucional Astro (transitória) | `~/Documents/GitHub/rr-engine-landing/` |
| Como você (assistente) deve se comportar comigo | `docs/perfil/sobre-mim.md`, `estilo-comunicacao.md`, `estilo-de-trabalho.md` |

---

## 9. Acessos e credenciais (nunca commitar segredos)

Listo aqui o que existe. Os segredos ficam em `.env.local` (gitignored) ou nos painéis das próprias plataformas.

- **GitHub:** `juniu86`, SSH key configurada
- **GoDaddy:** acesso integral, DNS de `rres.com.br`
- **Registro.br:** domínio em nome de Sergio Augusto Gomes de Oliveira (sócio) — coordenar para alterações
- **Manus:** créditos legados (custo zero hoje)
- **Stripe BR:** ativo, suporta Pix + cartão
- **TiDB Cloud:** banco MySQL/TiDB Serverless ativo, dados de produção
- **AWS:** S3 bucket `rrengine-prod` (verificar credenciais)
- **Anthropic:** API key existe (usada via Forge da Manus)
- **Google AI Studio:** Gemini key (usada via Forge da Manus)
- **Google Analytics 4:** property `engine.rres.com.br` com Measurement ID `G-CJP1H6K66N`
- **Google Search Console:** propriedade `engine.rres.com.br` verificada
- **Clerk:** **NÃO criada ainda** — Sprint 2
- **Railway:** **NÃO criada ainda** — Sprint 3
- **Vercel:** **NÃO criada ainda** — Sprint 1 final

---

## 10. Como retomar prática

Quando você voltar e abrir uma nova sessão com qualquer assistente, cole isto no início da conversa:

> Estou retomando trabalho no RR Engine. Antes de qualquer coisa, leia estes arquivos no diretório `~/Documents/GitHub/rr-engine-app/`:
>
> 1. `HANDOFF.md` (raiz)
> 2. `docs/perfil/sobre-mim.md`
> 3. `docs/perfil/estilo-comunicacao.md`
> 4. `docs/perfil/estilo-de-trabalho.md`
>
> Depois de ler, me diga em uma frase onde paramos e qual a próxima ação prática.

Isso garante que o assistente tem contexto completo sem você precisar repetir tudo.

---

**Última atualização deste documento:** 04/05/2026, fim da Sprint 1 (em curso).

**Próxima atualização recomendada:** ao final de cada sprint (2, 3, 4, 5, 6) — atualizar Seção 4 (status), Seção 5 (próximas etapas) e Seção 6 (decisões pendentes).
