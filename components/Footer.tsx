import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Sobre</h4>
            <p>RR Engine é um produto da RR Engenharia. Sediada no Rio de Janeiro, a RR opera há 15 anos em obras civis e construiu o Engine para resolver a própria dor de orçamentação.</p>
          </div>
          <div>
            <h4>Contato</h4>
            <p>
              <a href="mailto:contato@rres.com.br">contato@rres.com.br</a><br />
              <a href="https://wa.me/5521995740273" rel="noopener">WhatsApp (21) 99574-0273</a><br />
              <a href="https://www.linkedin.com/company/rresengenharia/" rel="noopener">LinkedIn</a>
            </p>
          </div>
          <div>
            <h4>Tecnologia</h4>
            <p>Pipeline construído sobre Anthropic Claude e Google Gemini. Bases de referência SINAPI/PINI atualizadas mensalmente.</p>
          </div>
          <div>
            <h4>Legal</h4>
            <p>
              <Link href="/privacidade">Política de privacidade</Link><br />
              <Link href="/termos">Termos de uso</Link><br />
              CNPJ 46.887.631/0001-75
            </p>
          </div>
        </div>
        <div className="trust-grid">
          <span className="trust-pill">🇧🇷 Dados em servidor BR</span>
          <span className="trust-pill">⚖️ LGPD compliant</span>
          <span className="trust-pill">🛡️ Auditoria matemática</span>
          <span className="trust-pill">👷 Por engenheiros, para engenheiros</span>
        </div>
        <p className="footer-copy">© {year} RR Engenharia. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
