import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade do RR Engine — RR Engenharia.",
  alternates: { canonical: `${SITE_URL}/privacidade` },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Política de Privacidade",
  description: "Política de Privacidade do RR Engine — RR Engenharia.",
  datePublished: "2026-05-04",
  dateModified: "2026-05-04",
  url: `${SITE_URL}/privacidade`,
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: "RR Engenharia",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
};

export default function Privacidade() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <LegalLayout title="Política de Privacidade" lastUpdated="04/05/2026">
        <p>
          Esta Política de Privacidade descreve como o <strong>RR Engine</strong>, produto da{" "}
          <strong>RR Engenharia</strong> (CNPJ 46.887.631/0001-75), coleta, usa, armazena e protege os dados
          pessoais e de projeto fornecidos por seus usuários, em conformidade com a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Quais dados coletamos</h2>
        <p>Coletamos apenas o necessário para operar o serviço:</p>
        <ul>
          <li>
            <strong>Dados de cadastro:</strong> nome, e-mail, telefone, CNPJ ou CPF da empresa contratante, regime
            tributário e configurações fiscais informadas pelo usuário.
          </li>
          <li>
            <strong>Dados de projeto:</strong> memoriais descritivos enviados pelo usuário, parâmetros de orçamento,
            propostas geradas e arquivos exportados.
          </li>
          <li>
            <strong>Dados de uso:</strong> logs de acesso, telemetria de execução do pipeline (tokens consumidos,
            latência, número de orçamentos gerados) e métricas de performance da plataforma.
          </li>
          <li>
            <strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe Inc., conforme política de
            privacidade do Stripe. Não armazenamos dados de cartão.
          </li>
        </ul>

        <h2>2. Como usamos os dados</h2>
        <p>Utilizamos os dados para:</p>
        <ul>
          <li>Operar o serviço de geração de orçamentos.</li>
          <li>Garantir a precisão fiscal e técnica dos resultados.</li>
          <li>Processar cobranças e enviar comprovantes.</li>
          <li>Comunicar atualizações operacionais relevantes do produto.</li>
          <li>
            Melhorar a qualidade dos modelos e do pipeline com base em métricas agregadas, sem expor dados individuais
            de cliente.
          </li>
        </ul>

        <h2>3. Compartilhamento com terceiros</h2>
        <p>Compartilhamos dados estritamente necessários para operação:</p>
        <ul>
          <li>
            <strong>Anthropic e Google</strong> (provedores de modelos de linguagem) — recebem o conteúdo dos prompts
            (incluindo memoriais) durante a execução do pipeline. Esses provedores possuem políticas próprias de
            retenção e não usam o conteúdo para treino de modelos quando contratados via API empresarial.
          </li>
          <li>
            <strong>Stripe</strong> — processa pagamentos.
          </li>
          <li>
            <strong>AWS S3</strong> — armazenamento dos arquivos exportados (PDF e XLSX).
          </li>
          <li>
            <strong>TiDB Cloud</strong> — banco de dados primário, hospedado em servidores localizados conforme
            escolha de região do contratante.
          </li>
        </ul>
        <p>
          Não vendemos, alugamos ou cedemos dados pessoais ou de projeto a terceiros para fins de marketing.
        </p>

        <h2>4. Retenção</h2>
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa e por mais 12 meses após o cancelamento, para fins de
          auditoria fiscal e regulatória. Após esse prazo, os dados são anonimizados ou descartados, exceto se houver
          obrigação legal de retenção mais longa.
        </p>

        <h2>5. Direitos do titular (LGPD)</h2>
        <p>Você pode, a qualquer momento, solicitar:</p>
        <ul>
          <li>Confirmação da existência de tratamento dos seus dados.</li>
          <li>Acesso aos dados que mantemos.</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Portabilidade dos dados a outro fornecedor.</li>
          <li>Eliminação dos dados tratados com seu consentimento.</li>
          <li>Informação sobre entidades públicas e privadas com as quais compartilhamos seus dados.</li>
          <li>Revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, envie solicitação para{" "}
          <a href="mailto:contato@rres.com.br">contato@rres.com.br</a>. Atenderemos em até 15 dias úteis.
        </p>

        <h2>6. Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado,
          perda ou alteração. Comunicações são criptografadas via TLS. Senhas são armazenadas com hash. Acesso
          administrativo aos sistemas é restrito e auditado.
        </p>
        <p>
          Em caso de incidente de segurança que comprometa dados pessoais, comunicaremos os titulares e a Autoridade
          Nacional de Proteção de Dados (ANPD) nos prazos exigidos pela LGPD.
        </p>

        <h2>7. Cookies e tecnologias de rastreamento</h2>
        <p>
          Utilizamos cookies essenciais para autenticação e estado de sessão. Para análise de uso, empregamos
          ferramentas que coletam dados agregados (sem identificar o usuário individualmente). Você pode desativar
          cookies não essenciais nas configurações do seu navegador.
        </p>

        <h2>8. Alterações desta política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Mudanças relevantes serão comunicadas por e-mail e/ou
          banner no produto, com 30 dias de antecedência sempre que viável.
        </p>

        <h2>9. Encarregado de Dados (DPO)</h2>
        <p>
          Para questões formais relacionadas à LGPD, o encarregado de tratamento de dados pessoais é Reginaldo Carmo
          Rodrigues Jr., contato via <a href="mailto:contato@rres.com.br">contato@rres.com.br</a>.
        </p>

        <h2>10. Foro</h2>
        <p>
          Esta política é regida pelas leis brasileiras. Eventuais disputas serão dirimidas no foro da comarca do Rio
          de Janeiro/RJ, com renúncia a qualquer outro.
        </p>
      </LegalLayout>
    </>
  );
}
