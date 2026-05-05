import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";
import { fetchProjects, STATUS_LABEL, STATUS_COLOR, CONTRACT_TYPE_LABEL, type Project } from "@/lib/api";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Painel do RR Engine.",
  alternates: { canonical: `${SITE_URL}/dashboard` },
  robots: { index: false, follow: false },
};

export default async function Dashboard() {
  const { getToken } = await auth();
  const user = await currentUser();
  const token = await getToken();

  const result = await fetchProjects(token);
  const projects: Project[] = result.ok ? result.data : [];
  const error = result.ok ? null : result.error;

  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, margin: "0 0 0.25rem" }}>
                Olá{user?.firstName ? `, ${user.firstName}` : ""}
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                {projects.length === 0
                  ? "Nenhum projeto ainda. Comece criando o primeiro."
                  : `${projects.length} projeto${projects.length > 1 ? "s" : ""} no seu painel.`}
              </p>
            </div>
            <Link href="/dashboard/new" className="btn btn-primary">
              + Novo projeto
            </Link>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "1rem 1.25rem",
                marginBottom: "2rem",
                color: "var(--red)",
                fontSize: "0.9rem",
              }}
            >
              Erro ao carregar projetos: <code>{error}</code>
            </div>
          )}

          {!error && projects.length === 0 && <EmptyState />}

          {!error && projects.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div
      className="glass"
      style={{
        padding: "3rem 2rem",
        textAlign: "center",
        marginBottom: "2rem",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
      <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem", fontWeight: 700 }}>
        Comece pelo primeiro orçamento
      </h2>
      <p style={{ color: "var(--text-secondary)", margin: "0 auto 1.5rem", maxWidth: "440px", fontSize: "0.95rem" }}>
        Suba um memorial descritivo (texto ou PDF) e o pipeline de 10 agentes vai gerar a proposta comercial, memória de cálculo e cronograma físico.
      </p>
      <Link href="/dashboard/new" className="btn btn-primary">
        Criar primeiro projeto <span className="arrow">→</span>
      </Link>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_LABEL[project.status];
  const statusColor = STATUS_COLOR[project.status];
  const contractType = CONTRACT_TYPE_LABEL[project.contractType];
  const updatedAt = new Date(project.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/dashboard/${project.id}`}
      className="glass"
      style={{
        display: "block",
        padding: "1.5rem 1.5rem 1.25rem",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s, border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
          {project.name}
        </h3>
        <span
          style={{
            fontSize: "0.75rem",
            color: statusColor,
            background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            whiteSpace: "nowrap",
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      </div>

      {project.description && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            margin: "0 0 1rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <span>{contractType}</span>
        {project.location && <span>• {project.location}</span>}
        <span style={{ marginLeft: "auto" }}>{updatedAt}</span>
      </div>

      {project.totalPrice && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-strong)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total estimado</span>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cyan)" }}>
            {Number(project.totalPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>
      )}
    </Link>
  );
}
