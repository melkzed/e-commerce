"use client";

import { ArrowRight, Check, Layers3, X, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { subscriptionPlans, type SubscriptionKey, type SubscriptionPlan } from "@/lib/platform";

type ComparisonKey = "starter" | "growth" | "scale";

type ComparisonRow = {
  label: string;
} & Record<ComparisonKey, string>;

const planDecisionCards = [
  {
    title: "Valide a primeira venda",
    text: "Para quem precisa tirar a loja do papel com catálogo, carrinho, pedidos e presença online.",
    tag: "Loja Essencial"
  },
  {
    title: "Cresca com rotina organizada",
    text: "Para lojas que já precisam de campanhas, estoque, frete, clientes e relatórios claros.",
    tag: "Loja Profissional"
  },
  {
    title: "Escale com controle técnico",
    text: "Para operações com equipe, integrações, automações, alto volume e prioridade no suporte.",
    tag: "Loja Completa"
  }
];

const planCompareColumns: Array<{
  key: ComparisonKey;
  label: string;
  signal: string;
}> = [
  { key: "starter", label: "Essencial", signal: "Começo" },
  { key: "growth", label: "Profissional", signal: "Crescimento" },
  { key: "scale", label: "Completa", signal: "Escala" }
];

const planCompareHighlights: Record<
  ComparisonKey,
  {
    headline: string;
    description: string;
    bestFor: string;
  }
> = {
  starter: {
    headline: "Base enxuta",
    description: "Para entrar no digital com catálogo, pedidos e presença online sem criar uma operação pesada.",
    bestFor: "Menos complexidade para validar a loja."
  },
  growth: {
    headline: "Rotina de venda",
    description: "Para organizar estoque, frete, campanhas e relatórios enquanto a loja começa a vender com frequência.",
    bestFor: "Mais controle para crescer toda semana."
  },
  scale: {
    headline: "Operação completa",
    description: "Para equipe, automações, integrações e alto volume com prioridade de suporte e acompanhamento.",
    bestFor: "Estrutura preparada para escalar."
  }
};

const comparisonRows: ComparisonRow[] = [
  {
    label: "Momento ideal",
    starter: "Começar online",
    growth: "Vender toda semana",
    scale: "Operar em alto volume"
  },
  {
    label: "Foco principal",
    starter: "Catálogo e pedidos",
    growth: "Conversão e campanhas",
    scale: "Processos e integrações"
  },
  {
    label: "Recursos técnicos",
    starter: "SEO base e layout responsivo",
    growth: "Relatórios, frete e estoque",
    scale: "API, automações e permissões"
  },
  {
    label: "Indicadores",
    starter: "Vendas e pedidos",
    growth: "Conversão e produtos",
    scale: "LTV, CAC, margem e SLA"
  },
  {
    label: "Melhor para",
    starter: "Validar oferta",
    growth: "Aumentar receita",
    scale: "Reduzir retrabalho"
  }
];

const planExtraDetails: Record<
  SubscriptionKey,
  {
    delivery: string;
    focus: string;
    support: string;
    technical: string[];
  }
> = {
  starter: {
    delivery: "Base pronta para validar vendas",
    focus: "Catálogo, carrinho e presença online",
    support: "Apoio inicial para colocar no ar",
    technical: ["SEO base", "Layout responsivo", "Contato via WhatsApp"]
  },
  growth: {
    delivery: "Operação preparada para vender toda semana",
    focus: "Conversão, estoque, frete e campanhas",
    support: "Suporte para campanhas e ajustes de venda",
    technical: ["Relatórios", "Cupons", "Avisos de estoque"]
  },
  scale: {
    delivery: "Estrutura para equipe e alto volume",
    focus: "Automações, permissões e integrações",
    support: "Prioridade no suporte e evolução técnica",
    technical: ["API/webhooks", "Permissões", "Monitoramento"]
  }
};

function getPlanFromSearch(search: string) {
  const selectedKey = new URLSearchParams(search).get("plan");
  return subscriptionPlans.find((plan) => plan.key === selectedKey) ?? null;
}

function quotePath(planKey: SubscriptionKey) {
  return `/orcamento?plan=${planKey}`;
}

export function PlansPage() {
  const auth = usePlatformAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginTitle = useMemo(
    () => selectedPlan ? `Entre para solicitar ${selectedPlan.name}` : "Entre para continuar",
    [selectedPlan]
  );

  useEffect(() => {
    const planFromUrl = getPlanFromSearch(window.location.search);
    const params = new URLSearchParams(window.location.search);

    if (planFromUrl && params.get("login") === "1") {
      setSelectedPlan(planFromUrl);
      setLoginOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!auth.authLoading && auth.isConnected && selectedPlan && loginOpen) {
      window.location.assign(quotePath(selectedPlan.key));
    }
  }, [auth.authLoading, auth.isConnected, loginOpen, selectedPlan]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (auth.authLoading) {
      return;
    }

    if (auth.isConnected) {
      window.location.assign(quotePath(plan.key));
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("plan", plan.key);
    nextUrl.searchParams.set("login", "1");
    window.history.replaceState(null, "", nextUrl);

    auth.setProfileNotice("");
    setSelectedPlan(plan);
    setLoginOpen(true);
  };

  const closeLogin = () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("login");
    window.history.replaceState(null, "", nextUrl);

    setLoginOpen(false);
  };

  return (
    <main className="flow-shell" aria-labelledby="plans-page-title">
      <section className="flow-hero compact-hero" aria-labelledby="plans-page-title">
        <p>Planos</p>
        <h1 id="plans-page-title">Escolha o nível ideal para começar sua loja online.</h1>
        <span>
          Você não precisa entender termos técnicos. Veja o que cada plano cobre e
          peça uma análise para saber qual combina com o seu momento.
        </span>
      </section>

      <section className="plans-page-grid" aria-label="Planos disponíveis">
        {subscriptionPlans.map((plan) => (
          <button
            key={plan.key}
            className="flow-panel plan-detail plan-select-card"
            style={{ borderColor: `${plan.accent}55` }}
            type="button"
            onClick={() => handlePlanSelect(plan)}
          >
            <div className="plan-detail-top">
              <div>
                <span style={{ color: plan.accent }}>{plan.signal}</span>
                <h2>{plan.name}</h2>
              </div>
              <WalletCards size={24} aria-hidden="true" />
            </div>
            <p>{plan.idealFor}</p>

            <div className="plan-detail-meta">
              {[
                ["Entrega", planExtraDetails[plan.key].delivery],
                ["Foco", planExtraDetails[plan.key].focus],
                ["Suporte", planExtraDetails[plan.key].support]
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="plan-tech-row">
              {planExtraDetails[plan.key].technical.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <ul>
              {plan.coverage.map((item) => (
                <li key={item}>
                  <Check size={15} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <span className="plan-select-action">
              Selecionar plano
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </button>
        ))}
      </section>

      <section className="plans-decision-section">
        <div className="section-kicker compact-kicker">
          <p className="landing-eyebrow">Como escolher</p>
          <h2>Cada plano resolve um estágio da loja.</h2>
          <span>
            Comece com o que gera venda agora e avance quando a operação pedir mais
            automação, dados e integrações.
          </span>
        </div>

        <div className="plan-decision-grid">
          {planDecisionCards.map((card) => (
            <article key={card.title}>
              <span>{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flow-panel plan-compare-panel">
        <div className="flow-heading">
          <div>
            <span>Comparativo rápido</span>
            <h2>Veja onde cada assinatura encaixa melhor.</h2>
          </div>
          <strong>3 níveis</strong>
        </div>

        <div className="plan-compare-summary" aria-label="Resumo dos planos no comparativo">
          {planCompareColumns.map((column, index) => {
            const highlight = planCompareHighlights[column.key];

            return (
              <article key={column.key} className={`plan-compare-summary-card ${column.key}`}>
                <span className="plan-compare-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{column.signal}</small>
                  <strong>{column.label}</strong>
                </div>
                <h3>{highlight.headline}</h3>
                <p>{highlight.description}</p>
                <em>{highlight.bestFor}</em>
              </article>
            );
          })}
        </div>

        <div className="plan-compare-table" role="table" aria-label="Comparativo rápido entre planos">
          <div className="plan-compare-head" role="row">
            <span role="columnheader">Critério</span>
            {planCompareColumns.map((column) => (
              <strong key={column.key} role="columnheader">
                {column.label}
                <small>{column.signal}</small>
              </strong>
            ))}
          </div>

          {comparisonRows.map((row) => (
            <div key={row.label} className="plan-compare-row" role="row">
              <span role="rowheader">
                <small>Critério</small>
                {row.label}
              </span>
              {planCompareColumns.map((column) => (
                <p key={column.key} className={`plan-compare-cell ${column.key}`} role="cell">
                  <small>{column.label}</small>
                  <strong>{row[column.key]}</strong>
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="flow-panel plans-cta">
        <Layers3 size={24} aria-hidden="true" />
        <div>
          <h2>Quer saber qual plano assinar?</h2>
          <p>Responda algumas perguntas e receba uma sugestão objetiva para sua loja.</p>
        </div>
        <a href="/orcamento" className="primary-flow-action">
          Solicitar orçamento
          <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>

      {loginOpen && selectedPlan && (
        <div className="plan-login-overlay" role="dialog" aria-modal="true" aria-label="Login para selecionar plano">
          <div className="plan-login-shell">
            <button className="plan-login-close" type="button" onClick={closeLogin} aria-label="Fechar login">
              <X size={18} />
            </button>

            <aside className="selected-plan-summary">
              <span>Plano selecionado</span>
              <strong>{selectedPlan.name}</strong>
              <p>
                Depois do login, você vai responder o orçamento guiado com este plano
                já marcado para iniciar o processo do site.
              </p>
            </aside>

            <AuthAccessCard
              auth={auth}
              eyebrow="Login para continuar"
              title={loginTitle}
              text="Crie ou acesse sua conta para salvar o orçamento, ligar a solicitação ao seu perfil e continuar com segurança."
            />
          </div>
        </div>
      )}
    </main>
  );
}
