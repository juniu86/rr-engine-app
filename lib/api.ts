/**
 * Cliente HTTP minimalista pro backend rr-engine (Express + tRPC) no Railway.
 *
 * Usa fetch nativo + Authorization Bearer com token do Clerk. Sem dependência
 * de @trpc/client por agora — vamos adicionar quando o frontend começar a
 * chamar muitos endpoints (Sprint 4).
 *
 * Variável de ambiente: NEXT_PUBLIC_API_URL (ex: https://api.rres.com.br)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rres.com.br";

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/**
 * Chama uma procedure tRPC via GET (queries) ou POST (mutations).
 *
 * tRPC v11 expõe procedures em /api/trpc/<nome>:
 *  - Query: GET /api/trpc/me?input=<json-encoded>
 *  - Mutation: POST /api/trpc/createX  body: { json: <input> }
 *
 * Aqui só implementamos query simples com input opcional.
 */
async function callTrpcQuery<T>(
  procedure: string,
  input: unknown | undefined,
  token: string | null
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_URL}/api/trpc/${procedure}`);
  if (input !== undefined) {
    url.searchParams.set("input", JSON.stringify(input));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: `Erro de rede: ${(err as Error).message}`,
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
    };
  }

  const body = await res.json().catch(() => null);

  // tRPC envelopa a resposta em { result: { data: <valor> } }.
  // Sem superjson configurado no client, vem o data cru.
  const data = body?.result?.data;
  return { ok: true, data: data as T };
}

/**
 * Healthcheck — pinga /api/health (não é tRPC, é rota direta do Express).
 */
export async function pingHealth(): Promise<{
  ok: boolean;
  status?: string;
  timestamp?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Busca o usuário autenticado pelo backend (procedure tRPC `me`).
 *
 * Quando token é null, o backend retorna null (procedure pública).
 * Quando token é válido, retorna o User do banco (sincronizado com Clerk).
 */
export async function fetchMe(token: string | null) {
  return callTrpcQuery<unknown>("me", undefined, token);
}
