"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  fetchCurrentSubscription,
  cancelSubscription,
  getPlanLabel,
  type Subscription,
} from "@/lib/api";

export function BillingSection() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetchCurrentSubscription(token);
      setSub(res.ok ? res.data : null);
      setLoading(false);
    })();
  }, [getToken]);

  async function handleCancel() {
    setCanceling(true);
    setError(null);
    const token = await getToken();
    const res = await cancelSubscription(token);
    setCanceling(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setShowCancelModal(false);
    router.refresh();
    // Recarrega o estado local
    const fresh = await fetchCurrentSubscription(token);
    setSub(fresh.ok ? fresh.data : null);
  }

  return (
    <div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--cyan)" }}>
        Plano e cobrança
      </h2>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</p>
      ) : !sub || !sub.plan ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <p style={{ color: "var(--text)", fontSize: "0.95rem", margin: "0 0 0.75rem" }}>
            Você ainda não tem um plano ativo. Pra criar projetos, escolha um plano.
          </p>
          <Link href="/planos" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            Ver planos →
          </Link>
        </div>
      ) : (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(6, 182, 212, 0.04)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                Plano atual
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--cyan)" }}>
                {getPlanLabel(sub.plan)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Status:{" "}
                <span style={{ color: sub.status === "active" ? "var(--green)" : "var(--orange)" }}>
                  {sub.status}
                </span>
                {sub.cancelAtPeriodEnd && (
                  <span style={{ color: "var(--orange)", marginLeft: "0.5rem" }}>
                    • cancelamento agendado
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                Quota mensal
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)" }}>
                {sub.quotaUsed}
                <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                  {" / "}
                  {sub.quotaLimit ?? "∞"}
                </span>
              </div>
            </div>
          </div>

          {sub.currentPeriodEnd && (
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {sub.cancelAtPeriodEnd ? "Acesso até" : "Próxima cobrança"}:{" "}
              <strong style={{ color: "var(--text)" }}>
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
          )}

          {sub.obraValueCap && (
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Cap por obra: até{" "}
              <strong style={{ color: "var(--text)" }}>
                {sub.obraValueCap.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
            <Link href="/planos" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              Trocar de plano
            </Link>
            {!sub.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "var(--red)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancelar plano
              </button>
            )}
          </div>
        </div>
      )}

      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
          }}
          onClick={() => !canceling && setShowCancelModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              padding: "2rem",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
              Confirma o cancelamento?
            </h2>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Seu acesso continua até <strong>{sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR") : "o fim do período pago"}</strong>. Depois disso, sem renovação. Você pode reativar a qualquer momento criando uma nova assinatura em /planos.
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

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={canceling}
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  background: "var(--red)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  cursor: canceling ? "wait" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                }}
              >
                {canceling ? "Cancelando..." : "Sim, cancelar"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
