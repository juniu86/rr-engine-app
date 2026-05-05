"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  fetchAgentExecutions,
  continueAgent,
  type AgentExecution,
  type MissingInfoRequest,
} from "@/lib/api";

interface Props {
  projectId: number;
  initialExecutions: AgentExecution[];
}

/**
 * Detecta se algum agente está em waiting_for_user_input e mostra modal
 * com as perguntas. Após submit, chama agent.continueAgent e recarrega.
 *
 * Sprint 4.8: hoje só implementa pro Engenheiro Técnico (único que tem
 * fluxo interativo no momento). Generaliza fácil pra outros agentes.
 */
export function MissingInfoModal({ projectId, initialExecutions }: Props) {
  const { getToken } = useAuth();
  const [executions, setExecutions] = useState<AgentExecution[]>(initialExecutions);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Polling leve enquanto aguarda input — pra detectar mudança de status.
  useEffect(() => {
    const waiting = executions.find((e) => e.status === "waiting_for_user_input");
    if (!waiting) return;
    const interval = setInterval(async () => {
      const token = await getToken();
      const res = await fetchAgentExecutions(projectId, token);
      if (res.ok) setExecutions(res.data);
    }, 8000);
    return () => clearInterval(interval);
  }, [executions, projectId, getToken]);

  const waitingExec = executions.find(
    (e) => e.status === "waiting_for_user_input"
  );
  if (!waitingExec) return null;

  const requests: MissingInfoRequest[] = waitingExec.missingInfoRequests || [];
  if (requests.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!waitingExec) return;
    setSubmitting(true);
    setErrorMsg(null);
    const token = await getToken();
    const res = await continueAgent(
      projectId,
      waitingExec.agentType,
      responses,
      token
    );
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    // Recarrega execuções depois do continue (pode ter respondido tudo ou
    // levantado novas perguntas). Page hard-reload é mais simples e garante
    // que o pipeline live no resto da página também atualize.
    window.location.reload();
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
          maxWidth: "640px",
          width: "100%",
          marginTop: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--cyan)" }}>
          O Engenheiro Técnico precisa de mais detalhes
        </h2>
        <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Pra gerar um orçamento confiável, o agente identificou {requests.length} pontos no memorial que não foram detalhados. Responda abaixo e ele continuará a análise.
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {requests.map((req, idx) => (
            <QuestionField
              key={req.fieldId}
              index={idx + 1}
              request={req}
              value={responses[req.fieldId] || ""}
              onChange={(v) =>
                setResponses((prev) => ({ ...prev, [req.fieldId]: v }))
              }
            />
          ))}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? "Enviando..." : "Enviar respostas e continuar"}
            </button>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            Você pode deixar campos em branco se realmente não souber — o agente vai assumir premissa de mercado documentada.
          </p>
        </form>
      </div>
    </div>
  );
}

function QuestionField({
  index,
  request,
  value,
  onChange,
}: {
  index: number;
  request: MissingInfoRequest;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    padding: "0.7rem 0.95rem",
    color: "var(--text)",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "var(--cyan)",
            background: "rgba(6, 182, 212, 0.15)",
            padding: "0.15rem 0.5rem",
            borderRadius: "999px",
            flexShrink: 0,
            marginTop: "0.1rem",
          }}
        >
          {index}
        </span>
        <span style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
          {request.question}
          {request.unit && (
            <span style={{ color: "var(--text-muted)", marginLeft: "0.4rem" }}>
              ({request.unit})
            </span>
          )}
        </span>
      </div>

      {request.fieldType === "select" && request.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">— escolha —</option>
          {request.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={request.fieldType === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={request.context || "Sua resposta"}
          style={inputStyle}
        />
      )}
    </div>
  );
}
