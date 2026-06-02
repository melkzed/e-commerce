"use client";

import { ArrowRight, CheckCircle2, Loader2, UserRound } from "lucide-react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { ProfileForm } from "@/components/ProfileForm";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { getProfileCompleteness } from "@/lib/platform";

export function ProfilePage() {
  const auth = usePlatformAuth();
  const completeness = getProfileCompleteness(auth.profile);

  return (
    <main className="flow-shell">
      <section className="flow-hero compact-hero">
        <p>Area do cliente</p>
        <h1>Salve seus dados para pedir sua loja com mais rapidez.</h1>
        <span>
          Preencha uma vez. Depois o sistema usa essas informacoes no pedido e evita
          que voce repita tudo de novo.
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
            title="Conecte sua conta para gerenciar o perfil"
            text="Depois do login, seus dados ficam salvos para pedir sua loja sem repetir informacoes."
          />
        </section>
      ) : (
        <section className="profile-page-layout">
          <ProfileForm auth={auth} />

          <aside className="flow-panel profile-readiness">
            <UserRound size={24} />
            <h2>{completeness.isComplete ? "Perfil pronto" : "Perfil em andamento"}</h2>
            <p>
              Quando o perfil estiver completo, voce ja pode responder as perguntas e
              enviar o pedido da sua loja.
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
        </section>
      )}
    </main>
  );
}
