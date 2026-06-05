export const ADMIN_EMAIL = "melkzedd@gmail.com";

export type SubscriptionKey = "starter" | "growth" | "scale";

export type SubscriptionPlan = {
  key: SubscriptionKey;
  name: string;
  signal: string;
  idealFor: string;
  coverage: string[];
  accent: string;
};

export type QuoteQuestion = {
  id: string;
  label: string;
  prompt: string;
  helper: string;
  type: "text" | "number" | "single" | "multi";
  placeholder?: string;
  options?: string[];
};

export type ClientProfile = {
  fullName: string;
  email: string;
  companyName: string;
  taxId: string;
  phone: string;
  segment: string;
  storeName: string;
};

export type QuoteAnswers = Record<string, string | string[]>;

export type QuotePlanSuggestion = {
  key: SubscriptionKey;
  name: string;
  reason: string;
  idealFor: string;
};

export type QuoteRequestRow = {
  id: string;
  user_id: string;
  plan_key: SubscriptionKey;
  profile_snapshot: ClientProfile;
  answers: QuoteAnswers;
  status: string;
  admin_email: string;
  email_status: string;
  quote_value?: string | null;
  admin_response?: string | null;
  quote_response_email_status?: string | null;
  quote_responded_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type ProfileRow = {
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  tax_id: string | null;
  phone: string | null;
  segment: string | null;
  store_name: string | null;
};

export type AdminProfileRow = ProfileRow & {
  id: string;
  created_at: string;
  updated_at: string;
};

export type ClientSubscriptionRow = {
  id: string;
  user_id: string;
  plan_key: SubscriptionKey;
  status: string;
  profile_snapshot: ClientProfile;
  source_request_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_reply: string;
  profile_snapshot: ClientProfile;
  created_at: string;
  updated_at: string;
};

export type ClientReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  status: string;
  profile_snapshot: ClientProfile;
  created_at: string;
  updated_at: string;
};

export const emptyProfile: ClientProfile = {
  fullName: "",
  email: "",
  companyName: "",
  taxId: "",
  phone: "",
  segment: "",
  storeName: ""
};

export const demoProfile: ClientProfile = {
  fullName: "Cliente Demo",
  email: "cliente@demo.local",
  companyName: "Empresa em avaliação",
  taxId: "",
  phone: "",
  segment: "",
  storeName: ""
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    key: "starter",
    name: "Loja Essencial",
    signal: "Começo",
    idealFor: "Para quem quer começar a vender online com uma loja organizada.",
    coverage: [
      "Cadastro de produtos",
      "Carrinho e pedidos",
      "Painel para gerenciar a loja",
      "Base para aparecer no Google",
      "Apoio para colocar no ar",
      "Layout responsivo",
      "Página inicial da loja",
      "Formulário de contato"
    ],
    accent: "#0f766e"
  },
  {
    key: "growth",
    name: "Loja Profissional",
    signal: "Crescimento",
    idealFor: "Para quem já quer vender melhor, acompanhar estoque e fazer campanhas.",
    coverage: [
      "Tudo da Loja Essencial",
      "Cupons e campanhas",
      "Avisos de estoque",
      "Opções de frete",
      "Relatório de vendas",
      "Organização de clientes",
      "Produtos em destaque",
      "Melhorias para conversão",
      "Suporte para campanhas"
    ],
    accent: "#0284c7"
  },
  {
    key: "scale",
    name: "Loja Completa",
    signal: "Escala",
    idealFor: "Para lojas com equipe, muitos pedidos e necessidade de mais controle.",
    coverage: [
      "Tudo da Loja Profissional",
      "Acesso para equipe",
      "Automações de atendimento",
      "Integrações avançadas",
      "Prioridade no suporte",
      "Controle mais completo de pedidos",
      "Relatórios de desempenho",
      "Base para várias rotinas da loja",
      "Preparação para alto volume"
    ],
    accent: "#db2777"
  }
];

export const quoteQuestions: QuoteQuestion[] = [
  {
    id: "business_model",
    label: "Oferta",
    prompt: "O que voce vende ou quer vender?",
    helper: "Responda em uma frase: produto, servico ou categoria principal.",
    type: "text",
    placeholder: "Ex.: roupas femininas, suplementos, doces, cursos..."
  },
  {
    id: "current_stage",
    label: "Momento",
    prompt: "Qual e o momento atual da sua venda?",
    helper: "Escolha a opcao mais proxima da realidade de hoje.",
    type: "single",
    options: [
      "Ainda nao vendo online",
      "Vendo por WhatsApp ou Instagram",
      "Ja tenho loja ou site",
      "Tenho operacao com equipe"
    ]
  },
  {
    id: "catalog_size",
    label: "Catalogo",
    prompt: "Quantos produtos entram no catalogo inicial?",
    helper: "Pode ser uma estimativa. Isso ajuda a montar uma loja do tamanho certo.",
    type: "number",
    placeholder: "Ex.: 40"
  },
  {
    id: "must_have_features",
    label: "Recursos",
    prompt: "Quais recursos sao obrigatorios para comecar?",
    helper: "Marque apenas o que voce realmente precisa no inicio.",
    type: "multi",
    options: [
      "Pagamento online",
      "Controle de estoque",
      "Calculo de frete",
      "Cupons e campanhas",
      "Botao de WhatsApp",
      "Conteudo para Google",
      "Area do cliente"
    ]
  },
  {
    id: "integrations_need",
    label: "Integracoes",
    prompt: "Precisa conectar a loja com algum sistema?",
    helper: "Marque o que ja faz parte da sua operacao ou do seu plano.",
    type: "multi",
    options: [
      "Nenhuma agora",
      "ERP ou sistema de gestao",
      "Marketplace",
      "CRM ou automacao",
      "API ou webhooks",
      "Gateway de pagamento especifico",
      "Transportadora especifica"
    ]
  },
  {
    id: "launch_window",
    label: "Prazo",
    prompt: "Quando voce quer colocar a loja no ar?",
    helper: "Isso ajuda a organizar o que entra agora e o que pode ficar para depois.",
    type: "single",
    options: ["Ate 15 dias", "30 dias", "60 dias", "Sem pressa definida"]
  },
  {
    id: "operation_level",
    label: "Operacao",
    prompt: "Como sera a rotina da loja depois do lancamento?",
    helper: "Escolha o nivel de operacao esperado para os proximos meses.",
    type: "single",
    options: [
      "Comecar e testar as primeiras vendas",
      "Vender toda semana com campanhas",
      "Trabalhar com equipe e muitos pedidos"
    ]
  },
  {
    id: "main_priority",
    label: "Prioridade",
    prompt: "Qual e a prioridade principal do projeto?",
    helper: "Essa resposta define o plano mais coerente para sua necessidade.",
    type: "single",
    options: [
      "Colocar a loja no ar rapido",
      "Vender mais com campanhas",
      "Organizar estoque e pedidos",
      "Automatizar processos",
      "Escalar com equipe"
    ]
  }
];

export const quoteAnswerLabels = quoteQuestions.reduce<Record<string, string>>((labels, question) => {
  labels[question.id] = question.label;
  return labels;
}, {
  ai_answered_questions: "Perguntas respondidas",
  ai_plan_reason: "Motivo da indicacao do plano",
  ai_recommended_plan: "Plano indicado pela IA",
  ai_requirement_summary: "Resumo da conversa pela IA",
  reference_links: "Links de referencia",
  service_note: "Observacao do cliente"
});

export function getQuoteAnswerLabel(key: string) {
  return quoteAnswerLabels[key] || key;
}

export const requestPipeline = [
  "Novo",
  "Perfil revisado",
  "Plano escolhido",
  "Proposta enviada",
  "Cliente ativo"
];

export const supportStatusLabels: Record<string, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Fechado"
};

export const subscriptionStatusLabels: Record<string, string> = {
  requested: "Solicitada",
  active: "Ativa",
  paused: "Pausada",
  canceled: "Cancelada"
};

export function getAnswerText(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Não informado";
  }

  return value?.trim() || "Não informado";
}

function normalizeModerationText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getModerationIssue(value: string) {
  const normalized = normalizeModerationText(value);
  const profanityTerms = [
    "arrombado",
    "bosta",
    "caralho",
    "desgraca",
    "foda",
    "fdp",
    "merda",
    "otario",
    "porra",
    "puta",
    "vagabundo"
  ];
  const abuseOrCrimeTerms = [
    "ameacar",
    "assassinar",
    "chantagem",
    "crime",
    "estelionato",
    "extorsao",
    "fraude",
    "golpe",
    "hackear",
    "lavar dinheiro",
    "matar",
    "ofensa",
    "racismo",
    "roubar",
    "sequestro",
    "terrorismo",
    "vazar dados",
    "violencia"
  ];

  if (profanityTerms.some((term) => new RegExp(`(^|\\W)${term}(\\W|$)`, "i").test(normalized))) {
    return "Evite xingamentos ou palavras de baixo calão para continuar a conversa.";
  }

  if (abuseOrCrimeTerms.some((term) => normalized.includes(term))) {
    return "Não posso avançar com respostas que envolvam crime, ameaça, ofensa ou violência.";
  }

  return "";
}

export function validateQuoteAnswer(question: QuoteQuestion, value: string | string[] | undefined) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return {
      isValid: false,
      message: "Responda a pergunta atual para continuar."
    };
  }

  const values = Array.isArray(value) ? value : [value];
  const moderationIssue = values
    .map((item) => getModerationIssue(item))
    .find(Boolean);

  if (moderationIssue) {
    return {
      isValid: false,
      message: moderationIssue
    };
  }

  if (question.type === "number") {
    const numericValue = Number(values[0]);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return {
        isValid: false,
        message: "Informe uma quantidade válida maior que zero."
      };
    }
  }

  if (question.type === "text") {
    const text = values[0].trim();
    const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;

    if (text.length < 3 || letterCount < 2) {
      return {
        isValid: false,
        message: "Escreva uma resposta um pouco mais clara para o Zezé entender."
      };
    }
  }

  if ((question.type === "single" || question.type === "multi") && question.options) {
    const invalidOption = values.find((item) => !question.options?.includes(item));

    if (invalidOption) {
      return {
        isValid: false,
        message: "Escolha uma das opções disponíveis para continuar."
      };
    }
  }

  return {
    isValid: true,
    message: ""
  };
}

export function getServiceNote(answers: QuoteAnswers) {
  const note = answers.service_note;
  return typeof note === "string" ? note.trim() : "";
}

export function getReferenceLinks(answers: QuoteAnswers) {
  const links = answers.reference_links;
  return typeof links === "string" ? links.trim() : "";
}

export function getPlanByKey(key: SubscriptionKey) {
  return subscriptionPlans.find((plan) => plan.key === key) ?? subscriptionPlans[0];
}

export function recommendPlan(answers: QuoteAnswers) {
  const catalogSize = Number(answers.catalog_size || 0);
  const features = Array.isArray(answers.must_have_features)
    ? answers.must_have_features
    : [];
  const integrations = Array.isArray(answers.integrations_need)
    ? answers.integrations_need
    : [];
  const currentStage = String(answers.current_stage || "");
  const operationLevel = String(answers.operation_level || "");
  const urgentLaunch = String(answers.launch_window || "").includes("15");
  const mainPriority = String(answers.main_priority || "");

  const needsScale =
    catalogSize >= 150 ||
    currentStage.includes("equipe") ||
    operationLevel.includes("muitos pedidos") ||
    mainPriority.includes("Escalar") ||
    mainPriority.includes("Automatizar") ||
    integrations.some((integration) =>
      ["ERP ou sistema de gestao", "Marketplace", "CRM ou automacao", "API ou webhooks"].includes(integration)
    ) ||
    features.some((feature) =>
      ["Integração com outro sistema", "Integracao com outro sistema", "Área do cliente", "Area do cliente"].includes(feature)
    );

  if (needsScale) {
    return getPlanByKey("scale");
  }

  const needsGrowth =
    catalogSize >= 50 ||
    urgentLaunch ||
    currentStage.includes("WhatsApp") ||
    currentStage.includes("loja") ||
    mainPriority.includes("Vender mais") ||
    mainPriority.includes("Organizar") ||
    integrations.some((integration) =>
      ["Gateway de pagamento especifico", "Transportadora especifica"].includes(integration)
    ) ||
    features.some((feature) =>
      ["Controle de estoque", "Cálculo de frete", "Calculo de frete", "Cupons e campanhas"].includes(feature)
    );

  if (needsGrowth) {
    return getPlanByKey("growth");
  }

  return getPlanByKey("starter");
}

export function getProfileCompleteness(profile: ClientProfile) {
  const requiredFields: Array<keyof ClientProfile> = [
    "fullName",
    "email",
    "companyName",
    "taxId",
    "segment",
    "storeName"
  ];

  const completed = requiredFields.filter((field) => profile[field].trim()).length;

  return {
    completed,
    total: requiredFields.length,
    percent: Math.round((completed / requiredFields.length) * 100),
    isComplete: completed === requiredFields.length
  };
}
