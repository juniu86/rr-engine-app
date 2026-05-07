/**
 * P3 — Cliente tRPC tipado.
 *
 * Substitui `callTrpcQuery`/`callTrpcMutation` que estavam em `lib/api.ts`.
 * Cada path é validado em tempo de compilação contra `AppRouter` exportado
 * do backend via `@juniu86/rr-engine-api-types`. Typo em path = erro
 * TypeScript no editor + CI bloqueia merge.
 *
 * Padrão de uso:
 *   const trpc = createTrpcClient(token);
 *   const project = await trpc.project.get.query({ id: 42 });
 *   const created = await trpc.project.create.mutate({ name: "Obra X" });
 *
 * Wrappers em `lib/api.ts` continuam expondo o contrato `Result<T>` —
 * componentes não precisam saber que o cliente trocou.
 */
import {
  createTRPCProxyClient,
  httpBatchLink,
  loggerLink,
} from "@trpc/client";
import type { AppRouter } from "@juniu86/rr-engine-api-types";
import superjson from "superjson";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.rres.com.br";

export type TrpcClient = ReturnType<typeof createTrpcClient>;

/**
 * Cria cliente tRPC com token Clerk. Como cada chamada precisa do token
 * fresco (Clerk rotaciona), instanciamos por chamada — barato, links são
 * leves. Se virar gargalo, dá pra cachear por token usando WeakMap.
 */
export function createTrpcClient(token: string | null) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: opts =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        headers: () => {
          if (!token) return {};
          return { authorization: `Bearer ${token}` };
        },
      }),
    ],
  });
}
