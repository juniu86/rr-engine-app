import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icons";
import {
  agentes,
  competidores,
  faqs,
  features,
  passos,
  personas,
  planos,
  SITE_URL,
} from "@/lib/site-config";

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RR Engine",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Pipeline de 10 agentes de IA que transforma memorial descritivo em proposta comercial, memória de cálculo XLSX e cronograma físico em 15 minutos.",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  publisher: { "@type": "Organization", name: "RR Engenharia", url: "https://rres.com.br" },
  offers: [
    { "@type": "Offer", name: "Avulso", price: "89.90", priceCurrency: "BRL" },
    { "@type": "Offer", name: "Profissional", price: "450.00", priceCurrency: "BRL" },
    { "@type": "Offer", name: "Empresarial", price: "990.00", priceCurrency: "BRL" },
  ],
  inLanguage: "pt-BR",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RR Engenharia",
  alternateName: "RR Engine",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rio de Janeiro",
    addressRegion: "RJ",
    addressCountry: "BR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-21-99574-0273",
    email: "contato@rres.com.br",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
  sameAs: ["https://www.linkedin.com/company/rresengenharia/"],
  taxID: "46.887.631/0001-75",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Header />

      <main>
        <section id="topo" className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <span className="badge">
                  <Icon name="check" width={14} height={14} strokeWidth={2.5} />
                  10 agentes · auditoria matemática
                </span>
                <h1>
                  Orçamento de obra civil em <span className="grad-blue">15 minutos.</span>{" "}
                  <span className="grad-warm">Auditado.</span>
                </h1>
                <p className="lead">
                  Pipeline de IA que transforma seu memorial descritivo em proposta comercial, memória de cálculo XLSX e
                  cronograma físico. Bases SINAPI e PINI atualizadas. Margem auditada antes de você enviar para o cliente.
                </p>
                <div className="cta-row">
                  <Link href="#contato" className="btn btn-primary">
                    Fazer demo com seu memorial <span className="arrow">→</span>
                  </Link>
                  <Link href="#agentes" className="btn btn-secondary">
                    Ver agentes
                  </Link>
                </div>
                <p className="trust-line">
                  <Icon name="shield" width={14} height={14} strokeWidth={2.5} />
                  Construído pela <strong>RR Engenharia</strong> · 15 anos de obras civis no Rio de Janeiro
                </p>
              </div>
              <div className="hero-visual">
                <div className="diagram glass">
                  <div className="diagram-step">
                    <span className="diagram-icon">
                      <Icon name="doc" width="100%" height="100%" />
                    </span>
                    <p className="diagram-label">
                      Memorial
                      <br />
                      descritivo
                    </p>
                  </div>
                  <span className="diagram-arrow">→</span>
                  <div className="diagram-pipeline">
                    <p className="diagram-pipeline-title">Pipeline de 10 agentes</p>
                    <div className="diagram-dots">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className="diagram-dot" />
                      ))}
                    </div>
                    <p className="diagram-pipeline-time">5–15 min</p>
                  </div>
                  <span className="diagram-arrow">→</span>
                  <div className="diagram-step diagram-step-out">
                    <span className="diagram-icon diagram-icon-pdf">
                      <Icon name="doc" width="100%" height="100%" />
                    </span>
                    <span className="diagram-icon diagram-icon-xls">
                      <Icon name="calc" width="100%" height="100%" />
                    </span>
                    <span className="diagram-icon diagram-icon-cal">
                      <Icon name="calendar" width="100%" height="100%" />
                    </span>
                    <p className="diagram-label">
                      Proposta
                      <br />
                      + memória
                      <br />
                      + cronograma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funciona" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Como funciona</span>
              <h2>Em três passos. Auditado em cada etapa.</h2>
            </div>
            <div className="steps-grid">
              {passos.map((p) => (
                <div key={p.num} className="step-card glass">
                  <span className="step-num">{p.num}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <p className="step-time">⏱ {p.tempo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Tudo que entra na proposta. Auditado.</h2>
              <p>Do memorial descritivo aos documentos finais, cada etapa rastreável e validada.</p>
            </div>
            <div className="bento-grid">
              {features.map((f) => (
                <div key={f.title} className={`bento-card glass${f.featured ? " bento-featured" : ""}`}>
                  <span className="bento-icon">
                    <Icon name={f.icon} width="100%" height="100%" />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="agentes" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Pipeline de processamento</span>
              <h2>10 Agentes Especializados</h2>
              <p>
                Cada orçamento passa por uma cadeia sequencial de especialistas em IA, com saída validada antes de avançar
                para o próximo agente.
              </p>
            </div>
            <div className="agents-grid">
              {agentes.map((a) => (
                <div key={a.num} className="agent-card glass">
                  <span className="agent-icon" style={{ color: a.color }}>
                    <Icon name={a.icon} width="100%" height="100%" />
                  </span>
                  <span className="agent-num">{a.num}</span>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Comparativo técnico</span>
              <h2>RR Engine vs alternativas do mercado</h2>
              <p>
                Quando você compara software de orçamentação na construção civil brasileira, esses são os pontos que
                importam.
              </p>
            </div>
            <div className="compare-table-wrap glass">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Critério</th>
                    <th className="us">RR Engine</th>
                    <th>OrçaFascio</th>
                    <th>Sienge eCustos</th>
                    <th>Compor 90</th>
                  </tr>
                </thead>
                <tbody>
                  {competidores.map((row) => (
                    <tr key={row.feature}>
                      <td>
                        <strong>{row.feature}</strong>
                      </td>
                      <td className="us">{row.rrEngine}</td>
                      <td>{row.orcafascio}</td>
                      <td>{row.sienge}</td>
                      <td>{row.compor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-note">
              Tabela construída a partir de pricing público dos concorrentes em maio/2026 e benchmarks de mercado. Dados
              sujeitos a alteração — sempre confira com cada fornecedor antes de decidir.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Para quem</span>
              <h2>Quem ganha mais usando o RR Engine</h2>
            </div>
            <div className="personas-grid">
              {personas.map((p) => (
                <div key={p.title} className="persona-card glass">
                  <div className="persona-head">
                    <span className="persona-icon">
                      <Icon name={p.icon} width="100%" height="100%" />
                    </span>
                    <div>
                      <h3>{p.title}</h3>
                      <span className="persona-tag">{p.tag}</span>
                    </div>
                  </div>
                  <div className="persona-body">
                    <p className="persona-pain">
                      <strong>Dor:</strong> {p.problema}
                    </p>
                    <p className="persona-solution">
                      <strong>Com RR Engine:</strong> {p.solucao}
                    </p>
                  </div>
                  <p className="persona-plan">
                    Plano indicado: <strong>{p.plano}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Planos e preços</span>
              <h2>Escolha o modelo que cabe no seu volume</h2>
              <p>Sem trial confuso. Sem feature gating. Diferença entre planos é volume e tamanho de obra.</p>
            </div>
            <div className="plans-grid">
              {planos.map((plano) => (
                <div key={plano.nome} className={`plan-card glass${plano.destaque ? " plan-destaque" : ""}`}>
                  {plano.destaque && "badge" in plano && <span className="plan-badge">{plano.badge}</span>}
                  <p className="plan-publico">{plano.publico}</p>
                  <h3>{plano.nome}</h3>
                  <p className="plan-tagline">{plano.descricao}</p>
                  <p className="plan-price">
                    <span className="plan-price-value">{plano.preco}</span>
                    <span className="plan-price-unit">{plano.unidade}</span>
                  </p>
                  <ul className="plan-features">
                    {plano.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  {"custoOrc" in plano && plano.custoOrc && (
                    <p className="plan-extra">
                      Custo efetivo: <strong>{plano.custoOrc}</strong>
                    </p>
                  )}
                  <Link href="#contato" className={`btn ${plano.destaque ? "btn-primary" : "btn-outline"}`}>
                    {plano.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="plans-note">
              Faturamento mensal via Stripe. Cancela quando quiser, sem multa após o sexto mês.
            </p>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container container-narrow">
            <div className="section-header">
              <h2>Perguntas frequentes</h2>
            </div>
            {faqs.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contato" className="section-cta">
          <div className="container container-narrow">
            <h2>Pronto para automatizar seus orçamentos?</h2>
            <p>
              Manda um memorial qualquer — pode ser de obra antiga, em PDF mal formatado. Eu rodo na sua frente, em 15
              minutos você vê a saída completa.
            </p>
            <a href="mailto:contato@rres.com.br?subject=Demo%20RR%20Engine" className="btn btn-white">
              Marcar demo (20 min) <span className="arrow">→</span>
            </a>
            <p className="microcopy">Sem cartão. Sem cobrança. Reginaldo Rodrigues responde em até 24h úteis.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
