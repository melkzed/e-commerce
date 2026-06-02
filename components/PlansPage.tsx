"use client";

import { ArrowRight, Check, Layers3, WalletCards } from "lucide-react";
import { subscriptionPlans } from "@/lib/platform";

export function PlansPage() {
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
          <article key={plan.key} className="flow-panel plan-detail" style={{ borderColor: `${plan.accent}55` }}>
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
          </article>
        ))}
      </section>

      <section className="flow-panel plans-cta">
        <Layers3 size={24} />
        <div>
          <h2>Quer transformar um plano em proposta?</h2>
          <p>Responda algumas perguntas e receba uma sugestao de plano para sua loja.</p>
        </div>
        <a href="/orcamento" className="primary-flow-action">
          Pedir analise
          <ArrowRight size={17} />
        </a>
      </section>
    </main>
  );
}
