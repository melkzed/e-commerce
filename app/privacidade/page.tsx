import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Politica de privacidade da Melkzedek Tech para uso da plataforma e envio de pedidos de analise."
};

const privacySections = [
  {
    title: "Dados que coletamos",
    text: "Podemos coletar nome, email, telefone, empresa, loja, segmento, respostas do pedido de analise e informacoes tecnicas basicas de uso da plataforma."
  },
  {
    title: "Como usamos os dados",
    text: "Usamos os dados para criar seu perfil, responder pedidos, recomendar um plano, enviar comunicacoes relacionadas ao servico e melhorar a experiencia da plataforma."
  },
  {
    title: "Compartilhamento",
    text: "Nao vendemos seus dados. Podemos compartilhar informacoes apenas com ferramentas necessarias para operar o servico, como hospedagem, banco de dados, autenticacao e email."
  },
  {
    title: "Seguranca",
    text: "Aplicamos controles de acesso, separacao de dados por usuario e boas praticas de armazenamento. Ainda assim, nenhum sistema online e totalmente imune a riscos."
  },
  {
    title: "Seus direitos",
    text: "Voce pode solicitar correcao, atualizacao ou remocao dos seus dados entrando em contato pelo email informado no rodape da plataforma."
  }
];

export default function PrivacyPage() {
  return (
    <main className="flow-shell legal-page">
      <section className="flow-hero compact-hero legal-hero">
        <p>Privacidade</p>
        <h1>Como cuidamos dos seus dados.</h1>
        <span>
          Esta pagina resume como a Melkzedek Tech trata informacoes enviadas em
          perfis, pedidos de analise e uso da plataforma.
        </span>
      </section>

      <section className="flow-panel legal-content">
        {privacySections.map((section) => (
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
