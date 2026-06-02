import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso da Melkzedek Tech para acesso a plataforma, planos e pedidos de analise."
};

const termsSections = [
  {
    title: "Uso da plataforma",
    text: "A plataforma deve ser usada para criar, administrar e solicitar estruturas de loja online de forma legitima, sem abuso, fraude ou tentativa de acesso indevido."
  },
  {
    title: "Pedidos e propostas",
    text: "Os pedidos de analise geram uma sugestao inicial. Valores, prazos, escopo e condicoes comerciais devem ser confirmados em proposta formal antes da contratacao."
  },
  {
    title: "Planos e recursos",
    text: "Os recursos de cada plano podem evoluir com melhorias tecnicas. Quando houver mudancas relevantes, a comunicacao sera feita pelos canais de contato disponiveis."
  },
  {
    title: "Responsabilidades do cliente",
    text: "O cliente deve fornecer informacoes corretas, manter dados de acesso protegidos e respeitar leis aplicaveis a vendas, pagamentos, entregas e atendimento ao consumidor."
  },
  {
    title: "Limitacoes",
    text: "Indicadores, simulacoes de ROI e ganhos apresentados na plataforma sao estimativas. Resultados reais dependem de operacao, trafego, oferta, produto, atendimento e mercado."
  }
];

export default function TermsPage() {
  return (
    <main className="flow-shell legal-page">
      <section className="flow-hero compact-hero legal-hero">
        <p>Termos de uso</p>
        <h1>Regras para usar a plataforma.</h1>
        <span>
          Estes termos explicam as condicoes gerais para navegar, solicitar
          analises, comparar planos e usar os recursos da Melkzedek Tech.
        </span>
      </section>

      <section className="flow-panel legal-content">
        {termsSections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}

        <p className="legal-note">
          Ultima atualizacao: 02/06/2026. Para duvidas, envie uma mensagem para
          melkzedd@gmail.com.
        </p>
      </section>
    </main>
  );
}
