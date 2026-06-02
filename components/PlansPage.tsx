"use client";

import { ArrowRight, Check, Layers3, X, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { subscriptionPlans, type SubscriptionKey, type SubscriptionPlan } from "@/lib/platform";

const planDecisionCards = [
  {
    title: "Valide a primeira venda",
    text: "Para quem precisa tirar a loja do papel com catalogo, carrinho, pedidos e presenca online.",
    tag: "Loja Essencial"
  },
  {
    title: "Cresca com rotina organizada",
    text: "Para lojas que ja precisam de campanhas, estoque, frete, clientes e relatorios claros.",
    tag: "Loja Profissional"
  },
  {
    title: "Escale com controle tecnico",
    text: "Para operacoes com equipe, integracoes, automacoes, alto volume e prioridade no suporte.",
    tag: "Loja Completa"
  }
];

const comparisonRows = [
  {
    label: "Momento ideal",
    starter: "Comecar online",
    growth: "Vender toda semana",
    scale: "Operar em alto volume"
  },
  {
    label: "Foco principal",
    starter: "Catalogo e pedidos",
    growth: "Conversao e campanhas",
    scale: "Processos e integracoes"
  },
  {
    label: "Recursos tecnicos",
    starter: "SEO base e layout responsivo",
    growth: "Relatorios, frete e estoque",
    scale: "API, automacoes e permissoes"
  },
  {
    label: "Indicadores",
    starter: "Vendas e pedidos",
    growth: "Conversao e produtos",
    scale: "LTV, CAC, margem e SLA"
  },
  {
    label: "Melhor para",
    starter: "Validar oferta",
    growth: "Aumentar receita",
    scale: "Reduzir retrabalho"
  }
];

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
    <main className="flow-shell">
      <section className="flow-hero compact-hero">
        <p>Planos</p>
        <h1>Escolha o nivel ideal para comecar sua loja online.</h1>
        <span>
          Voce nao precisa entender termos tecnicos. Veja o que cada plano cobre e
          peca uma analise para saber qual combina com o seu momento.
        </span>
      </section>

      <section className="plans-page-grid">
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
              <WalletCards size={24} />
            </div>
            <p>{plan.idealFor}</p>
            <ul>
              {plan.coverage.map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <span className="plan-select-action">
              Selecionar plano
              <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </section>

      <section className="plans-decision-section">
        <div className="section-kicker compact-kicker">
          <p className="landing-eyebrow">Como escolher</p>
          <h2>Cada plano resolve um estagio da loja.</h2>
          <span>
            Comece com o que gera venda agora e avance quando a operacao pedir mais
            automacao, dados e integracoes.
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
            <span>Comparativo rapido</span>
            <h2>Veja onde cada assinatura encaixa melhor.</h2>
          </div>
          <strong>3 niveis</strong>
        </div>

        <div className="plan-compare-table">
          <div className="plan-compare-head">
            <span>Criterio</span>
            <strong>Essencial</strong>
            <strong>Profissional</strong>
            <strong>Completa</strong>
          </div>

          {comparisonRows.map((row) => (
            <div key={row.label} className="plan-compare-row">
              <span>{row.label}</span>
              <p>{row.starter}</p>
              <p>{row.growth}</p>
              <p>{row.scale}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flow-panel plans-cta">
        <Layers3 size={24} />
        <div>
          <h2>Quer saber qual plano assinar?</h2>
          <p>Responda algumas perguntas e receba uma sugestao objetiva para sua loja.</p>
        </div>
        <a href="/orcamento" className="primary-flow-action">
          Pedir analise
          <ArrowRight size={17} />
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
                Depois do login, voce vai responder o pedido guiado com este plano
                ja marcado para iniciar o processo do site.
              </p>
            </aside>

            <AuthAccessCard
              auth={auth}
              eyebrow="Login para continuar"
              title={loginTitle}
              text="Crie ou acesse sua conta para salvar o pedido, ligar a solicitacao ao seu perfil e continuar com seguranca."
            />
          </div>
        </div>
      )}
    </main>
  );
}
