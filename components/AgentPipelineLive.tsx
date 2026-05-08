"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  fetchAgentExecutions,
  executeAllAgents,
  cancelExecution,
  AGENT_LABEL,
  AGENT_STATUS_LABEL,
  AGENT_STATUS_COLOR,
  type AgentExecution,
  type AgentType,
} from "@/lib/api";

const ALL_AGENT_TYPES: AgentType[] = [
  "engenheiro_tecnico",
  "logistica",
  "orcamentista",
  "tributario",
  "comercial",
  "gestao_projetos",
  "financeiro",
  "juridico",
  "board",
  "auditor",
];

const POLL_INTERVAL_MS = 5000;

interface Props {
  projectId: number;
  initialExecutions: AgentExecution[];
}

export function AgentPipelineLive({ projectId, initialExecutions }: Props) {
  const { getToken } = useAuth();
  const [executions, setExecutions] = useState<AgentExecution[]>(initialExecutions);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isStarting, setIsStarting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Polling — só ativa quando há execução em andamento.
  const hasRunning = executions.some((e) => e.status === "running" || e.status === "pending");

  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(async () => {
      const token = await getToken();
      const res = await fetchAgentExecutions(projectId, token);
      if (res.ok) {
        startTransition(() => {
          setExecutions(res.data);
        });
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasRunning, projectId, getToken]);

  async function handleStart() {
    setErrorMsg(null);
    setIsStarting(true);
    const token = await getToken();
    const res = await executeAllAgents(projectId, token);
    setIsStarting(false);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    // Refresh imediato após disparo.
    const fresh = await fetchAgentExecutions(projectId, token);
    if (fresh.ok) setExecutions(fresh.data);
  }

  async function handleCancel() {
    setErrorMsg(null);
    setIsCancelling(true);
    const token = await getToken();
    const res = await cancelExecution(projectId, token);
    setIsCancelling(false);
    setShowCancelModal(false);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    const fresh = await fetchAgentExecutions(projectId, token);
    if (fresh.ok) setExecutions(fresh.data);
    // Recarrega a página pra refletir status do projeto no header (badge).
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  // Map por agentType pra acesso rápido.
  const byType = new Map<AgentType, AgentExecution>();
  for (const e of executions) byType.set(e.agentType, e);

  const allDone = ALL_AGENT_TYPES.every((t) => byType.get(t)?.status === "completed");
  const anyRunning = ALL_AGENT_TYPES.some((t) => byType.get(t)?.status === "running");
  const noneStarted = executions.length === 0 || executions.every((e) => e.status === "pending");

  return (
    <div className="glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>
          Pipeline de agentes
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {anyRunning && (
            <>
              <span style={{ fontSize: "0.85rem", color: "var(--cyan)" }}>
                ● Atualizando a cada 5s
              </span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelModal(true)}
                disabled={isCancelling}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  borderColor: "rgba(239, 68, 68, 0.5)",
                  color: "var(--red)",
                }}
              >
                Interromper
              </button>
            </>
          )}
          {!anyRunning && !allDone && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStart}
              disabled={isStarting || isPending}
              style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
            >
              {isStarting ? "Iniciando..." : noneStarted ? "Executar pipeline" : "Continuar pipeline"}
            </button>
          )}
          {allDone && (
            <span style={{ fontSize: "0.85rem", color: "var(--green)" }}>
              ✓ Pipeline concluído
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
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
          {errorMsg}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {ALL_AGENT_TYPES.map((type, idx) => {
          const exec = byType.get(type);
          const status = exec?.status || "pending";
          const color = AGENT_STATUS_COLOR[status];
          return (
            <div
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${color} 25%, transparent)`,
                  color,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <span style={{ flex: 1, fontWeight: 500 }}>{AGENT_LABEL[type]}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "999px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {AGENT_STATUS_LABEL[status]}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem", marginBottom: 0 }}>
        Cada agente é um modelo de IA especializado. O pipeline pode levar de 2 a 8 minutos dependendo do tamanho do memorial.
      </p>

      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !isCancelling && setShowCancelModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "2rem",
              borderRadius: "var(--radius)",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
              Interromper execução?
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 0.75rem" }}>
              O pipeline será abortado na próxima iteração. Os agentes já concluídos permanecem, mas o orçamento ficará marcado como cancelado.
            </p>
            <p style={{ color: "var(--orange)", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 1.5rem" }}>
              ⚠ A quota mensal não é devolvida — o orçamento já foi contado quando você criou o projeto.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              >
                Voltar
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleCancel}
                disabled={isCancelling}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  background: "var(--red)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {isCancelling ? "Interrompendo..." : "Sim, interromper"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
