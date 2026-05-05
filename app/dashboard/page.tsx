import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";
import { pingHealth, fetchMe } from "@/lib/api";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Painel do RR Engine.",
  alternates: { canonical: `${SITE_URL}/dashboard` },
  robots: { index: false, follow: false },
};

export default async function Dashboard() {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  // Sprint 3: bate no backend Railway pra validar conectividade end-to-end.
  // Healthcheck (sem auth) + me (com Bearer token do Clerk).
  const token = await getToken();
  const [health, meResult] = await Promise.all([pingHealth(), fetchMe(token)]);

  const backendOk = health.ok && meResult.ok;

  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <div className="container container-narrow">
          <div className="glass" style={{ padding: "2.5rem 2rem" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
              Bem-vindo{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Você está autenticado. ID interno: <code style={{ color: "var(--cyan)" }}>{userId}</code>
            </p>

            <div
              style={{
                background: backendOk ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
                border: `1px solid ${backendOk ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "1.25rem 1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: backendOk ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                {backendOk ? "Backend conectado" : "Backend offline ou com erro"}
              </h2>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Health: <code style={{ color: "var(--cyan)" }}>{health.ok ? `${health.status} (${health.timestamp})` : `erro: ${health.error}`}</code>
              </p>
              <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Sync user (procedure me): <code style={{ color: "var(--cyan)" }}>
                  {meResult.ok ? (meResult.data ? "ok — user sincronizado no banco" : "ok mas user null") : `erro ${meResult.status}: ${meResult.error}`}
                </code>
              </p>
            </div>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "1.25rem 1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: "var(--orange)", fontWeight: 700 }}>
                Em construção — Sprint 3 do plano de migração
              </h2>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Backend rodando em api.rres.com.br. As funcionalidades do produto (geração de orçamento, dashboard de
                projetos, configurações) estão sendo portadas do tenant Manus em sprints. Estimativa de conclusão: 2-3
                semanas.
              </p>
            </div>

            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", fontWeight: 700 }}>Acessar produto agora</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Enquanto a migração do app não termina, você pode acessar a versão atual diretamente:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              <a href="https://rrengine.manus.space" rel="noopener" className="btn btn-primary">
                Acessar versão atual <span className="arrow">→</span>
              </a>
              <Link href="/" className="btn btn-outline">
                Voltar para a página inicial
              </Link>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Dúvidas ou sugestões? <a href="mailto:contato@rres.com.br" style={{ color: "var(--cyan)" }}>contato@rres.com.br</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
