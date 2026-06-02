"use client";

import { BadgeCheck, Chrome, Loader2, LockKeyhole, LogOut } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfileCompleteness } from "@/lib/platform";
import type { usePlatformAuth } from "@/components/usePlatformAuth";

type AuthState = ReturnType<typeof usePlatformAuth>;

export function ProfileForm({
  auth,
  compact = false
}: {
  auth: AuthState;
  compact?: boolean;
}) {
  const completeness = getProfileCompleteness(auth.profile);

  return (
    <section className={compact ? "flow-panel profile-card compact" : "flow-panel profile-card"}>
      <div className="flow-heading">
        <div>
          <span>Conta do cliente</span>
          <h2>Dados para contato</h2>
        </div>
      </div>

      <div className="auth-card">
        {auth.authLoading ? (
          <div className="loading-row">
            <Loader2 className="spin" size={18} />
            Verificando sessao
          </div>
        ) : auth.isLoggedIn ? (
          <>
            <div>
              <strong>{auth.profile.fullName || "Cliente conectado"}</strong>
              <span>{auth.accountEmail}</span>
            </div>
            <button className="icon-action" type="button" onClick={auth.handleLogout}>
              <LogOut size={17} />
            </button>
          </>
        ) : (
          <>
            <div>
              <strong>Entre para solicitar</strong>
              <span>Use sua conta Google</span>
            </div>
            <button className="primary-flow-action compact" type="button" onClick={() => auth.handleGoogleLogin()}>
              <Chrome size={17} />
              Google
            </button>
          </>
        )}
      </div>

      {!isSupabaseConfigured && !auth.isLoggedIn && (
        <button className="secondary-flow-action full" type="button" onClick={auth.handleDemoLogin}>
          Entrar em modo demo
        </button>
      )}

      <div className="completion-block">
        <div>
          <span>Perfil completo</span>
          <strong>{completeness.percent}%</strong>
        </div>
        <i>
          <b style={{ width: `${completeness.percent}%` }} />
        </i>
      </div>

      <div className="profile-grid">
        <label>
          Nome
          <input
            value={auth.profile.fullName}
            onChange={(event) => auth.handleProfileChange("fullName", event.target.value)}
            placeholder="Seu nome"
          />
        </label>
        <label>
          Email
          <input value={auth.profile.email} disabled />
        </label>
        <label>
          Empresa
          <input
            value={auth.profile.companyName}
            onChange={(event) => auth.handleProfileChange("companyName", event.target.value)}
            placeholder="Nome da empresa ou marca"
          />
        </label>
        <label>
          CPF/CNPJ
          <input
            value={auth.profile.taxId}
            disabled={auth.taxIdLocked}
            onChange={(event) => auth.handleProfileChange("taxId", event.target.value)}
            placeholder="CPF ou CNPJ"
          />
        </label>
        <label>
          Telefone
          <input
            value={auth.profile.phone}
            onChange={(event) => auth.handleProfileChange("phone", event.target.value)}
            placeholder="WhatsApp para contato"
          />
        </label>
        <label>
          Segmento
          <input
            value={auth.profile.segment}
            onChange={(event) => auth.handleProfileChange("segment", event.target.value)}
            placeholder="Moda, mercado, servicos..."
          />
        </label>
        <label className="wide-field">
          Nome da loja
          <input
            value={auth.profile.storeName}
            onChange={(event) => auth.handleProfileChange("storeName", event.target.value)}
            placeholder="Nome que vai aparecer na loja"
          />
        </label>
      </div>

      <button className="primary-flow-action full" type="button" onClick={auth.saveProfile}>
        {auth.profileLoading ? <Loader2 className="spin" size={17} /> : <BadgeCheck size={17} />}
        {auth.profileSaved ? "Atualizar perfil" : "Salvar perfil"}
      </button>

      {auth.profileNotice && <p className="flow-note">{auth.profileNotice}</p>}

      <div className="lock-note">
        <LockKeyhole size={15} />
        Seus dados ficam salvos para facilitar o atendimento.
      </div>
    </section>
  );
}
