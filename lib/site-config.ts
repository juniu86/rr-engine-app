export const SITE_URL = "https://engine.rres.com.br";
export const SITE_NAME = "RR Engine";
export const SITE_DESCRIPTION =
  "Pipeline de 10 agentes de IA que transforma seu memorial descritivo em proposta comercial, memória de cálculo XLSX e cronograma físico. Construído pela RR Engenharia.";

export const planos = [
  {
    nome: "Avulso",
    preco: "R$ 89,90",
    unidade: "por orçamento",
    descricao: "Pague conforme usa.",
    features: [
      "1 orçamento individual",
      "Sem limite de tamanho",
      "10 agentes de IA especializados",
      "Integração SINAPI + PINI",
      "Exportação XLSX e PDF",
    ],
    cta: "Começar com 1 orçamento",
    destaque: false,
    publico: "Engenheiro autônomo, validação inicial",
  },
  {
    nome: "Profissional",
    preco: "R$ 450",
    unidade: "por mês",
    descricao: "Para construtoras pequenas.",
    features: [
      "10 orçamentos por mês",
      "Cap de 100 itens / 20k tokens",
      "10 agentes de IA especializados",
      "Integração SINAPI + PINI em tempo real",
      "Suporte por e-mail em 24h",
    ],
    cta: "Assinar Profissional",
    destaque: true,
    badge: "Mais Popular",
    custoOrc: "R$ 45/orçamento",
    publico: "10-30 obras/ano",
  },
  {
    nome: "Empresarial",
    preco: "R$ 990",
    unidade: "por mês",
    descricao: "Para construtoras médias.",
    features: [
      "25 orçamentos por mês",
      "Cap de 300 itens / 50k tokens",
      "10 agentes de IA especializados",
      "Suporte prioritário",
      "Onboarding dedicado",
    ],
    cta: "Falar sobre Empresarial",
    destaque: false,
    custoOrc: "R$ 39,60/orçamento",
    publico: "30-100 obras/ano",
  },
  {
    nome: "White-label",
    preco: "R$ 2.500",
    unidade: "/mês + R$ 30/orçamento",
    descricao: "Para escritórios consultivos.",
    features: [
      "Volume ilimitado",
      "Marca do seu escritório nos PDFs",
      "Configurações personalizadas",
      "Suporte dedicado WhatsApp",
      "Contrato customizado",
    ],
    cta: "Conversar sobre white-label",
    destaque: false,
    publico: "Escritórios de orçamentação",
  },
] as const;

export const passos = [
  {
    num: "01",
    title: "Envie o memorial descritivo",
    desc: "Texto, Markdown ou PDF. O sistema lê, extrai itens e infere especificações pelo padrão de qualidade detectado.",
    tempo: "30 segundos",
  },
  {
    num: "02",
    title: "Pipeline processa com 10 agentes",
    desc: "Engenheiro Técnico, Orçamentista, Logística, Tributário, Comercial, Gestão, Financeiro, Jurídico, Board e Auditor — em sequência.",
    tempo: "5 a 15 minutos",
  },
  {
    num: "03",
    title: "Baixe os documentos prontos",
    desc: "Proposta comercial em PDF, memória de cálculo XLSX, cronograma físico e análise financeira. Tudo cruzado, com auditoria matemática.",
    tempo: "Instantâneo",
  },
] as const;

export const personas = [
  {
    title: "Construtora pequena",
    tag: "10-30 obras/ano",
    problema: "Equipe técnica gasta 20+ horas/semana em orçamentos. Pipeline trava o ciclo de venda.",
    solucao: "Tempo de orçamento cai pra 4 horas/semana. Equipe foca em supervisão de obra.",
    plano: "Profissional",
    icon: "office-small" as const,
  },
  {
    title: "Construtora média",
    tag: "30-100 obras/ano",
    problema: "8-15 propostas em paralelo, parte em obras grandes. Sienge é caro demais para o porte.",
    solucao: "25 orçamentos/mês sem cap apertado. SLA prioritário para obras complexas.",
    plano: "Empresarial",
    icon: "office-medium" as const,
  },
  {
    title: "Engenheiro autônomo",
    tag: "ou escritório consultivo",
    problema: "Cobra por orçamento, não pode ter custo fixo alto. Concorrentes têm assinatura compulsória.",
    solucao: "R$ 89,90 por orçamento — paga só quando vender. Para escritórios, white-label revende com sua marca.",
    plano: "Avulso ou White-label",
    icon: "person" as const,
  },
] as const;

export const features = [
  {
    icon: "users" as const,
    title: "10 Agentes Especialistas",
    desc: "Pipeline sequencial em IA — Engenheiro, Orçamentista, Logística, Tributário, Comercial, Gestão, Financeiro, Jurídico, Board, Auditor.",
    featured: true,
  },
  {
    icon: "doc" as const,
    title: "Memorial Descritivo",
    desc: "Aceita texto, Markdown e PDF. Extrai itens por NBRs aplicáveis, infere specs por padrão de qualidade.",
    featured: false,
  },
  {
    icon: "calc" as const,
    title: "Bases SINAPI + PINI",
    desc: "Atualização mensal, ajuste regional automático por estado, cobertura SP/RJ + restantes.",
    featured: false,
  },
  {
    icon: "shield" as const,
    title: "Auditoria matemática",
    desc: "Validação automática de Preço Final = Custo × (1+BDI). Detecta duplicatas e divergências.",
    featured: false,
  },
  {
    icon: "chart" as const,
    title: "Análise Financeira",
    desc: "Fluxo de caixa, cronograma físico, alertas de capital de giro e margem.",
    featured: false,
  },
  {
    icon: "clock" as const,
    title: "Saída completa",
    desc: "PDF da proposta, XLSX da memória de cálculo, cronograma e análise — tudo cruzado.",
    featured: false,
  },
] as const;

export const agentes = [
  { num: "01", title: "Engenheiro Técnico", desc: "Extrai e especifica itens do memorial", icon: "doc" as const, color: "#3B82F6" },
  { num: "02", title: "Orçamentista", desc: "Precifica com bases SINAPI e PINI", icon: "calc" as const, color: "#10B981" },
  { num: "03", title: "Logística", desc: "Calcula custos indiretos e mobilização", icon: "truck" as const, color: "#F59E0B" },
  { num: "04", title: "Tributário", desc: "Classifica incidência fiscal", icon: "receipt" as const, color: "#A855F7" },
  { num: "05", title: "Comercial", desc: "Aplica BDI e define preço de venda", icon: "dollar" as const, color: "#22C55E" },
  { num: "06", title: "Gestão de Projetos", desc: "Cria cronograma com produtividade", icon: "calendar" as const, color: "#3B82F6" },
  { num: "07", title: "Financeiro", desc: "Analisa fluxo de caixa", icon: "wallet" as const, color: "#10B981" },
  { num: "08", title: "Jurídico", desc: "Redige cláusulas contratuais", icon: "scale" as const, color: "#A855F7" },
  { num: "09", title: "Board", desc: "Aprova e emite parecer final", icon: "users" as const, color: "#EC4899" },
  { num: "10", title: "Auditor", desc: "Valida consistência matemática", icon: "check" as const, color: "#06B6D4" },
] as const;

export const competidores = [
  { feature: "Tempo médio por orçamento", rrEngine: "5–15 min", orcafascio: "4–8 horas", sienge: "2–4 horas (com ERP)", compor: "8–12 horas" },
  { feature: "IA generativa no pipeline", rrEngine: "Sim, 10 agentes", orcafascio: "—", sienge: "—", compor: "—" },
  { feature: "Geração automática de proposta", rrEngine: "Sim, PDF pronto", orcafascio: "—", sienge: "Via template", compor: "Via template" },
  { feature: "Cronograma físico automático", rrEngine: "Sim", orcafascio: "Manual", sienge: "Sim, via Project", compor: "Manual" },
  { feature: "Auditor matemático", rrEngine: "Sim", orcafascio: "—", sienge: "—", compor: "—" },
  { feature: "Pricing inicial", rrEngine: "R$ 89,90", orcafascio: "R$ 89–249/mês", sienge: "R$ 600+/mês", compor: "R$ 1.500 (licença)" },
] as const;

export const faqs = [
  {
    q: "A IA pode errar. Como vocês garantem que a proposta está correta?",
    a: "O último agente do pipeline é um auditor matemático. Ele valida que Preço Final = (Custo Direto + Logística) × (1 + BDI), confere a consistência de todos os documentos, detecta duplicatas, e compara o resultado com um motor determinístico paralelo. Divergência maior que 15% gera alerta. Você vê o relatório de auditoria antes de baixar a proposta.",
  },
  {
    q: "Como vocês mantêm SINAPI e PINI atualizadas?",
    a: "SINAPI é atualizada mensalmente por scraping automatizado da fonte mais ampla disponível, com ajuste regional por estado. PINI/TCPO entra como base interna de referência. Você sempre vê a data de referência da composição usada.",
  },
  {
    q: "Quais formatos de memorial vocês aceitam?",
    a: "Texto puro, Markdown, PDF (extraímos o texto). Memorial bem estruturado dá resultado melhor. Memorial vago aciona perguntas direcionadas pra você completar antes do orçamento sair.",
  },
  {
    q: "E se eu tiver memorial em padrões diferentes — alto, médio, econômico?",
    a: "O Engenheiro Técnico detecta o padrão de qualidade e infere especificações automaticamente: padrão alto = metais Deca Unic, porcelanato 80x80; padrão médio = Deca Vogue, porcelanato 60x60; econômico = Docol básico, cerâmica 30x30. Você sempre pode editar antes de finalizar.",
  },
  {
    q: "Posso editar o orçamento depois de gerado?",
    a: "Sim. Toda saída é XLSX e PDF editável. Você ajusta na sua planilha, na sua proposta. O sistema serve pra fazer 95% do trabalho — os 5% finais são seu toque.",
  },
  {
    q: "Vocês integram com meu ERP (Sienge, Mega, Construtor)?",
    a: "Hoje a saída é XLSX. Integração direta via API entra em backlog conforme demanda — me fale qual ERP que prioriza.",
  },
  {
    q: "Funciona para obras públicas ou licitações?",
    a: "O pipeline tem variante para obra pública: cláusulas de licitação, ART, regime de empreitada por preço unitário. A versão pública precisa de configuração específica — entre em contato pra ativar.",
  },
  {
    q: "Meus dados ficam armazenados onde?",
    a: "Banco de dados em servidor brasileiro (TiDB Cloud), arquivos em S3. Memoriais e propostas são confidenciais — não compartilhamos com terceiros nem usamos para treino de modelo. Política completa em /privacidade.",
  },
] as const;

export const semRR = [
  "3 a 5 dias para montar um orçamento",
  "Consulta manual de tabelas SINAPI",
  "Risco de erros em cálculos complexos",
  "Proposta comercial feita no Word",
] as const;

export const comRR = [
  "Orçamento completo em minutos",
  "Consulta automática SINAPI + PINI",
  "Auditoria matemática automatizada",
  "Proposta e planilha gerados automaticamente",
] as const;
