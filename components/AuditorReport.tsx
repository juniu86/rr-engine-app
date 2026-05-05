import type { AuditorOutput, AuditorValidation } from "@/lib/api";

interface Props {
  output: AuditorOutput | null | undefined;
}

const SEAL_INFO: Record<
  AuditorOutput["auditSeal"],
  { label: string; color: string; bg: string }
> = {
  approved: {
    label: "Aprovado",
    color: "var(--green)",
    bg: "rgba(16, 185, 129, 0.08)",
  },
  approved_with_warnings: {
    label: "Aprovado com ressalvas",
    color: "var(--orange)",
    bg: "rgba(245, 158, 11, 0.08)",
  },
  rejected: {
    label: "Rejeitado pelo Auditor",
    color: "var(--red)",
    bg: "rgba(239, 68, 68, 0.08)",
  },
};

const SEVERITY_INFO: Record<
  AuditorValidation["severity"],
  { label: string; color: string; icon: string }
> = {
  critical: { label: "Crítico", color: "var(--red)", icon: "✕" },
  warning: { label: "Atenção", color: "var(--orange)", icon: "▲" },
  info: { label: "Info", color: "var(--cyan)", icon: "ⓘ" },
};

export function AuditorReport({ output }: Props) {
  if (!output || !output.auditSeal) return null;

  const seal = SEAL_INFO[output.auditSeal];
  const failed = (output.validations || []).filter((v) => !v.passed);
  const grouped = {
    critical: failed.filter((v) => v.severity === "critical"),
    warning: failed.filter((v) => v.severity === "warning"),
    info: failed.filter((v) => v.severity === "info"),
  };

  return (
    <div
      className="glass"
      style={{
        padding: "2rem",
        marginBottom: "1.5rem",
        borderColor: seal.color,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.25rem", fontWeight: 700 }}>
            Auditoria de consistência
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            Validação cruzada entre todos os agentes do pipeline
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: seal.bg,
            border: `1px solid ${seal.color}`,
            borderRadius: "var(--radius-sm)",
            padding: "0.5rem 1rem",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Score</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: seal.color }}>
            {output.validationScore}
          </span>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: seal.color,
              paddingLeft: "0.75rem",
              borderLeft: `1px solid ${seal.color}`,
            }}
          >
            {seal.label}
          </span>
        </div>
      </div>

      {output.auditNotes && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            margin: "0 0 1.25rem",
            padding: "0.75rem 1rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderLeft: `3px solid ${seal.color}`,
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          }}
        >
          {output.auditNotes}
        </p>
      )}

      {failed.length === 0 ? (
        <p
          style={{
            color: "var(--green)",
            fontSize: "0.95rem",
            margin: 0,
            padding: "1rem",
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "var(--radius-sm)",
            textAlign: "center",
          }}
        >
          Todas as {(output.validations || []).length} validações passaram sem ressalvas.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            <span>
              Total: <strong style={{ color: "var(--text)" }}>{(output.validations || []).length}</strong>
            </span>
            {grouped.critical.length > 0 && (
              <span>
                Críticos: <strong style={{ color: "var(--red)" }}>{grouped.critical.length}</strong>
              </span>
            )}
            {grouped.warning.length > 0 && (
              <span>
                Atenção: <strong style={{ color: "var(--orange)" }}>{grouped.warning.length}</strong>
              </span>
            )}
            {grouped.info.length > 0 && (
              <span>
                Info: <strong style={{ color: "var(--cyan)" }}>{grouped.info.length}</strong>
              </span>
            )}
          </div>

          {(["critical", "warning", "info"] as const).flatMap((severity) =>
            grouped[severity].map((v, idx) => (
              <ValidationItem key={`${severity}-${idx}`} validation={v} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ValidationItem({ validation }: { validation: AuditorValidation }) {
  const sev = SEVERITY_INFO[validation.severity];
  return (
    <div
      style={{
        padding: "0.875rem 1rem",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderLeft: `3px solid ${sev.color}`,
        borderRadius: "var(--radius-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <span style={{ color: sev.color, fontSize: "0.9rem", fontWeight: 700 }}>
          {sev.icon}
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: sev.color, textTransform: "uppercase" }}>
          {sev.label}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
          {validation.rule}
        </span>
      </div>
      <p style={{ fontSize: "0.95rem", margin: "0 0 0.4rem", color: "var(--text)" }}>
        {validation.description}
      </p>
      {(validation.expected || validation.actual) && (
        <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: validation.recommendation ? "0.4rem" : 0 }}>
          {validation.expected && (
            <span>
              Esperado: <code style={{ color: "var(--cyan)" }}>{validation.expected}</code>
            </span>
          )}
          {validation.actual && (
            <span>
              Encontrado: <code style={{ color: "var(--orange)" }}>{validation.actual}</code>
            </span>
          )}
        </div>
      )}
      {validation.recommendation && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, fontStyle: "italic" }}>
          → {validation.recommendation}
        </p>
      )}
    </div>
  );
}
