import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";
import {
  fetchProject,
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

  const result = await fetchProject(id, token);

  if (!result.ok) {
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
                {result.error}
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

  const project = result.data;

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
          </div>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: "var(--orange)", fontWeight: 700 }}>
              Em construção — Sprint 4 do plano de migração
            </h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Pipeline de execução, AIChatBox, downloads e visualização de resultados estão sendo portados. Por enquanto você pode criar projetos via texto, ver na lista e visitar essa página de detalhes. Próximas adições: trigger do pipeline, status em tempo real, downloads PDF/XLSX.
            </p>
          </div>

          {project.memorialDescritivo && (
            <div className="glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
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
