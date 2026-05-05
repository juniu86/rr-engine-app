/**
 * Cliente HTTP minimalista pro backend rr-engine (Express + tRPC) no Railway.
 *
 * Usa fetch nativo + Authorization Bearer com token do Clerk. Sem dependência
 * de @trpc/client por agora — vamos adicionar quando o frontend começar a
 * chamar muitos endpoints (avaliação Sprint 5).
 *
 * Variável de ambiente: NEXT_PUBLIC_API_URL (ex: https://api.rres.com.br)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rres.com.br";

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/* ============================================================
 * Core helpers — query (GET) e mutation (POST) tRPC v11
 * ============================================================ */

/**
 * Backend usa superjson como transformer. Inputs precisam estar envelopados
 * em `{ json: <value> }` tanto em GET (querystring) quanto POST (body).
 * Outputs também vem envelopados — desempacotamos `data.json ?? data`.
 */

async function callTrpcQuery<T>(
  procedure: string,
  input: unknown | undefined,
  token: string | null
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_URL}/api/trpc/${procedure}`);
  // tRPC superjson: envelopa input em { json: <value> }, mesmo quando undefined.
  url.searchParams.set("input", JSON.stringify({ json: input ?? null }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;

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
      error: parseTrpcError(text) || `HTTP ${res.status}`,
    };
  }

  const body = await res.json().catch(() => null);
  const data = unwrapTrpcData(body);
  return { ok: true, data: data as T };
}

async function callTrpcMutation<T>(
  procedure: string,
  input: unknown,
  token: string | null
): Promise<ApiResponse<T>> {
  const url = `${API_URL}/api/trpc/${procedure}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      // tRPC superjson exige body envelopado em { json: <value> }.
      body: JSON.stringify({ json: input }),
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
      error: parseTrpcError(text) || `HTTP ${res.status}`,
    };
  }

  const body = await res.json().catch(() => null);
  const data = unwrapTrpcData(body);
  return { ok: true, data: data as T };
}

/**
 * Resposta tRPC superjson: { result: { data: { json: <T>, meta?: ... } } }
 * Se sem superjson server-side: { result: { data: <T> } }
 * Aceitamos os dois formatos.
 */
function unwrapTrpcData(body: unknown): unknown {
  const data = (body as { result?: { data?: unknown } } | null)?.result?.data;
  if (data && typeof data === "object" && "json" in data) {
    return (data as { json: unknown }).json;
  }
  return data;
}

function parseTrpcError(text: string): string | null {
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.json?.message || null;
  } catch {
    return null;
  }
}

/* ============================================================
 * Healthcheck — não-tRPC, rota direta
 * ============================================================ */

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

/* ============================================================
 * Auth procedures
 * ============================================================ */

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: string;
  lastSignedIn: string;
};

export async function fetchMe(token: string | null) {
  return callTrpcQuery<User | null>("auth.me", undefined, token);
}

/* ============================================================
 * Project procedures
 * ============================================================ */

export type ProjectStatus =
  | "draft"
  | "processing"
  | "review"
  | "approved"
  | "rejected"
  | "blocked"
  | "pending_confirmation"
  | "waiting_for_input";

export type ContractType = "manutencao" | "obra";

export type Project = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  contractType: ContractType;
  location: string | null;
  restrictions: string | null;
  memorialDescritivo: string | null;
  memorialFileUrl: string | null;
  status: ProjectStatus;
  blockReason: string | null;
  warningMessages: string | null;
  currentAgentId: number | null;
  totalCostDirect: string | null;
  totalCostIndirect: string | null;
  totalTaxes: string | null;
  totalBdi: string | null;
  totalPrice: string | null;
  estimatedDuration: number | null;
  parentProjectId: number | null;
  revisionNumber: number | null;
  originalName: string | null;
  bdiPercentual: string | null;
  bdiPreset: "padrao" | "reduzido" | "majorado" | "personalizado" | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchProjects(token: string | null) {
  return callTrpcQuery<Project[]>("project.list", undefined, token);
}

export async function fetchProject(id: number, token: string | null) {
  return callTrpcQuery<Project>("project.get", { id }, token);
}

export type CreateProjectInput = {
  name: string;
  description?: string;
  contractType?: ContractType;
  location?: string;
  restrictions?: string;
  memorialDescritivo?: string;
};

export async function createProject(
  input: CreateProjectInput,
  token: string | null
) {
  return callTrpcMutation<{ projectId: number }>(
    "project.create",
    input,
    token
  );
}

export type UpdateProjectInput = {
  id: number;
  name?: string;
  description?: string;
  contractType?: ContractType;
  location?: string;
  restrictions?: string;
  memorialDescritivo?: string;
};

export async function updateProject(
  input: UpdateProjectInput,
  token: string | null
) {
  return callTrpcMutation<{ success: true }>("project.update", input, token);
}

export async function deleteProject(id: number, token: string | null) {
  return callTrpcMutation<{ success: true }>(
    "project.delete",
    { id },
    token
  );
}

/* ============================================================
 * Agent execution procedures (subset — pra Sprint 4 e 5)
 * ============================================================ */

export async function fetchAgentExecutions(
  projectId: number,
  token: string | null
) {
  return callTrpcQuery<unknown[]>(
    "agent.getExecutions",
    { projectId },
    token
  );
}

/* ============================================================
 * Helpers de UI — labels e cores por status
 * ============================================================ */

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  processing: "Processando",
  review: "Em revisão",
  approved: "Aprovado",
  rejected: "Rejeitado",
  blocked: "Bloqueado",
  pending_confirmation: "Aguardando confirmação",
  waiting_for_input: "Aguardando dados",
};

export const STATUS_COLOR: Record<ProjectStatus, string> = {
  draft: "var(--text-muted)",
  processing: "var(--cyan)",
  review: "var(--orange)",
  approved: "var(--green)",
  rejected: "var(--red)",
  blocked: "var(--red)",
  pending_confirmation: "var(--orange)",
  waiting_for_input: "var(--orange)",
};

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  obra: "Obra completa",
  manutencao: "Manutenção",
};
