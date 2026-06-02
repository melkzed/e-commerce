"use client";

import { Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { ADMIN_EMAIL, getPlanByKey, requestPipeline, type QuoteRequestRow } from "@/lib/platform";

function getTodayCount(requests: QuoteRequestRow[]) {
  const today = new Date().toDateString();

  return requests.filter((request) => new Date(request.created_at).toDateString() === today).length;
}

export function AdminPage() {
  const auth = usePlatformAuth();
  const todayCount = getTodayCount(auth.adminRequests);
  const emailSentCount = auth.adminRequests.filter((request) => request.email_status === "sent").length;

  if (auth.authLoading) {
    return (
      <main className="flow-shell">
        <section className="access-loading-card">
          <Loader2 className="spin" size={22} />
          Verificando acesso admin...
        </section>
      </main>
    );
  }

  if (!auth.isConnected) {
    return (
      <main className="flow-shell">
        <section className="flow-hero compact-hero command-hero">
          <p>Painel admin</p>
          <h1>Conecte a conta admin para abrir o painel.</h1>
          <span>Somente o email {ADMIN_EMAIL} pode visualizar os pedidos recebidos.</span>
        </section>

        <section className="access-page-wrap">
          <AuthAccessCard
            adminOnly
            auth={auth}
            eyebrow="Acesso admin"
            title="Entrar com email admin"
            text="Use a conta cadastrada como admin para liberar os pedidos dos clientes."
          />
        </section>
      </main>
    );
  }

  if (!auth.isAdmin) {
    return (
      <main className="flow-shell">
        <section className="access-page-wrap access-denied-wrap">
          <section className="command-center-card access-denied-card">
            <div className="login-card-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span>Acesso bloqueado</span>
              <h1>Esta conta nao tem permissao de admin.</h1>
              <p>
                Voce esta conectado como <strong>{auth.accountEmail}</strong>. Para abrir o painel,
                entre com <strong>{ADMIN_EMAIL}</strong>.
              </p>
            </div>
            <button className="secondary-flow-action" type="button" onClick={auth.handleLogout}>
              <LogOut size={17} />
              Sair desta conta
            </button>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flow-shell">
      <section className="flow-hero compact-hero command-hero">
        <p>Painel de controle</p>
        <h1>Veja os pedidos dos clientes e acompanhe o que precisa ser feito.</h1>
        <span>
          Aqui voce confere quem pediu um site, qual plano combina melhor e se o
          contato ja recebeu a confirmacao por email.
        </span>
      </section>

      <section className="command-center-card admin-command-center">
        <div className="command-center-top">
          <div>
            <span>Command Center</span>
            <h2>Painel admin</h2>
          </div>
          <div className="console-live">
            <i />
            Online
          </div>
        </div>

        <div className="command-stats-grid">
          {[
            ["Pedidos recebidos", auth.adminRequests.length, "Total"],
            ["Chegaram hoje", todayCount, "Hoje"],
            ["Email enviado", emailSentCount, "Confirmados"],
            ["Acesso", auth.isAdmin ? "Liberado" : "Bloqueado", "Admin"]
          ].map(([label, value, note]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>

        <div className="admin-command-grid">
          <aside className="admin-access command-subpanel">
            <ShieldCheck size={22} />
            <div>
              <span>Acesso</span>
              <h3>Admin conectado</h3>
            </div>
            <p>
              Voce esta conectado com o email autorizado para ver e organizar os pedidos.
            </p>
            <div className="admin-email-card">
              <span>Conta atual</span>
              <strong>{auth.accountEmail}</strong>
            </div>
            <button className="secondary-flow-action full" type="button" onClick={auth.handleLogout}>
              <LogOut size={17} />
              Sair
            </button>
          </aside>

          <section className="admin-workspace command-subpanel">
            <div className="flow-heading">
              <div>
                <span>Pedidos</span>
                <h2>Lista de clientes</h2>
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
                <p>Entre com a conta admin para liberar os dados dos clientes.</p>
              </div>
            ) : auth.adminRequests.length === 0 ? (
              <p className="empty-state">Nenhum pedido recebido ainda.</p>
            ) : (
              <div className="request-list admin-command-list">
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
        </div>
      </section>
    </main>
  );
}
