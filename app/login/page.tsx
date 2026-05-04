import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o RR Engine.",
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
};

export default function Login() {
  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <article className="legal-article container container-narrow glass" style={{ textAlign: "center" }}>
          <h1>Entrar</h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem" }}>
            A nova autenticação está sendo finalizada como parte da migração para fora do tenant Manus.
          </p>
          <p>
            Enquanto isso, você pode acessar a versão atual do produto no link abaixo. Os dados (orçamentos, projetos,
            configurações) são preservados no banco e estarão disponíveis quando você logar aqui novamente.
          </p>
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <a href="https://rrengine.manus.space" rel="noopener" className="btn btn-primary" style={{ minWidth: "260px" }}>
              Acessar versão atual <span className="arrow">→</span>
            </a>
            <Link href="/" className="btn btn-outline" style={{ minWidth: "260px" }}>
              Voltar para a página inicial
            </Link>
          </div>
          <p className="microcopy" style={{ marginTop: "2rem" }}>
            Tem dúvidas? <a href="mailto:contato@rres.com.br">contato@rres.com.br</a>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
