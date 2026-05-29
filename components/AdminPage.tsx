"use client";

import { Chrome, Loader2, LockKeyhole, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { PlatformNav } from "@/components/PlatformNav";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { ADMIN_EMAIL, getPlanByKey, requestPipeline, type QuoteRequestRow } from "@/lib/platform";

function getTodayCount(requests: QuoteRequestRow[]) {
  const today = new Date().toDateString();

  return requests.filter((request) => new Date(request.created_at).toDateString() === today)
    .length;
}

export function AdminPage() {
  const auth = usePlatformAuth();

  return (
    <main className="flow-shell">
      <PlatformNav variant="light" />

      <section className="flow-hero compact-hero">
        <p>Painel administrativo</p>
        <h1>Controle as solicitacoes que chegam do chatbot.</h1>
        <span>
          A lista completa fica restrita ao email admin da plataforma:
          {" "}
          <strong>{ADMIN_EMAIL}</strong>.
        </span>
      </section>

      <section className="admin-page-layout">
        <aside className="flow-panel admin-access">
          <Mail size={22} />
          <h2>Acesso admin</h2>
          <p>
            Entre com a conta cadastrada para visualizar clientes, respostas e planos
            sugeridos.
          </p>

          {!auth.isLoggedIn ? (
            <button className="primary-flow-action full" type="button" onClick={auth.handleGoogleLogin}>
              <Chrome size={17} />
              Entrar com Google
            </button>
          ) : (
            <div className="admin-email-card">
              <span>Conta atual</span>
              <strong>{auth.accountEmail}</strong>
            </div>
          )}

          {!auth.isAdmin && (
            <div className="lock-note">
              <LockKeyhole size={15} />
              Apenas {ADMIN_EMAIL} acessa a lista completa.
            </div>
          )}
        </aside>

        <section className="flow-panel admin-workspace">
          <div className="flow-heading">
            <div>
              <span>Solicitacoes</span>
              <h2>Pipeline comercial</h2>
            </div>
            <button
              className="secondary-flow-action"
              type="button"
              onClick={auth.refreshAdminRequests}
              disabled={!auth.isAdmin}
            >
              {auth.adminLoading ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
              Atualizar
            </button>
          </div>

          <div className="admin-metrics">
            <div>
              <span>Total</span>
              <strong>{auth.adminRequests.length}</strong>
            </div>
            <div>
              <span>Hoje</span>
              <strong>{getTodayCount(auth.adminRequests)}</strong>
            </div>
            <div>
              <span>Email enviado</span>
              <strong>
                {auth.adminRequests.filter((request) => request.email_status === "sent").length}
              </strong>
            </div>
          </div>

          <div className="admin-pipeline">
            {requestPipeline.map((item, index) => (
              <span key={item} className={index === 0 ? "active" : undefined}>
                {item}
              </span>
            ))}
          </div>

          {!auth.isAdmin ? (
            <div className="locked-flow small">
              <ShieldCheck size={24} />
              <h2>Painel protegido</h2>
              <p>Entre com o email admin para liberar os dados recebidos.</p>
            </div>
          ) : auth.adminRequests.length === 0 ? (
            <p className="empty-state">Nenhuma solicitacao recebida ainda.</p>
          ) : (
            <div className="request-list">
              {auth.adminRequests.map((request) => {
                const plan = getPlanByKey(request.plan_key);
                const snapshot = request.profile_snapshot;

                return (
                  <article key={request.id} className="request-item">
                    <div>
                      <span>{new Date(request.created_at).toLocaleDateString("pt-BR")}</span>
                      <strong>{snapshot.storeName || snapshot.companyName}</strong>
                      <small>{snapshot.email}</small>
                    </div>
                    <div>
                      <span>{plan.name}</span>
                      <strong>{request.status}</strong>
                      <small>{request.email_status}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
