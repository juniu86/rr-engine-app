import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do RR Engine — RR Engenharia.",
  alternates: { canonical: `${SITE_URL}/termos` },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Termos de Uso",
  description: "Termos de Uso do RR Engine — RR Engenharia.",
  datePublished: "2026-05-04",
  dateModified: "2026-05-04",
  url: `${SITE_URL}/termos`,
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: "RR Engenharia",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
};

export default function Termos() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <LegalLayout title="Termos de Uso" lastUpdated="04/05/2026">
        <p>
          Estes Termos de Uso regulam o acesso e uso do <strong>RR Engine</strong>, plataforma de orçamentação
          automatizada operada pela <strong>RR Engenharia</strong> (CNPJ 46.887.631/0001-75), com sede no Rio de
          Janeiro/RJ. Ao acessar ou utilizar o serviço, você declara estar de acordo com os termos abaixo.
        </p>

        <h2>1. Definições</h2>
        <ul>
          <li>
            <strong>Plataforma:</strong> o sistema RR Engine, acessível via{" "}
            <a href="https://engine.rres.com.br">engine.rres.com.br</a>.
          </li>
          <li>
            <strong>Contratante:</strong> pessoa física ou jurídica que utiliza a Plataforma, podendo ser titular de
            plano avulso, mensal, empresarial ou white-label.
          </li>
          <li>
            <strong>Saídas:</strong> proposta comercial em PDF, memória de cálculo em XLSX, cronograma físico e demais
            artefatos gerados pelo pipeline a partir de memorial descritivo.
          </li>
        </ul>

        <h2>2. Cadastro e conta</h2>
        <p>
          O Contratante é responsável pela veracidade e atualização das informações cadastradas, incluindo
          configurações tributárias e de BDI. Configurações incorretas podem produzir resultados imprecisos — a
          responsabilidade é do Contratante.
        </p>
        <p>
          O Contratante é responsável pela guarda do login e senha. Acessos não autorizados realizados com credenciais
          válidas são presumidos como tendo origem do próprio Contratante.
        </p>

        <h2>3. Planos e cobrança</h2>
        <p>
          A Plataforma oferece planos Avulso, Profissional, Empresarial e White-label, com preços e características
          descritos na página inicial.
        </p>
        <ul>
          <li>
            <strong>Faturamento:</strong> processado mensalmente via Stripe. A primeira cobrança ocorre no momento da
            assinatura.
          </li>
          <li>
            <strong>Cancelamento:</strong> pode ser realizado a qualquer momento. Para o plano Profissional, o
            cancelamento sem multa entra em vigor após o sexto mês de assinatura. Antes disso, há multa proporcional
            ao saldo restante.
          </li>
          <li>
            <strong>Reajuste:</strong> os preços podem ser reajustados anualmente, com aviso de 30 dias.
          </li>
        </ul>

        <h2>4. Limites de uso</h2>
        <p>
          Cada plano possui limites de quantidade de orçamentos por mês e/ou tamanho máximo do memorial. Ultrapassar
          os limites pode resultar em cobrança adicional ou bloqueio temporário, conforme o caso. O Contratante recebe
          aviso quando 80% e 100% da quota são atingidos.
        </p>

        <h2>5. Natureza do serviço e limitações</h2>
        <p>
          A Plataforma utiliza modelos de inteligência artificial generativa para produzir as Saídas. Apesar das
          medidas de validação cruzada (auditor matemático, motor determinístico paralelo, conferência com bases
          SINAPI/PINI), as Saídas podem conter imprecisões.
        </p>
        <p>O Contratante reconhece que:</p>
        <ul>
          <li>
            As Saídas são <strong>auxiliares</strong> e devem ser{" "}
            <strong>revisadas por profissional habilitado</strong> antes de qualquer uso comercial, contratual ou
            técnico.
          </li>
          <li>
            A RR Engenharia não assume responsabilidade por decisões de negócio, contratos firmados ou execuções de
            obra baseados exclusivamente nas Saídas, sem revisão técnica.
          </li>
          <li>
            As bases de preços (SINAPI, PINI/TCPO) são utilizadas como referência interna e podem divergir de tabelas
            oficiais ou de cotações reais de mercado.
          </li>
        </ul>

        <h2>6. Propriedade intelectual</h2>
        <p>
          A Plataforma, seu código, marca e materiais associados são de propriedade exclusiva da RR Engenharia. O uso
          da Plataforma não transfere nenhum direito de propriedade intelectual ao Contratante, exceto a licença
          não-exclusiva e revogável de uso enquanto durar a relação contratual.
        </p>
        <p>
          Os memoriais descritivos enviados pelo Contratante e as Saídas geradas a partir deles são de propriedade do
          Contratante. A RR Engenharia não reivindica direitos sobre o conteúdo desses materiais.
        </p>

        <h2>7. Confidencialidade</h2>
        <p>
          Memoriais e Saídas dos projetos do Contratante são tratados como informação confidencial. Não compartilhamos
          esses materiais com terceiros, exceto:
        </p>
        <ul>
          <li>Provedores de infraestrutura essencial (Anthropic, Google, AWS, TiDB Cloud) durante o processamento e armazenamento.</li>
          <li>Mediante autorização expressa do Contratante.</li>
          <li>Por determinação legal ou judicial.</li>
        </ul>

        <h2>8. White-label</h2>
        <p>
          O plano White-label permite ao Contratante revender o serviço com sua própria marca. Aplica-se contrato
          específico além destes Termos. O Contratante white-label assume responsabilidade pelos seus próprios
          clientes finais.
        </p>

        <h2>9. Indisponibilidade e força maior</h2>
        <p>
          A Plataforma é fornecida &quot;como está&quot;, sem garantia de disponibilidade ininterrupta. Manutenções
          programadas são comunicadas com antecedência. Indisponibilidades não programadas devidas a falhas de
          provedores de infraestrutura ou eventos de força maior não geram direito a indenização, mas podem gerar
          crédito proporcional na assinatura.
        </p>

        <h2>10. Suspensão e rescisão por descumprimento</h2>
        <p>A RR Engenharia pode suspender ou rescindir o acesso do Contratante em caso de:</p>
        <ul>
          <li>Inadimplência por mais de 15 dias.</li>
          <li>Uso da Plataforma para fins ilegais ou que violem direitos de terceiros.</li>
          <li>Tentativa de exploração técnica não autorizada (engenharia reversa, scraping massivo, exploração de vulnerabilidades).</li>
        </ul>

        <h2>11. Limitação de responsabilidade</h2>
        <p>
          A responsabilidade total da RR Engenharia perante o Contratante, em qualquer hipótese, fica limitada ao
          valor pago pelo Contratante nos 12 meses anteriores ao evento gerador da reclamação. Não há responsabilidade
          por danos indiretos, lucros cessantes ou perda de oportunidade.
        </p>

        <h2>12. Alterações destes Termos</h2>
        <p>
          Estes Termos podem ser alterados periodicamente. Mudanças relevantes serão comunicadas por e-mail e/ou na
          própria Plataforma com 30 dias de antecedência. O uso continuado da Plataforma após a vigência da alteração
          implica concordância com a nova versão.
        </p>

        <h2>13. Foro</h2>
        <p>
          Estes Termos são regidos pelas leis brasileiras. Eventuais disputas serão dirimidas no foro da comarca do
          Rio de Janeiro/RJ, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
        </p>
      </LegalLayout>
    </>
  );
}
