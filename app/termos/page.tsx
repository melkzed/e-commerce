import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata, webPageJsonLd } from "@/lib/seo";

const title = "Termos de uso";
const description =
  "Termos de uso da Melkzedek Tech para acesso à plataforma, planos e orçamentos de análise.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/termos"
});

const termsSections = [
  {
    title: "Uso da plataforma",
    text: "A plataforma deve ser usada para criar, administrar e solicitar estruturas de loja online de forma legítima, sem abuso, fraude ou tentativa de acesso indevido."
  },
  {
    title: "Orçamentos e propostas",
    text: "Os orçamentos de análise geram uma sugestão inicial. Valores, prazos, escopo e condições comerciais devem ser confirmados em proposta formal antes da contratação."
  },
  {
    title: "Planos e recursos",
    text: "Os recursos de cada plano podem evoluir com melhorias técnicas. Quando houver mudanças relevantes, a comunicação será feita pelos canais de contato disponíveis."
  },
  {
    title: "Responsabilidades do cliente",
    text: "O cliente deve fornecer informações corretas, manter dados de acesso protegidos e respeitar leis aplicáveis a vendas, pagamentos, entregas e atendimento ao consumidor."
  },
  {
    title: "Limitações",
    text: "Indicadores, simulações de ROI e ganhos apresentados na plataforma são estimativas. Resultados reais dependem de operação, tráfego, oferta, produto, atendimento e mercado."
  }
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: title,
          description,
          path: "/termos"
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Termos de uso", path: "/termos" }
        ])}
      />
      <main className="flow-shell legal-page">
        <section className="flow-hero compact-hero legal-hero" aria-labelledby="terms-title">
          <p>Termos de uso</p>
          <h1 id="terms-title">Regras para usar a plataforma.</h1>
          <span>
            Estes termos explicam as condições gerais para navegar, solicitar
            análises, comparar planos e usar os recursos da Melkzedek Tech.
          </span>
        </section>

        <section className="flow-panel legal-content" aria-label="Termos de uso">
          {termsSections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}

          <p className="legal-note">
            Última atualização: 02/06/2026. Para dúvidas, envie uma mensagem para
            melkzedd@gmail.com.
          </p>
        </section>
      </main>
    </>
  );
}
