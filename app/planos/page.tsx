import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlanosCheckout } from "@/components/PlanosCheckout";
import { SITE_URL } from "@/lib/site-config";
import {
  fetchPlans,
  fetchCurrentSubscription,
  type Plan,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Planos — RR Engine",
  description:
    "Escolha um plano e gere orçamentos automatizados de obras civis com IA.",
  alternates: { canonical: `${SITE_URL}/planos` },
};

export default async function Planos({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string; error?: string }>;
}) {
  const { stripe, error } = await searchParams;
  const { userId, getToken } = await auth();
  const isSignedIn = Boolean(userId);

  const token = isSignedIn ? await getToken() : null;
  const [plansResult, subResult] = await Promise.all([
    fetchPlans(token),
    isSignedIn ? fetchCurrentSubscription(token) : Promise.resolve(null),
  ]);

  const plans: Plan[] = plansResult.ok ? plansResult.data : [];
  const currentSub = subResult && "ok" in subResult && subResult.ok ? subResult.data : null;

  return (
    <>
      <Header showFullNav={true} />
      <main className="legal-main">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 3rem" }}>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, margin: "0 0 1rem" }}>
              Planos do RR Engine
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6 }}>
              Pague pelo que orçar. Comece com Starter, escale conforme o volume da empresa.
              Cancela quando quiser, sem fidelidade.
            </p>
          </div>

          {stripe === "canceled" && (
            <Banner color="orange" message="Checkout cancelado. Você pode tentar de novo a qualquer hora." />
          )}
          {stripe === "success" && (
            <Banner color="green" message="Assinatura ativada. Pode criar projetos em /dashboard." />
          )}
          {error && (
            <Banner color="red" message={`Erro: ${decodeURIComponent(error)}`} />
          )}
          {!plansResult.ok && (
            <Banner
              color="red"
              message={`Não foi possível carregar planos: ${plansResult.error}`}
            />
          )}

          {plans.length > 0 && (
            <PlanosCheckout
              plans={plans}
              isSignedIn={isSignedIn}
              currentSub={currentSub}
            />
          )}

          {!isSignedIn && (
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
                Precisa entrar antes de assinar
              </p>
              <Link href="/sign-in" className="btn btn-outline">
                Entrar ou criar conta
              </Link>
            </div>
          )}

          <div style={{ marginTop: "4rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1rem" }}>
              Dúvidas frequentes
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", textAlign: "left", maxWidth: "960px", margin: "0 auto" }}>
              <Faq
                q="Como funciona o cap por obra?"
                a="Starter cobre obras de até R$ 500 mil. Pro até R$ 5 milhões. Business sem teto. Se o orçamento gerado passar do teu cap, o Auditor aponta — você consegue ver o número, mas o aviso fica claro."
              />
              <Faq
                q="O que é a quota mensal?"
                a="Cada orçamento gerado consome 1 crédito. Starter tem 5/mês, Pro tem 20/mês, Business é ilimitado. Reseta no início de cada ciclo de cobrança."
              />
              <Faq
                q="Posso cancelar?"
                a="A qualquer momento, em /dashboard/settings. O acesso continua até o fim do período já pago."
              />
              <Faq
                q="Aceita Pix?"
                a="Sim. O checkout do Stripe oferece Pix e cartão. Cobrança recorrente exige cartão; pagamento à vista pode ser Pix."
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Banner({ color, message }: { color: "green" | "orange" | "red"; message: string }) {
  const palette = {
    green: { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.3)", text: "var(--green)" },
    orange: { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.3)", text: "var(--orange)" },
    red: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.3)", text: "var(--red)" },
  }[color];
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: "var(--radius-sm)",
        padding: "0.875rem 1.25rem",
        marginBottom: "2rem",
        color: palette.text,
        fontSize: "0.95rem",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="glass" style={{ padding: "1.25rem 1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--cyan)" }}>{q}</h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{a}</p>
    </div>
  );
}
