"use client";

import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { PlatformNav } from "@/components/PlatformNav";
import { ProfileForm } from "@/components/ProfileForm";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { getProfileCompleteness } from "@/lib/platform";

export function ProfilePage() {
  const auth = usePlatformAuth();
  const completeness = getProfileCompleteness(auth.profile);

  return (
    <main className="flow-shell">
      <PlatformNav variant="light" />

      <section className="flow-hero compact-hero">
        <p>Area do cliente</p>
        <h1>Complete seu perfil uma vez e use os dados no orcamento.</h1>
        <span>
          Dados sensiveis como email e CPF/CNPJ ficam vinculados ao cadastro e nao
          entram no fluxo de edicao livre.
        </span>
      </section>

      <section className="profile-page-layout">
        <ProfileForm auth={auth} />

        <aside className="flow-panel profile-readiness">
          <UserRound size={24} />
          <h2>{completeness.isComplete ? "Perfil pronto" : "Perfil em andamento"}</h2>
          <p>
            O chatbot libera o envio quando o perfil estiver completo e as 5 perguntas
            tiverem sido respondidas.
          </p>

          <div className="readiness-list">
            {[
              ["Login", auth.isLoggedIn],
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
            Ir para o chatbot
            <ArrowRight size={17} />
          </a>
        </aside>
      </section>
    </main>
  );
}
