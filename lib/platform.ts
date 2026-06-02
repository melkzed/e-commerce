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
    name: "Loja Essencial",
    signal: "Comeco",
    idealFor: "Para quem quer comecar a vender online com uma loja organizada.",
    coverage: [
      "Cadastro de produtos",
      "Carrinho e pedidos",
      "Painel para gerenciar a loja",
      "Base para aparecer no Google",
      "Apoio para colocar no ar",
      "Layout responsivo",
      "Pagina inicial da loja",
      "Formulario de contato"
    ],
    accent: "#0f766e"
  },
  {
    key: "growth",
    name: "Loja Profissional",
    signal: "Crescimento",
    idealFor: "Para quem ja quer vender melhor, acompanhar estoque e fazer campanhas.",
    coverage: [
      "Tudo da Loja Essencial",
      "Cupons e campanhas",
      "Avisos de estoque",
      "Opcoes de frete",
      "Relatorio de vendas",
      "Organizacao de clientes",
      "Produtos em destaque",
      "Melhorias para conversao",
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
      "Automacoes de atendimento",
      "Integracoes avancadas",
      "Prioridade no suporte",
      "Controle mais completo de pedidos",
      "Relatorios de desempenho",
      "Base para varias rotinas da loja",
      "Preparacao para alto volume"
    ],
    accent: "#db2777"
  }
];

export const quoteQuestions: QuoteQuestion[] = [
  {
    id: "business_model",
    label: "Modelo",
    prompt: "O que voce quer vender na sua loja?",
    helper: "Exemplo: roupas femininas, doces, suplementos, pecas, cursos ou servicos.",
    type: "text",
    placeholder: "Conte com suas palavras o que voce vende."
  },
  {
    id: "catalog_size",
    label: "Catalogo",
    prompt: "Quantos produtos voce quer colocar no comeco?",
    helper: "Pode ser uma estimativa. Isso ajuda a montar uma loja do tamanho certo.",
    type: "number",
    placeholder: "Ex.: 40"
  },
  {
    id: "must_have_features",
    label: "Recursos",
    prompt: "O que sua loja precisa ter?",
    helper: "Marque o que voce acha importante para vender bem.",
    type: "multi",
    options: [
      "Pagamento online",
      "Controle de estoque",
      "Calculo de frete",
      "Cupons e campanhas",
      "Botao de WhatsApp",
      "Integracao com outro sistema",
      "Conteudo para Google",
      "Area do cliente"
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
    prompt: "Como voce imagina sua loja nos proximos meses?",
    helper: "Escolha a opcao que mais parece com o seu momento.",
    type: "single",
    options: [
      "Comecar e testar as primeiras vendas",
      "Vender toda semana com campanhas",
      "Trabalhar com equipe e muitos pedidos"
    ]
  }
];

export const requestPipeline = [
  "Novo",
  "Perfil revisado",
  "Plano escolhido",
  "Proposta enviada",
  "Cliente ativo"
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
    operationLevel.includes("muitos pedidos") ||
    features.some((feature) => ["Integracao com outro sistema", "Area do cliente"].includes(feature));

  if (needsScale) {
    return getPlanByKey("scale");
  }

  const needsGrowth =
    catalogSize >= 50 ||
    urgentLaunch ||
    features.some((feature) =>
      ["Controle de estoque", "Calculo de frete", "Cupons e campanhas"].includes(feature)
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
