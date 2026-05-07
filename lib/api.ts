/**
 * Cliente tipado pro backend rr-engine (Express + tRPC) no Railway.
 *
 * P3: usa cliente tRPC tipado contra `AppRouter` exportado via
 * `@juniu86/rr-engine-api-types`. Paths validados em compile-time.
 * Typo vira erro de TypeScript, não 404 em runtime.
 *
 * Variável de ambiente: NEXT_PUBLIC_API_URL (ex: https://api.rres.com.br)
 */

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@juniu86/rr-engine-api-types";
import { createTrpcClient } from "./trpc-client";
import { safeCall, type Result } from "./trpc-result";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rres.com.br";

/**
 * Tipos derivados automaticamente do backend via AppRouter.
 * Resolve divergência entre tipo manual no front e shape real do backend.
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;
type RouterInputs = inferRouterInputs<AppRouter>;

// Re-export pra consumidores que importavam Result direto deste módulo.
export type { Result };

/**
 * Mantido pra retrocompatibilidade — alguns consumidores tipam parâmetros
 * como `ApiResponse<T>`. É o mesmo `Result<T>` debaixo dos panos.
 */
export type ApiResponse<T> = Result<T>;

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
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.auth.me.query());
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

/**
 * Derivado do AppRouter do backend via inferRouterOutputs. Qualquer mudança
 * no shape lá reflete aqui automaticamente em compile-time.
 */
export type Project = RouterOutputs["project"]["get"];

export async function fetchProjects(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.list.query());
}

export async function fetchProject(id: number, token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.get.query({ id }));
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
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.create.mutate(input));
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
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.update.mutate(input));
}

export async function deleteProject(id: number, token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.delete.mutate({ id }));
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
  const trpc = createTrpcClient(token);
  return safeCall(() =>
    trpc.agent.applyAuditCorrections.mutate({
      projectId,
      budgetItemsToRemove,
      logisticsToRemove,
    })
  );
}

export type AgentExecution = RouterOutputs["agent"]["getExecutions"][number];

export async function fetchAgentList(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.agent.list.query());
}

export async function fetchAgentExecutions(
  projectId: number,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.agent.getExecutions.query({ projectId }));
}

export async function executeAllAgents(
  projectId: number,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.agent.executeAll.mutate({ projectId }));
}

export async function executeSingleAgent(
  projectId: number,
  agentType: AgentType,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() =>
    trpc.agent.execute.mutate({ projectId, agentType })
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
  const trpc = createTrpcClient(token);
  return safeCall(() =>
    trpc.agent.continueAgent.mutate({
      projectId,
      agentType,
      userResponses,
    })
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

export type CompanySettings = RouterOutputs["settings"]["get"];

export async function fetchSettings(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.settings.get.query());
}

export type UpdateSettingsInput = RouterInputs["settings"]["update"];

export async function updateSettings(
  input: UpdateSettingsInput,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.settings.update.mutate(input));
}

/* ============================================================
 * Project revisions
 * ============================================================ */

export type RevisionInfo = RouterOutputs["project"]["getRevisions"];

export async function fetchRevisions(projectId: number, token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.project.getRevisions.query({ projectId }));
}

export async function createRevision(
  projectId: number,
  newMemorialDescritivo: string,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() =>
    trpc.project.createRevision.mutate({
      projectId,
      newMemorialDescritivo,
    })
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
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.document.list.query({ projectId }));
}

export async function generateProposal(
  projectId: number,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.document.generateProposal.mutate({ projectId }));
}

export async function generateMemoria(
  projectId: number,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.document.generateMemoria.mutate({ projectId }));
}

export async function generateSchedule(
  projectId: number,
  token: string | null
) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.document.generateSchedule.mutate({ projectId }));
}

/* ============================================================
 * Stripe / Subscriptions
 * ============================================================ */

export type PlanTier = "starter" | "pro" | "business";

export type Plan = RouterOutputs["stripe"]["listPlans"][number];

/**
 * Subscription do backend + campos opcionais que a UI usa mas que ainda
 * não estão no contrato da procedure (TODO backend: incluir
 * `cancelAtPeriodEnd` no retorno do `stripe.getCurrentSubscription`).
 */
export type Subscription = NonNullable<
  RouterOutputs["stripe"]["getCurrentSubscription"]
> & {
  cancelAtPeriodEnd?: boolean;
};

/**
 * Tier "amplo" do plan: backend pode retornar tiers fora do PlanTier
 * canônico (ex: "mensal", "avulso", "free"). Usado em UI defensiva.
 */
export type SubscriptionPlanTier = Subscription["plan"];

export async function fetchPlans(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.stripe.listPlans.query());
}

export async function fetchCurrentSubscription(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.stripe.getCurrentSubscription.query());
}

export async function createCheckout(tier: PlanTier, token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.stripe.createCheckout.mutate({ tier }));
}

export async function cancelSubscription(token: string | null) {
  const trpc = createTrpcClient(token);
  return safeCall(() => trpc.stripe.cancelSubscription.mutate());
}

const PLAN_LABEL_BASE: Record<PlanTier, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

/**
 * Mantido como Record só pros 3 tiers comerciais. Componentes devem
 * preferir `getPlanLabel(plan)` que cobre tiers extras do backend
 * (mensal, avulso, free).
 */
export const PLAN_LABEL = PLAN_LABEL_BASE;

/**
 * Resolve label do plano de forma defensiva — backend pode retornar tiers
 * fora do PlanTier canônico (ex: "free", "mensal"). Cai pro nome cru em
 * uppercase quando não há tradução.
 */
export function getPlanLabel(plan: SubscriptionPlanTier | null | undefined): string {
  if (!plan) return "";
  if (plan in PLAN_LABEL_BASE) return PLAN_LABEL_BASE[plan as PlanTier];
  return String(plan).toUpperCase();
}

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
