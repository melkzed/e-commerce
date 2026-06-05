"use client";

import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  Star
} from "lucide-react";
import { FormEvent, useState } from "react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { ADMIN_EMAIL, supportStatusLabels } from "@/lib/platform";

const priorityOptions = [
  { label: "Normal", value: "normal" },
  { label: "Alta", value: "high" },
  { label: "Urgente", value: "urgent" }
];

export function SupportPage() {
  const auth = usePlatformAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const created = await auth.createSupportTicket({
      message,
      priority,
      subject
    });

    if (created) {
      setSubject("");
      setMessage("");
      setPriority("normal");
    }
  };

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const created = await auth.submitClientReview({
      comment,
      rating
    });

    if (created) {
      setComment("");
      setRating(5);
    }
  };

  return (
    <main className="flow-shell" aria-labelledby="support-page-title">
      <section className="flow-hero compact-hero support-hero" aria-labelledby="support-page-title">
        <p>Suporte</p>
        <h1 id="support-page-title">Fale comigo sobre sua loja sem perder o histórico.</h1>
        <span>
          Abra tickets, acompanhe respostas e envie uma avaliação para melhorar o atendimento.
        </span>
      </section>

      {auth.authLoading ? (
        <section className="access-loading-card">
          <Loader2 className="spin" size={22} />
          Verificando login...
        </section>
      ) : !auth.isConnected ? (
        <section className="access-page-wrap">
          <AuthAccessCard
            auth={auth}
            eyebrow="Suporte do cliente"
            title="Entre para falar comigo"
            text="Depois do login, seus tickets ficam salvos e você acompanha as respostas pela plataforma."
          />
        </section>
      ) : (
        <section className="support-page-layout">
          <div className="support-main-stack">
            <section className="flow-panel support-ticket-card">
              <div className="flow-heading">
                <div>
                  <span>Novo ticket</span>
                  <h2>Envie uma dúvida ou solicitação</h2>
                </div>
                <Headphones size={23} />
              </div>

              <form className="support-form" onSubmit={handleTicketSubmit}>
                <div className="profile-grid">
                  <label>
                    Assunto
                    <input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="Ex.: dúvida sobre plano, orçamento ou integração"
                      required
                    />
                  </label>

                  <label>
                    Prioridade
                    <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Mensagem
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Conte o que você precisa. Quanto mais contexto, mais rápido eu consigo te orientar."
                    required
                  />
                </label>

                <button className="primary-flow-action" type="submit" disabled={auth.supportLoading}>
                  {auth.supportLoading ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
                  Enviar ticket
                </button>
              </form>

              {auth.supportNotice && <p className="flow-note">{auth.supportNotice}</p>}
            </section>

            <section className="flow-panel support-ticket-list">
              <div className="flow-heading">
                <div>
                  <span>Histórico</span>
                  <h2>Seus tickets</h2>
                </div>
                <button className="secondary-flow-action compact" type="button" onClick={auth.refreshClientSupport}>
                  {auth.supportLoading ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
                  Atualizar
                </button>
              </div>

              {auth.supportTickets.length === 0 ? (
                <p className="empty-state">Nenhum ticket aberto ainda.</p>
              ) : (
                <div className="support-thread-list">
                  {auth.supportTickets.map((ticket) => (
                    <article key={ticket.id} className="support-thread-card">
                      <div className="support-thread-head">
                        <div>
                          <span>{new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
                          <strong>{ticket.subject}</strong>
                        </div>
                        <small>{supportStatusLabels[ticket.status] || ticket.status}</small>
                      </div>
                      <p>{ticket.message}</p>
                      {ticket.admin_reply ? (
                        <div className="support-reply-box">
                          <CheckCircle2 size={17} />
                          <div>
                            <span>Resposta do admin</span>
                            <p>{ticket.admin_reply}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="support-waiting-box">
                          <AlertCircle size={16} />
                          Aguardando resposta.
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="support-side-stack">
            <section className="flow-panel support-direct-card">
              <MessageCircle size={24} />
              <h2>Contato direto</h2>
              <p>
                Para algo muito urgente, envie um e-mail direto. O ticket ainda é o melhor lugar
                para manter o histórico organizado.
              </p>
              <a className="secondary-flow-action full" href={`mailto:${ADMIN_EMAIL}`}>
                <Mail size={17} />
                Enviar e-mail
              </a>
            </section>

            <section className="flow-panel review-card">
              <div className="flow-heading">
                <div>
                  <span>Avaliação</span>
                  <h2>Como foi sua experiência?</h2>
                </div>
              </div>

              <form className="support-form" onSubmit={handleReviewSubmit}>
                <div className="rating-picker" role="radiogroup" aria-label="Nota da avaliação">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className={value <= rating ? "active" : undefined}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-checked={rating === value}
                      aria-label={`${value} estrelas`}
                      role="radio"
                    >
                      <Star size={18} />
                    </button>
                  ))}
                </div>

                <label>
                  Comentário
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="O que foi bom? O que posso melhorar?"
                    required
                  />
                </label>

                <button className="primary-flow-action full" type="submit" disabled={auth.supportLoading}>
                  {auth.supportLoading ? <Loader2 className="spin" size={17} /> : <Star size={17} />}
                  Enviar avaliação
                </button>
              </form>

              {auth.clientReviews.length > 0 && (
                <div className="last-review-note">
                  Última avaliação: {auth.clientReviews[0].rating}/5
                </div>
              )}
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}
