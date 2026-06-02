"use client";

import { Chrome, Loader2, LockKeyhole, LogOut, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { ADMIN_EMAIL } from "@/lib/platform";
import type { usePlatformAuth } from "@/components/usePlatformAuth";

type AuthState = ReturnType<typeof usePlatformAuth>;

export function AuthAccessCard({
  auth,
  title,
  text,
  eyebrow = "Acesso seguro",
  adminOnly = false
}: {
  auth: AuthState;
  title: string;
  text: string;
  eyebrow?: string;
  adminOnly?: boolean;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState(adminOnly ? ADMIN_EMAIL : "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await auth.handleEmailAuth({
      email,
      fullName,
      mode,
      password
    });
  };

  return (
    <section className="access-gate-card">
      <div className="access-gate-media">
        <img src="/assets/secure-access-visual.png" alt="" />
      </div>

      <div className="access-gate-content">
        <div className="login-card-icon">
          <LockKeyhole size={22} />
        </div>

        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>

        {auth.isLoggedIn ? (
          <div className="access-current-account">
            <Mail size={18} />
            <div>
              <span>Conta conectada</span>
              <strong>{auth.accountEmail}</strong>
            </div>
            <button className="icon-action" type="button" onClick={auth.handleLogout}>
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <>
            <form className="auth-email-form" onSubmit={handleSubmit}>
              {!adminOnly && mode === "register" && (
                <label>
                  Nome
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Seu nome"
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={adminOnly ? ADMIN_EMAIL : "voce@email.com"}
                  required
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimo de 6 caracteres"
                  required
                />
              </label>

              <button className="primary-flow-action full" type="submit" disabled={auth.authActionLoading}>
                {auth.authActionLoading ? <Loader2 className="spin" size={17} /> : <Mail size={17} />}
                {mode === "login" ? "Entrar com email" : "Criar conta"}
              </button>
            </form>

            <button className="secondary-flow-action full" type="button" onClick={() => auth.handleGoogleLogin()}>
              <Chrome size={17} />
              Entrar com Google
            </button>

            {!adminOnly && (
              <button
                className="text-switch-action"
                type="button"
                onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
              >
                {mode === "login" ? "Ainda nao tenho conta" : "Ja tenho conta"}
              </button>
            )}
          </>
        )}

        {auth.profileNotice && <p className="flow-note">{auth.profileNotice}</p>}
      </div>
    </section>
  );
}
