"use client";

import { ArrowRight, Check, Layers3, WalletCards } from "lucide-react";
import { PlatformNav } from "@/components/PlatformNav";
import { subscriptionPlans } from "@/lib/platform";

export function PlansPage() {
  return (
    <main className="flow-shell">
      <PlatformNav variant="light" />

      <section className="flow-hero compact-hero">
        <p>Assinaturas</p>
        <h1>Tres niveis de loja online para voce precificar do seu jeito.</h1>
        <span>
          Os valores nao aparecem publicamente. O cliente solicita orcamento e voce
          decide o preco final apos analisar escopo, volume e integracoes.
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
          <p>O chatbot recomenda o nivel inicial com base no briefing do cliente.</p>
        </div>
        <a href="/orcamento" className="primary-flow-action">
          Solicitar orcamento
          <ArrowRight size={17} />
        </a>
      </section>
    </main>
  );
}
