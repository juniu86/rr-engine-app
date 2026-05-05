"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  fetchRevisions,
  createRevision,
  type Project,
  type RevisionInfo,
} from "@/lib/api";

interface Props {
  projectId: number;
  initialMemorial: string | null;
}

/**
 * Lista revisões do projeto e permite criar uma nova alterando o memorial.
 *
 * Substitui o AIChatBox do client/ original num MVP — em vez de chat livre,
 * o usuário cria explicitamente uma nova revisão. O backend já tem
 * createProjectRevision (transação atômica), só faltava a UI.
 */
export function ProjectRevisions({ projectId, initialMemorial }: Props) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<RevisionInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editedMemorial, setEditedMemorial] = useState(initialMemorial || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetchRevisions(projectId, token);
      if (res.ok) setInfo(res.data);
    })();
  }, [projectId, getToken]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!editedMemorial.trim()) {
      setError("Memorial não pode ficar vazio");
      return;
    }
    setSubmitting(true);
    setError(null);
    const token = await getToken();
    const res = await createRevision(projectId, editedMemorial, token);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    // Navega pro projeto novo (revisão).
    router.push(`/dashboard/${res.data.newProjectId}`);
  }

  // Sem revisões ainda E não é uma revisão de outro: oferecer criar a primeira.
  // Se já existe parent, mostra histórico.
  const allVersions: Project[] = info
    ? [info.original, ...info.revisions].filter((p): p is Project => !!p)
    : [];

  return (
    <>
      <div className="glass" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.25rem", fontWeight: 700 }}>
              Revisões do projeto
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Edite o memorial e gere uma nova versão preservando o histórico
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
          >
            + Criar revisão
          </button>
        </div>

        {allVersions.length > 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {allVersions.map((v) => {
              const isThis = v.id === projectId;
              return (
                <a
                  key={v.id}
                  href={`/dashboard/${v.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    background: isThis ? "rgba(6, 182, 212, 0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isThis ? "rgba(6, 182, 212, 0.3)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--cyan)",
                      background: "rgba(6, 182, 212, 0.15)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    {v.revisionNumber === 0 || !v.revisionNumber ? "Original" : `REV ${String(v.revisionNumber).padStart(2, "0")}`}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{v.name}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  {isThis && (
                    <span style={{ fontSize: "0.75rem", color: "var(--cyan)", fontWeight: 600 }}>
                      ← você está aqui
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Sem revisões ainda. Use o botão acima pra criar uma nova versão (ex: pra ajustar escopo após ver o orçamento).
          </p>
        )}
      </div>

      {showModal && (
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
          onClick={() => !submitting && setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--cyan)" }}>
              Nova revisão
            </h2>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Edite o memorial. Vai criar um projeto novo (REV) preservando o original. Os 10 agentes vão re-rodar com o memorial editado.
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

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <textarea
                value={editedMemorial}
                onChange={(e) => setEditedMemorial(e.target.value)}
                rows={16}
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  color: "var(--text)",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "vertical",
                }}
              />

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? "Criando revisão..." : "Criar revisão e re-executar agentes"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
