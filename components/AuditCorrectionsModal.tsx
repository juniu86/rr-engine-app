"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  fetchAgentExecutions,
  applyAuditCorrections,
  getCorrectionDescription,
  getCorrectionImpact,
  getCorrectionReason,
  type AgentExecution,
  type AuditorCorrectionItem,
  type AuditorOutput,
} from "@/lib/api";

interface Props {
  projectId: number;
  initialExecutions: AgentExecution[];
  /** Status do projeto (pra evitar mostrar modal depois de aprovado) */
  projectStatus: string;
}

/**
 * Detecta duplicatas/sobreposições identificadas pelo Auditor e abre um
 * modal pro usuário autorizar a remoção. Aplica via agent.applyAuditCorrections,
 * que remove as linhas, recalcula totais e atualiza o orçamento.
 *
 * Comportamento:
 *  - Polling enquanto pipeline ativo (mesma lógica do MissingInfoModal pós-fix).
 *  - Modal aparece quando: Auditor completed + corrections.budgetItemsToRemove
 *    OU corrections.logisticsToRemove tem itens + projeto não está em "approved".
 *  - User pode aprovar todas ou cancelar (skip dispensa nessa sessão).
 *  - Após aprovar, recarrega a página pra refletir os novos totais.
 */
export function AuditCorrectionsModal({
  projectId,
  initialExecutions,
  projectStatus,
}: Props) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [executions, setExecutions] = useState<AgentExecution[]>(initialExecutions);
  const [skipped, setSkipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling enquanto pipeline ativo, igual MissingInfoModal.
  useEffect(() => {
    const isPipelineActive = executions.some((e) =>
      ["pending", "running", "waiting_for_user_input"].includes(e.status)
    );
    if (!isPipelineActive) return;

    const interval = setInterval(async () => {
      const token = await getToken();
      const res = await fetchAgentExecutions(projectId, token);
      if (res.ok) setExecutions(res.data);
    }, 5000);
    return () => clearInterval(interval);
  }, [executions, projectId, getToken]);

  // Não mostra se: usuário já fechou nessa sessão, projeto já aprovado, ou
  // se há perguntas pendentes do Engenheiro (essas têm prioridade).
  if (skipped) return null;
  if (projectStatus === "approved") return null;
  const hasPendingQuestions = executions.some(
    (e) => e.status === "waiting_for_user_input"
  );
  if (hasPendingQuestions) return null;

  const auditorExec = executions.find(
    (e) => e.agentType === "auditor" && e.status === "completed"
  );
  if (!auditorExec) return null;

  const auditorOutput = auditorExec.output as AuditorOutput | null;
  const corrections = auditorOutput?.corrections;
  if (!corrections) return null;

  const budgetItems = corrections.budgetItemsToRemove || [];
  const logisticsItems = corrections.logisticsToRemove || [];
  const totalItems = budgetItems.length + logisticsItems.length;
  if (totalItems === 0) return null;

  const totalImpact = corrections.totalImpact || 0;

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    const token = await getToken();
    // Backend espera array de descrições (strings). Extrai do formato
    // novo (objeto enriquecido) ou usa direto se for o formato antigo.
    const budgetDescriptions = budgetItems.map(getCorrectionDescription);
    const logisticsDescriptions = logisticsItems.map(getCorrectionDescription);
    const res = await applyAuditCorrections(
      projectId,
      budgetDescriptions,
      logisticsDescriptions,
      token
    );
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
    setSkipped(true);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1rem",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-sm)",
          padding: "2rem",
          maxWidth: "720px",
          width: "100%",
          marginTop: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--orange)" }}>
          {totalItems} duplicidade{totalItems > 1 ? "s" : ""} detectada{totalItems > 1 ? "s" : ""} no orçamento
        </h2>
        <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
          O Auditor identificou itens com escopo sobreposto. Recomenda remover essas linhas pra evitar dupla cobrança.
          {totalImpact > 0 && (
            <>
              {" "}Impacto financeiro estimado:{" "}
              <strong style={{ color: "var(--orange)" }}>
                {totalImpact.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
              .
            </>
          )}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "var(--red)",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {budgetItems.length > 0 && (
          <Section title={`Itens de orçamento (${budgetItems.length})`}>
            {budgetItems.map((item, idx) => (
              <ItemRow key={`b-${idx}`} item={item} />
            ))}
          </Section>
        )}

        {logisticsItems.length > 0 && (
          <Section title={`Itens de logística (${logisticsItems.length})`}>
            {logisticsItems.map((item, idx) => (
              <ItemRow key={`l-${idx}`} item={item} />
            ))}
          </Section>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleApprove}
            disabled={submitting}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: "200px" }}
          >
            {submitting
              ? "Aplicando correções..."
              : `Aprovar remoção (${totalItems} ${totalItems > 1 ? "linhas" : "linha"})`}
          </button>
          <button
            type="button"
            onClick={() => setSkipped(true)}
            disabled={submitting}
            className="btn btn-outline"
          >
            Manter como está
          </button>
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem", marginBottom: 0, lineHeight: 1.5 }}>
          Após aprovar, o orçamento é recalculado automaticamente. As linhas removidas ficam registradas no histórico do projeto pra auditoria.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3
        style={{
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "var(--cyan)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: "0 0 0.6rem",
        }}
      >
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: AuditorCorrectionItem }) {
  // Aceita string (formato legado) ou objeto enriquecido. Helpers cobrem
  // estimatedImpact (atual) e totalCost (intermediário).
  const description = getCorrectionDescription(item);
  const reason = getCorrectionReason(item);
  const estimatedImpact = getCorrectionImpact(item);

  return (
    <div
      style={{
        padding: "0.7rem 0.95rem",
        background: "rgba(245, 158, 11, 0.06)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        borderLeft: "3px solid var(--orange)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.9rem",
        color: "var(--text-secondary)",
        lineHeight: 1.5,
      }}
    >
      <div>{description}</div>
      {(reason || estimatedImpact != null) && (
        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {reason && <span>Motivo: {reason}</span>}
          {estimatedImpact != null && (
            <span>
              Impacto estimado:{" "}
              <strong style={{ color: "var(--orange)" }}>
                {estimatedImpact.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
