"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  generateProposal,
  generateMemoria,
  generateSchedule,
} from "@/lib/api";

interface Props {
  projectId: number;
}

type DocType = "proposal" | "memoria" | "schedule";

const DOCS: { type: DocType; label: string; description: string }[] = [
  {
    type: "proposal",
    label: "Proposta comercial (PDF)",
    description: "Documento comercial pra cliente",
  },
  {
    type: "memoria",
    label: "Memória de cálculo (XLSX)",
    description: "Planilha com BDI, impostos, fluxo de caixa",
  },
  {
    type: "schedule",
    label: "Cronograma físico (PDF)",
    description: "Curva S e gantt simplificado",
  },
];

export function ProjectDownloads({ projectId }: Props) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState<DocType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(type: DocType) {
    setLoading(type);
    setError(null);
    const token = await getToken();
    const fn =
      type === "proposal"
        ? generateProposal
        : type === "memoria"
          ? generateMemoria
          : generateSchedule;
    const res = await fn(projectId, token);
    setLoading(null);
    if (!res.ok) {
      setError(`${DOCS.find((d) => d.type === type)?.label}: ${res.error}`);
      return;
    }
    if (res.data?.url) {
      window.open(res.data.url, "_blank", "noopener");
    }
  }

  return (
    <div className="glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", fontWeight: 700 }}>
        Documentos do orçamento
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
        Gere e baixe os entregáveis do projeto. Pode regenerar a qualquer momento — sempre usa os dados mais atuais.
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
        {DOCS.map((doc) => (
          <button
            key={doc.type}
            type="button"
            onClick={() => handleGenerate(doc.type)}
            disabled={loading !== null}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              gap: "0.25rem",
              padding: "1rem 1.25rem",
              background: "rgba(22, 82, 240, 0.08)",
              border: "1px solid rgba(22, 82, 240, 0.3)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              cursor: loading !== null ? "wait" : "pointer",
              opacity: loading !== null && loading !== doc.type ? 0.5 : 1,
              transition: "all 0.15s",
              fontFamily: "inherit",
              fontSize: "0.95rem",
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {loading === doc.type ? "Gerando..." : doc.label}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {doc.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
