/**
 * P3 — Wrapper que mantém o contrato `Result<T> = { ok; data } | { ok; error }`
 * usado pelo restante do código. Migra para o cliente tRPC tipado sem
 * cascatear refactor por todos os componentes.
 */
import { TRPCClientError } from "@trpc/client";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Executa uma chamada tRPC e mapeia para Result<T>. Captura erros do
 * cliente (TRPCClientError com `data.code` estruturado) e erros genéricos
 * de rede.
 *
 * Uso:
 *   const result = await safeCall(() => trpc.project.get.query({ id }));
 *   if (!result.ok) return console.error(result.error);
 *   const project = result.data;
 */
export async function safeCall<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err: unknown) {
    if (err instanceof TRPCClientError) {
      // Erro estruturado do tRPC — mensagem e código vem do servidor.
      const code = err.data?.code ? `[${err.data.code}] ` : "";
      return { ok: false, error: `${code}${err.message}` };
    }
    if (err instanceof Error) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Erro desconhecido" };
  }
}
