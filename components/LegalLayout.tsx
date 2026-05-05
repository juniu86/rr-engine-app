import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export async function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <article className="legal-article container container-narrow glass">
          <h1>{title}</h1>
          <p className="last-updated">Última atualização: {lastUpdated}</p>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
