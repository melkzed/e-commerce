export const ADMIN_EMAIL = "melkzedektech@gmail.com";

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

export type QuoteRequestRow = {
  id: string;
  user_id: string;
  plan_key: SubscriptionKey;
  profile_snapshot: ClientProfile;
  answers: QuoteAnswers;
  status: string;
  admin_email: string;
  email_status: string;
  created_at: string;
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
  companyName: "Empresa em avaliacao",
  taxId: "",
  phone: "",
  segment: "",
  storeName: ""
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    key: "starter",
    name: "Loja Start",
    signal: "Entrada",
    idealFor: "Primeira loja online com operacao enxuta.",
    coverage: [
      "Catalogo inicial",
      "Checkout e pedidos",
      "Painel de produtos",
      "Base para SEO",
      "Suporte de lancamento"
    ],
    accent: "#0f766e"
  },
  {
    key: "growth",
    name: "Loja Growth",
    signal: "Crescimento",
    idealFor: "Marcas que precisam vender, medir e automatizar.",
    coverage: [
      "Tudo da Loja Start",
      "Cupons e campanhas",
      "Estoque com alertas",
      "Integracoes de frete",
      "Dashboard comercial"
    ],
    accent: "#b45309"
  },
  {
    key: "scale",
    name: "Loja Scale",
    signal: "Escala",
    idealFor: "Operacoes com alto volume, equipe e integracoes.",
    coverage: [
      "Tudo da Loja Growth",
      "Multiplas permissoes",
      "Automacoes avancadas",
      "Marketplace e API",
      "SLA prioritario"
    ],
    accent: "#7c3aed"
  }
];

export const quoteQuestions: QuoteQuestion[] = [
  {
    id: "business_model",
    label: "Modelo",
    prompt: "O que sua loja vai vender e para quem?",
    helper: "Exemplo: moda feminina para varejo local, pecas sob encomenda, eletronicos B2C.",
    type: "text",
    placeholder: "Descreva o nicho, publico e tipo de produto."
  },
  {
    id: "catalog_size",
    label: "Catalogo",
    prompt: "Quantos produtos voce pretende cadastrar no inicio?",
    helper: "Uma estimativa ja ajuda a prever estrutura, filtros e rotina de cadastro.",
    type: "number",
    placeholder: "Ex.: 40"
  },
  {
    id: "must_have_features",
    label: "Recursos",
    prompt: "Quais recursos sao obrigatorios para lancar?",
    helper: "Selecione apenas o que precisa estar pronto na primeira versao.",
    type: "multi",
    options: [
      "Checkout online",
      "Gestao de estoque",
      "Frete integrado",
      "Cupons e campanhas",
      "WhatsApp comercial",
      "Marketplace ou ERP",
      "Blog e SEO",
      "Area do cliente"
    ]
  },
  {
    id: "launch_window",
    label: "Prazo",
    prompt: "Qual prazo ideal para colocar a loja no ar?",
    helper: "Isso ajuda a separar MVP, etapa de melhoria e integracoes futuras.",
    type: "single",
    options: ["Ate 15 dias", "30 dias", "60 dias", "Sem pressa definida"]
  },
  {
    id: "operation_level",
    label: "Operacao",
    prompt: "Como voce imagina a operacao nos proximos 90 dias?",
    helper: "Escolha o cenario mais proximo para orientar a assinatura inicial.",
    type: "single",
    options: [
      "Validar vendas com baixo volume",
      "Crescer campanhas e pedidos semanais",
      "Operar com equipe e alto volume"
    ]
  }
];

export const requestPipeline = [
  "Novo",
  "Perfil revisado",
  "Escopo planejado",
  "Proposta enviada",
  "Assinatura ativa"
];

export function getAnswerText(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Nao informado";
  }

  return value?.trim() || "Nao informado";
}

export function getPlanByKey(key: SubscriptionKey) {
  return subscriptionPlans.find((plan) => plan.key === key) ?? subscriptionPlans[0];
}

export function recommendPlan(answers: QuoteAnswers) {
  const catalogSize = Number(answers.catalog_size || 0);
  const features = Array.isArray(answers.must_have_features)
    ? answers.must_have_features
    : [];
  const operationLevel = String(answers.operation_level || "");
  const urgentLaunch = String(answers.launch_window || "").includes("15");

  const needsScale =
    catalogSize >= 150 ||
    operationLevel.includes("alto volume") ||
    features.some((feature) => ["Marketplace ou ERP", "Area do cliente"].includes(feature));

  if (needsScale) {
    return getPlanByKey("scale");
  }

  const needsGrowth =
    catalogSize >= 50 ||
    urgentLaunch ||
    features.some((feature) =>
      ["Gestao de estoque", "Frete integrado", "Cupons e campanhas"].includes(feature)
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
