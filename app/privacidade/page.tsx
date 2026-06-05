import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, createPageMetadata, webPageJsonLd } from "@/lib/seo";

const title = "Privacidade";
const description =
  "Política de privacidade da Melkzedek Tech para uso da plataforma e envio de orçamentos de análise.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/privacidade"
});

const privacySections = [
  {
    title: "Dados que coletamos",
    text: "Podemos coletar nome, e-mail, telefone, empresa, loja, segmento, respostas do orçamento de análise e informações técnicas básicas de uso da plataforma."
  },
  {
    title: "Como usamos os dados",
    text: "Usamos os dados para criar seu perfil, responder orçamentos, recomendar um plano, enviar comunicações relacionadas ao serviço e melhorar a experiência da plataforma."
  },
  {
    title: "Compartilhamento",
    text: "Não vendemos seus dados. Podemos compartilhar informações apenas com ferramentas necessárias para operar o serviço, como hospedagem, banco de dados, autenticação e e-mail."
  },
  {
    title: "Segurança",
    text: "Aplicamos controles de acesso, separação de dados por usuário e boas práticas de armazenamento. Ainda assim, nenhum sistema online é totalmente imune a riscos."
  },
  {
    title: "Seus direitos",
    text: "Você pode solicitar correção, atualização ou remoção dos seus dados entrando em contato pelo e-mail informado no rodapé da plataforma."
  }
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: title,
          description,
          path: "/privacidade"
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Privacidade", path: "/privacidade" }
        ])}
      />
      <main className="flow-shell legal-page">
        <section className="flow-hero compact-hero legal-hero" aria-labelledby="privacy-title">
          <p>Privacidade</p>
          <h1 id="privacy-title">Como cuidamos dos seus dados.</h1>
          <span>
            Esta página resume como a Melkzedek Tech trata informações enviadas em
            perfis, orçamentos de análise e uso da plataforma.
          </span>
        </section>

        <section className="flow-panel legal-content" aria-label="Política de privacidade">
          {privacySections.map((section) => (
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
