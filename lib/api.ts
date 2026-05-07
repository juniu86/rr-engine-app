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
 * Agent procedures
 * ============================================================ */

export type AgentType =
  | "engenheiro_tecnico"
  | "logistica"
  | "orcamentista"
  | "tributario"
  | "comercial"
  | "gestao_projetos"
  | "financeiro"
  | "juridico"
  | "board"
  | "auditor";

export type AgentStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "waiting_for_user_input"
  | "needs_review";

export type AgentDefinition = {
  type: AgentType;
  order: number;
  name: string;
  description: string;
};

export type AuditorValidation = {
  rule: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  recommendation?: string;
};

/**
 * Item de correção do Auditor.
 * Backend evoluiu de string simples (descrição da linha a remover) pra
 * objeto enriquecido com motivo e impacto. Mantemos os 3 formatos por
 * retrocompatibilidade com projetos antigos:
 *   - string (formato legado)
 *   - { description, totalCost?, reason? } (formato intermediário)
 *   - { description, reason?, estimatedImpact? } (formato atual, PR #24)
 */
export type AuditorCorrectionItem =
  | string
  | {
      description: string;
      reason?: string;
      estimatedImpact?: number;
      /** Alias legado de estimatedImpact. */
      totalCost?: number;
    };

export function getCorrectionDescription(
  item: AuditorCorrectionItem
): string {
  return typeof item === "string" ? item : item.description;
}

export function getCorrectionImpact(
  item: AuditorCorrectionItem
): number | null {
  if (typeof item === "string") return null;
  return item.estimatedImpact ?? item.totalCost ?? null;
}

export function getCorrectionReason(
  item: AuditorCorrectionItem
): string | null {
  if (typeof item === "string") return null;
  return item.reason ?? null;
}

export type AuditorCorrections = {
  budgetItemsToRemove?: AuditorCorrectionItem[];
  logisticsToRemove?: AuditorCorrectionItem[];
  totalImpact?: number;
  correctedDirectCost?: number;
  correctedLogisticsCost?: number;
};

export type AuditorOutput = {
  isValid: boolean;
  validationScore: number;
  criticalErrors: number;
  warnings: number;
  validations: AuditorValidation[];
  auditSeal: "approved" | "approved_with_warnings" | "rejected";
  auditTimestamp: string;
  auditNotes: string;
  corrections?: AuditorCorrections;
  financialSummary?: {
    directCost: number;
    logisticsCost: number;
    baseCost: number;
    bdiAmount: number;
    taxes: number;
    finalPrice: number;
    grossMargin: number;
    grossMarginPercent: number;
    netMargin: number;
    netMarginPercent: number;
  };
};

export async function applyAuditCorrections(
  projectId: number,
  budgetItemsToRemove: string[],
  logisticsToRemove: string[],
  token: string | null
) {
  return callTrpcMutation<{
    success: true;
    budgetRemoved: number;
    logisticsRemoved: number;
    correctedDirectCost: number;
    correctedLogisticsCost: number;
    correctedFinalPrice: number;
  }>(
    "project.applyAuditCorrections",
    { projectId, budgetItemsToRemove, logisticsToRemove },
    token
  );
}

export type AgentExecution = {
  id: number;
  projectId: number;
  agentType: AgentType;
  agentOrder: number;
  status: AgentStatus;
  output: unknown;
  error: string | null;
  tokensUsed: number | null;
  missingInfoRequests: MissingInfoRequest[] | null;
  userResponses: Record<string, string | number> | null;
  iterationCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export async function fetchAgentList(token: string | null) {
  return callTrpcQuery<AgentDefinition[]>("agent.list", undefined, token);
}

export async function fetchAgentExecutions(
  projectId: number,
  token: string | null
) {
  return callTrpcQuery<AgentExecution[]>(
    "agent.getExecutions",
    { projectId },
    token
  );
}

export async function executeAllAgents(
  projectId: number,
  token: string | null
) {
  return callTrpcMutation<unknown>("agent.executeAll", { projectId }, token);
}

export async function executeSingleAgent(
  projectId: number,
  agentType: AgentType,
  token: string | null
) {
  return callTrpcMutation<unknown>(
    "agent.execute",
    { projectId, agentType },
    token
  );
}

/**
 * Continua um agente que está em waiting_for_user_input,
 * passando as respostas do usuário pra completar a análise.
 */
export async function continueAgent(
  projectId: number,
  agentType: AgentType,
  userResponses: Record<string, string | number>,
  token: string | null
) {
  return callTrpcMutation<unknown>(
    "agent.continueAgent",
    { projectId, agentType, userResponses },
    token
  );
}

/* ============================================================
 * Tipos de missing info (perguntas do Engenheiro Técnico)
 * ============================================================ */

export type MissingInfoFieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "boolean";

export type MissingInfoRequest = {
  fieldId: string;
  question: string;
  fieldType?: MissingInfoFieldType;
  options?: string[];
  unit?: string;
  required?: boolean;
  context?: string;
};

/* ============================================================
 * Settings procedures
 * ============================================================ */

export type RegimeTributario =
  | "simples_nacional"
  | "lucro_presumido"
  | "lucro_real";

export type CompanySettings = {
  id: number;
  userId: number;
  companyName: string | null;
  cnpj: string | null;
  priceRegion: string | null;
  taxaLeisSociais: string | null;
  bdiPercentual: string | null;
  lucroPercentual: string | null;
  issPercentual: string | null;
  pisPercentual: string | null;
  cofinsPercentual: string | null;
  irpjPercentual: string | null;
  csllPercentual: string | null;
  adminCentralPercentual: string | null;
  despesasFinanceirasPercentual: string | null;
  riscosPercentual: string | null;
  regimeTributario: RegimeTributario | null;
  faixaSimples: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchSettings(token: string | null) {
  return callTrpcQuery<CompanySettings>("settings.get", undefined, token);
}

export type UpdateSettingsInput = Partial<
  Omit<
    CompanySettings,
    "id" | "userId" | "createdAt" | "updatedAt"
  >
>;

export async function updateSettings(
  input: UpdateSettingsInput,
  token: string | null
) {
  return callTrpcMutation<CompanySettings>("settings.update", input, token);
}

/* ============================================================
 * Project revisions
 * ============================================================ */

export type RevisionInfo = {
  original: Project | null;
  revisions: Project[];
  currentRevisionNumber: number;
};

export async function fetchRevisions(projectId: number, token: string | null) {
  return callTrpcQuery<RevisionInfo>(
    "project.getRevisions",
    { projectId },
    token
  );
}

export async function createRevision(
  projectId: number,
  newMemorialDescritivo: string,
  token: string | null
) {
  return callTrpcMutation<{
    success: true;
    newProjectId: number;
    message: string;
  }>(
    "project.createRevision",
    { projectId, newMemorialDescritivo },
    token
  );
}

/* ============================================================
 * Document procedures (geração e download de PDFs/XLSX)
 * ============================================================ */

export type GeneratedDocument = {
  id: number;
  projectId: number;
  type: "proposal" | "memoria" | "schedule" | string;
  fileUrl: string;
  fileName: string | null;
  createdAt: string;
};

export async function fetchDocuments(projectId: number, token: string | null) {
  return callTrpcQuery<GeneratedDocument[]>(
    "document.list",
    { projectId },
    token
  );
}

export async function generateProposal(
  projectId: number,
  token: string | null
) {
  return callTrpcMutation<{ url: string; key?: string }>(
    "document.generateProposal",
    { projectId },
    token
  );
}

export async function generateMemoria(
  projectId: number,
  token: string | null
) {
  return callTrpcMutation<{ url: string; key?: string }>(
    "document.generateMemoria",
    { projectId },
    token
  );
}

export async function generateSchedule(
  projectId: number,
  token: string | null
) {
  return callTrpcMutation<{ url: string; key?: string }>(
    "document.generateSchedule",
    { projectId },
    token
  );
}

/* ============================================================
 * Stripe / Subscriptions
 * ============================================================ */

export type PlanTier = "starter" | "pro" | "business";

export type Plan = {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  currency: "BRL";
  quota: number | null;
  cap: number | null;
  priceId: string;
};

export type Subscription = {
  plan: PlanTier | null;
  status: string;
  currentPeriodEnd: string | null;
  quotaUsed: number;
  quotaLimit: number | null;
  obraValueCap: number | null;
  cancelAtPeriodEnd?: boolean;
};

export async function fetchPlans(token: string | null) {
  return callTrpcQuery<Plan[]>("stripe.listPlans", undefined, token);
}

export async function fetchCurrentSubscription(token: string | null) {
  return callTrpcQuery<Subscription | null>(
    "stripe.getCurrentSubscription",
    undefined,
    token
  );
}

export async function createCheckout(tier: PlanTier, token: string | null) {
  return callTrpcMutation<{ sessionId: string; url: string }>(
    "stripe.createCheckout",
    { tier },
    token
  );
}

export async function cancelSubscription(token: string | null) {
  return callTrpcMutation<{ success: true; cancelAt: string }>(
    "stripe.cancelSubscription",
    undefined,
    token
  );
}

export const PLAN_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

export const PLAN_TAGLINE: Record<PlanTier, string> = {
  starter: "Pra quem está começando",
  pro: "Volume mensal previsível",
  business: "Operação sem teto",
};

/* ============================================================
 * Helpers — labels de agentes
 * ============================================================ */

export const AGENT_LABEL: Record<AgentType, string> = {
  engenheiro_tecnico: "Engenheiro Técnico",
  logistica: "Logística",
  orcamentista: "Orçamentista",
  tributario: "Tributário",
  comercial: "Comercial",
  gestao_projetos: "Gestão de Projetos",
  financeiro: "Financeiro",
  juridico: "Jurídico",
  board: "Board",
  auditor: "Auditor",
};

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  pending: "Aguardando",
  running: "Em execução",
  completed: "Concluído",
  failed: "Falhou",
  skipped: "Pulado",
  waiting_for_user_input: "Aguardando dados",
  needs_review: "Precisa revisão",
};

export const AGENT_STATUS_COLOR: Record<AgentStatus, string> = {
  pending: "var(--text-muted)",
  running: "var(--cyan)",
  completed: "var(--green)",
  failed: "var(--red)",
  skipped: "var(--text-muted)",
  waiting_for_user_input: "var(--orange)",
  needs_review: "var(--orange)",
};

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
