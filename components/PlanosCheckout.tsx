"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createCheckout,
  PLAN_LABEL,
  PLAN_TAGLINE,
  type Plan,
  type PlanTier,
  type Subscription,
} from "@/lib/api";

interface Props {
  plans: Plan[];
  isSignedIn: boolean;
  currentSub: Subscription | null;
}

const FEATURES: Record<PlanTier, string[]> = {
  starter: [
    "Até 5 orçamentos por mês",
    "Obras de até R$ 500 mil",
    "Pipeline completo de 10 agentes IA",
    "Proposta PDF + memória XLSX + cronograma",
    "Suporte por e-mail",
  ],
  pro: [
    "Até 20 orçamentos por mês",
    "Obras de até R$ 5 milhões",
    "Pipeline completo de 10 agentes IA",
    "Proposta + memória + cronograma + revisões",
    "Suporte prioritário",
    "Acesso a histórico ilimitado",
  ],
  business: [
    "Orçamentos ilimitados",
    "Sem cap de tamanho de obra",
    "Pipeline completo de 10 agentes IA",
    "Tudo do Pro + relatórios mensais",
    "Suporte dedicado por WhatsApp",
    "Onboarding com a equipe RR",
  ],
};

export function PlanosCheckout({ plans, isSignedIn, currentSub }: Props) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState<PlanTier | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sortedPlans = [...plans].sort((a, b) => {
    const order = { starter: 1, pro: 2, business: 3 };
    return order[a.tier] - order[b.tier];
  });

  async function handleSubscribe(tier: PlanTier) {
    setLoading(tier);
    setErrorMsg(null);
    const token = await getToken();
    const res = await createCheckout(tier, token);
    setLoading(null);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
  }

  return (
    <>
      {errorMsg && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.875rem 1.25rem",
            marginBottom: "1.5rem",
            color: "var(--red)",
            fontSize: "0.9rem",
            textAlign: "center",
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        {sortedPlans.map((plan) => {
          const isCurrent = currentSub?.plan === plan.tier;
          const isHighlighted = plan.tier === "pro";
          return (
            <div
              key={plan.tier}
              className="glass"
              style={{
                padding: "2rem 1.75rem",
                position: "relative",
                border: isHighlighted ? "1px solid var(--cyan)" : undefined,
                boxShadow: isHighlighted ? "0 0 40px rgba(6, 182, 212, 0.2)" : undefined,
              }}
            >
              {isHighlighted && (
                <span
                  style={{
                    position: "absolute",
                    top: "-0.65rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--cyan)",
                    color: "#0a1f44",
                    padding: "0.25rem 0.85rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  Mais escolhido
                </span>
              )}

              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
                {PLAN_LABEL[plan.tier]}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>
                {PLAN_TAGLINE[plan.tier]}
              </p>

              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text)" }}>
                  R$ {plan.priceMonthly.toLocaleString("pt-BR")}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginLeft: "0.4rem" }}>
                  /mês
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.tier)}
                disabled={!isSignedIn || loading !== null || isCurrent}
                className={isHighlighted ? "btn btn-primary" : "btn btn-outline"}
                style={{
                  width: "100%",
                  marginBottom: "1.5rem",
                  opacity: isCurrent ? 0.5 : 1,
                  cursor: !isSignedIn || isCurrent ? "not-allowed" : "pointer",
                }}
              >
                {loading === plan.tier
                  ? "Redirecionando..."
                  : isCurrent
                    ? "Plano atual"
                    : !isSignedIn
                      ? "Entre pra assinar"
                      : "Assinar"}
              </button>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {FEATURES[plan.tier].map((feat, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "var(--cyan)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
