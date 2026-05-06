import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentPipelineLive } from "@/components/AgentPipelineLive";
import { ProjectDownloads } from "@/components/ProjectDownloads";
import { MissingInfoModal } from "@/components/MissingInfoModal";
import { AuditCorrectionsModal } from "@/components/AuditCorrectionsModal";
import { AuditorReport } from "@/components/AuditorReport";
import { ProjectRevisions } from "@/components/ProjectRevisions";
import type { AuditorOutput } from "@/lib/api";
import { SITE_URL } from "@/lib/site-config";
import {
  fetchProject,
  fetchAgentExecutions,
  STATUS_LABEL,
  STATUS_COLOR,
  CONTRACT_TYPE_LABEL,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Projeto",
  description: "Detalhes do projeto.",
  alternates: { canonical: `${SITE_URL}/dashboard` },
  robots: { index: false, follow: false },
};

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const id = Number(projectId);
  if (!id || Number.isNaN(id)) notFound();

  const { getToken } = await auth();
  const token = await getToken();

  const [projectResult, executionsResult] = await Promise.all([
    fetchProject(id, token),
    fetchAgentExecutions(id, token),
  ]);

  if (!projectResult.ok) {
    return (
      <>
        <Header showFullNav={false} />
        <main className="legal-main">
          <div className="container container-narrow">
            <div className="glass" style={{ padding: "2.5rem 2rem" }}>
              <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                Não foi possível carregar o projeto
              </h1>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                {projectResult.error}
              </p>
              <Link href="/dashboard" className="btn btn-outline">
                Voltar pro Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const project = projectResult.data;
  const executions = executionsResult.ok ? executionsResult.data : [];

  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <div className="container">
          <div style={{ marginBottom: "1.5rem" }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
              ← Dashboard
            </Link>
          </div>

          <div className="glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
                  {project.name}
                </h1>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <span>{CONTRACT_TYPE_LABEL[project.contractType]}</span>
                  {project.location && <span>• {project.location}</span>}
                  <span>• Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: STATUS_COLOR[project.status],
                  background: `color-mix(in srgb, ${STATUS_COLOR[project.status]} 15%, transparent)`,
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {STATUS_LABEL[project.status]}
              </span>
            </div>

            {project.description && (
              <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>
                {project.description}
              </p>
            )}

            {project.totalPrice && (
              <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--border-strong)", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <Stat label="Custo direto" value={project.totalCostDirect} />
                <Stat label="BDI" value={project.totalBdi} />
                <Stat label="Impostos" value={project.totalTaxes} />
                <Stat label="Total" value={project.totalPrice} highlight />
              </div>
            )}
          </div>

          <AgentPipelineLive projectId={id} initialExecutions={executions} />

          <MissingInfoModal projectId={id} initialExecutions={executions} />

          <AuditCorrectionsModal
            projectId={id}
            initialExecutions={executions}
            projectStatus={project.status}
          />

          {(() => {
            const auditorExec = executions.find((e) => e.agentType === "auditor" && e.status === "completed");
            const auditorOutput = auditorExec?.output as AuditorOutput | undefined;
            return auditorOutput ? <AuditorReport output={auditorOutput} /> : null;
          })()}

          {executions.length > 0 && executions.every((e) => e.status === "completed") && (
            <ProjectDownloads projectId={id} />
          )}

          <ProjectRevisions projectId={id} initialMemorial={project.memorialDescritivo} />

          {project.memorialDescritivo && (
            <div className="glass" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", fontWeight: 700 }}>
                Memorial descritivo
              </h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              >
                {project.memorialDescritivo}
              </pre>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  if (!value) return null;
  const formatted = Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{label}</div>
      <div
        style={{
          fontSize: highlight ? "1.25rem" : "1rem",
          fontWeight: highlight ? 700 : 600,
          color: highlight ? "var(--cyan)" : "var(--text)",
        }}
      >
        {formatted}
      </div>
    </div>
  );
}
