"use client";

import { ArrowRight, CheckCircle2, Loader2, MessageCircle, UserRound, WalletCards } from "lucide-react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { ProfileForm } from "@/components/ProfileForm";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { getPlanByKey, getProfileCompleteness } from "@/lib/platform";

export function ProfilePage() {
  const auth = usePlatformAuth();
  const completeness = getProfileCompleteness(auth.profile);

  return (
    <main className="flow-shell">
      {auth.authLoading ? (
        <section className="access-loading-card">
          <Loader2 className="spin" size={22} />
          Verificando login...
        </section>
      ) : !auth.isConnected ? (
        <section className="access-page-wrap">
          <AuthAccessCard
            auth={auth}
            title="Conecte sua conta para gerenciar o perfil"
            text="Depois do login, seus dados ficam salvos para pedir sua loja sem repetir informações."
          />
        </section>
      ) : (
        <section className="profile-page-layout">
          <ProfileForm auth={auth} />

          <aside className="flow-panel profile-readiness">
            <UserRound size={24} />
            <h2>{completeness.isComplete ? "Perfil pronto" : "Perfil em andamento"}</h2>
            <p>
              Quando o perfil estiver completo, você já pode responder às perguntas e
              enviar o orçamento da sua loja.
            </p>

            <div className="readiness-list">
              {[
                ["Login", auth.isConnected],
                ["Nome", Boolean(auth.profile.fullName)],
                ["Empresa", Boolean(auth.profile.companyName)],
                ["CPF/CNPJ", Boolean(auth.profile.taxId)],
                ["Segmento", Boolean(auth.profile.segment)],
                ["Loja", Boolean(auth.profile.storeName)]
              ].map(([label, done]) => (
                <div key={String(label)}>
                  <CheckCircle2 size={16} className={done ? "done" : undefined} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <a href="/orcamento" className="primary-flow-action full">
              Pedir minha loja
              <ArrowRight size={17} />
            </a>
          </aside>

          <section className="flow-panel profile-quotes-panel">
            <div className="profile-quotes-head">
              <WalletCards size={22} />
              <div>
                <span>Orçamentos</span>
                <h2>Respostas e valores recebidos</h2>
              </div>
            </div>

            {auth.clientQuoteRequests.length === 0 ? (
              <p className="empty-state">Nenhum orçamento enviado ainda.</p>
            ) : (
              <div className="profile-quote-list">
                {auth.clientQuoteRequests.map((request) => {
                  const plan = getPlanByKey(request.plan_key);
                  const hasProposal = Boolean(request.quote_value || request.admin_response);

                  return (
                    <article key={request.id} className="profile-quote-card">
                      <div className="profile-quote-top">
                        <div>
                          <span>{new Date(request.created_at).toLocaleDateString("pt-BR")}</span>
                          <h3>{plan.name}</h3>
                        </div>
                        <strong>{request.quote_value || "Em análise"}</strong>
                      </div>

                      {hasProposal ? (
                        <div className="profile-quote-response">
                          <MessageCircle size={17} />
                          <div>
                            <span>Resposta do admin</span>
                            <p>{request.admin_response || "Valor informado. Aguarde os próximos detalhes."}</p>
                            <small>
                              {request.quote_response_email_status === "sent"
                                ? "Aviso enviado por e-mail."
                                : "Resposta disponível na plataforma."}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <p className="profile-quote-pending">
                          Seu orçamento foi recebido. Assim que eu responder, o valor aparece aqui e você recebe um aviso por e-mail.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
