@AGENTS.md

## Como adicionar nova chamada tRPC

O cliente tRPC é tipado contra o `AppRouter` do backend, importado do
pacote `@juniu86/rr-engine-api-types` (publicado em GitHub Packages a
cada push em `main` do `rr-engine` que toca tipos).

Fluxo end-to-end:

1. **Backend** (`juniu86/rr-engine`): implemente a procedure em
   `server/routers.ts` ou em um sub-router dedicado.
2. **Mergeia** no `main` do backend. O workflow `publish-api-types.yml`
   publica automaticamente `@juniu86/rr-engine-api-types@0.1.<N>`
   (versionamento por contagem de commits que tocaram tipos — monotônico).
3. **Frontend** (`rr-engine-app`): atualiza a versão do pacote:
   ```bash
   pnpm update @juniu86/rr-engine-api-types
   ```
4. **Usa** no código, dentro de `lib/api.ts`:
   ```ts
   import { createTrpcClient } from "@/lib/trpc-client";
   import { safeCall } from "@/lib/trpc-result";

   export async function novaFuncao(input: Input, token: string | null) {
     const trpc = createTrpcClient(token);
     return safeCall(() =>
       trpc.<router>.<procedure>.query(input)
       // ou .mutate(input)
     );
   }
   ```

TypeScript valida o path em compile-time. Typo em `<router>` ou
`<procedure>` vira erro no editor + bloqueia CI.

**NÃO use** strings literais com paths (padrão antigo
`callTrpcQuery("path.to.proc", ...)`) — removido em P3. Helpers
`callTrpcQuery` e `callTrpcMutation` não existem mais.

### Pré-requisito de auth (build local + CI + Vercel)

O pacote é privado em GitHub Packages. Antes de `pnpm install`, é
necessário ter o token configurado:

- **Local**: `~/.npmrc` com `@juniu86:registry=https://npm.pkg.github.com`
  e `//npm.pkg.github.com/:_authToken=${NPM_TOKEN}` (PAT com escopo
  `read:packages`).
- **Vercel**: Environment Variable `NPM_TOKEN` (Production + Preview +
  Development).
- **GitHub Actions**: secret `NPM_TOKEN` no repo (`Settings → Secrets and
  variables → Actions`).

Se o build falhar com `403 Forbidden` no `pnpm install`, o token está
faltando ou expirado.
