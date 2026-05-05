# Saneamento das pastas de trabalho

Plano para manter o ambiente local limpo durante e após a migração.

## Estado atual (snapshot 04/05/2026)

```
~/Downloads/rr-engine-main/                    [3 MB]   workspace inicial recebido
~/Documents/GitHub/rr-engine/                  [~50 MB] repo do app rodando no Manus
~/Documents/GitHub/rr-engine-landing/          [~30 MB] landing Astro
~/Documents/GitHub/rr-engine-app/              [~250 MB] app novo Next.js (em construção)
~/Library/CloudStorage/.../02 - MKT/           [~30 MB] assets de marca da RR
```

## Política recomendada

### Durante a migração (Sprints 1-6)

**Não apagar nada.** Cada repo serve a um propósito hoje:

| Pasta | Por que mantém |
|---|---|
| `rr-engine-main` | Backup do código original recebido. Se algo for perdido em transição, é fonte de verdade. |
| `rr-engine` | App rodando em produção no Manus. Continua servindo usuários até cutover. |
| `rr-engine-landing` | Landing pública atual em `engine.rres.com.br` até Vercel assumir. |
| `rr-engine-app` | Repo principal do produto pós-migração. |
| `02 - MKT` | Assets visuais (logo, fontes, branding) — referência permanente. |

### Após Sprint 6 (cutover total concluído)

#### Locais (no Mac)

```bash
# 1. Backup final do rr-engine-main, depois apagar
cd ~/Downloads
zip -r rr-engine-main-backup-$(date +%Y%m%d).zip rr-engine-main/
mv rr-engine-main-backup-*.zip ~/Documents/Backups/   # (cria essa pasta se não tiver)
rm -rf rr-engine-main/

# 2. Manter clones locais por mais 30 dias para precaução
#    Depois disso, pode apagar — repos arquivados no GitHub continuam acessíveis
# rm -rf ~/Documents/GitHub/rr-engine-landing/
# rm -rf ~/Documents/GitHub/rr-engine/
```

#### Remotos (GitHub)

1. Acessar `https://github.com/juniu86/rr-engine/settings`
2. Em "Danger Zone", clicar `Archive this repository`. Isso:
   - Mantém o repo público/privado conforme estava
   - Bloqueia novos commits
   - Mantém todo histórico, issues, PRs
   - Fica visível com tag "Archived" no perfil

3. Repetir para `juniu86/rr-engine-landing`.

4. Em `juniu86/rr-engine-app/Settings`, atualizar descrição se quiser refletir o status novo (ex.: "RR Engine — produto principal, anteriormente em rr-engine").

### Pasta `02 - MKT` da OneDrive

**Manter ativa permanentemente.** É repositório de assets vivos da marca. Se algum dia consolidar em design system próprio, cria uma subpasta `Sistema/` dentro dela.

## Convenção de nomes para futuros repos

Caso você crie repos relacionados ao RR Engine no futuro:

- `rr-engine-app` — produto principal
- `rr-engine-docs` — documentação pública (se separar do produto)
- `rr-engine-mobile` — versão mobile, se for o caso
- `rr-engine-{plugin}` — extensões oficiais

Evita repetir o experimento atual de ter `rr-engine`, `rr-engine-main`, `rr-engine-landing`, `rr-engine-app` ao mesmo tempo.

## Convenção de branches dentro de cada repo

Mantida a regra do `CLAUDE.md`:

```
feat/p0-1-engine-validacao-cruzada     — feature/débito técnico
fix/p0-4-hard-limits                    — correção
chore/cleanup-old-files                 — manutenção
docs/atualiza-sprint-3                  — documentação
hotfix/cnpj-empresa                     — fix urgente
```

Após cada PR mergeado, **apagar branch** (botão "Delete branch" no GitHub) para não acumular.

## Política de commits secretos

Nunca commitar:

- `.env` ou `.env.local` (já está no `.gitignore`)
- Chaves SSH privadas
- Tokens de API (Anthropic, Google, Stripe, Clerk, Langfuse, etc.)
- Credenciais de banco
- Snapshots de produção com dados de cliente real

Se algo vazou por acidente:

1. Revogar a chave imediatamente no provedor
2. `git filter-repo` ou BFG para remover do histórico
3. Force push pra `main`

## Política de upload de arquivos

Antes de adicionar arquivo binário (>5 MB) no repo, considera:

- **Imagens grandes:** otimizar antes (TinyPNG, ImageOptim) ou hospedar em CDN
- **PDFs/exemplos:** hospedar em S3 separado se for >2 MB
- **Vídeos:** nunca commitar — usar YouTube/Vimeo unlisted, ou Loom
- **Datasets:** usar Git LFS ou hospedar fora

O repo deve ficar leve para clones rápidos.
