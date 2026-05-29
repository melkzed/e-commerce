"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Chrome,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Send,
  UserRound,
  WalletCards
} from "lucide-react";
import { useMemo, useState } from "react";
import { PlatformNav } from "@/components/PlatformNav";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { sendQuoteEmails } from "@/lib/emailjs";
import {
  ADMIN_EMAIL,
  getAnswerText,
  getProfileCompleteness,
  quoteQuestions,
  recommendPlan,
  type QuoteAnswers,
  type QuoteQuestion
} from "@/lib/platform";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type RequestStatus = "idle" | "saving" | "success" | "error";

export function QuotePage() {
  const auth = usePlatformAuth();
  const [answers, setAnswers] = useState<QuoteAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestNotice, setRequestNotice] = useState("");

  const completeness = useMemo(() => getProfileCompleteness(auth.profile), [auth.profile]);
  const recommendedPlan = useMemo(() => recommendPlan(answers), [answers]);
  const currentQuestion = quoteQuestions[activeQuestionIndex];
  const answeredCount = quoteQuestions.filter((question) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
  }).length;
  const allAnswersComplete = answeredCount === quoteQuestions.length;

  const setQuestionAnswer = (question: QuoteQuestion, value: string | string[]) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: value
    }));
  };

  const toggleMultiAnswer = (question: QuoteQuestion, option: string) => {
    const currentValue = answers[question.id];
    const selected = Array.isArray(currentValue) ? currentValue : [];
    const nextValue = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    setQuestionAnswer(question, nextValue);
  };

  const isQuestionAnswered = (question: QuoteQuestion) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
  };

  const goToNextQuestion = () => {
    if (!currentQuestion || !isQuestionAnswered(currentQuestion)) {
      setRequestNotice("Responda a pergunta atual para continuar.");
      return;
    }

    setRequestNotice("");

    if (activeQuestionIndex === quoteQuestions.length - 1) {
      setQuoteComplete(true);
      return;
    }

    setActiveQuestionIndex((index) => index + 1);
  };

  const resetQuote = () => {
    setAnswers({});
    setActiveQuestionIndex(0);
    setQuoteComplete(false);
    setRequestStatus("idle");
    setRequestNotice("");
  };

  const submitQuoteRequest = async () => {
    if (!auth.isLoggedIn) {
      setRequestNotice("Entre com Google ou modo demo antes de solicitar o orcamento.");
      return;
    }

    if (!completeness.isComplete) {
      setRequestNotice("Complete os dados do perfil na pagina Perfil antes de enviar.");
      return;
    }

    if (!allAnswersComplete) {
      setRequestNotice("Finalize as 5 perguntas antes de enviar.");
      return;
    }

    setRequestStatus("saving");
    setRequestNotice("");

    const plan = recommendPlan(answers);
    let requestId = crypto.randomUUID();
    let createdAt = new Date().toISOString();

    try {
      if (auth.supabase && auth.session?.user) {
        const { data, error } = await auth.supabase
          .from("quote_requests")
          .insert({
            user_id: auth.session.user.id,
            plan_key: plan.key,
            profile_snapshot: auth.profile,
            answers,
            status: "novo",
            admin_email: ADMIN_EMAIL,
            email_status: "pending"
          })
          .select("id, created_at")
          .single();

        if (error) {
          throw error;
        }

        requestId = data?.id || requestId;
        createdAt = data?.created_at || createdAt;
      }

      const emailResult = await sendQuoteEmails({
        requestId,
        profile: auth.profile,
        answers,
        recommendedPlan: plan.name
      });

      if (auth.supabase && auth.session?.user) {
        await auth.supabase
          .from("quote_requests")
          .update({ email_status: emailResult.status })
          .eq("id", requestId);
      }

      auth.setAdminRequests((current) => [
        {
          id: requestId,
          user_id: auth.session?.user.id || "demo",
          plan_key: plan.key,
          profile_snapshot: auth.profile,
          answers,
          status: "novo",
          admin_email: ADMIN_EMAIL,
          email_status: emailResult.status,
          created_at: createdAt
        },
        ...current
      ]);

      setRequestStatus("success");
      setRequestNotice(
        `${emailResult.detail} O pedido tambem fica disponivel no painel admin.`
      );
      await auth.refreshAdminRequests();
    } catch {
      setRequestStatus("error");
      setRequestNotice("Nao foi possivel enviar o pedido de orcamento agora.");
    }
  };

  const renderQuestionControl = (question: QuoteQuestion) => {
    const value = answers[question.id];

    if (question.type === "text") {
      return (
        <textarea
          className="question-input textarea"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => setQuestionAnswer(question, event.target.value)}
          placeholder={question.placeholder}
        />
      );
    }

    if (question.type === "number") {
      return (
        <input
          className="question-input"
          min={1}
          type="number"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => setQuestionAnswer(question, event.target.value)}
          placeholder={question.placeholder}
        />
      );
    }

    if (question.type === "single") {
      return (
        <div className="answer-options">
          {question.options?.map((option) => (
            <button
              key={option}
              className={clsx("answer-option", value === option && "active")}
              type="button"
              onClick={() => setQuestionAnswer(question, option)}
            >
              <span>{option}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="answer-options two-col">
        {question.options?.map((option) => {
          const selected = Array.isArray(value) && value.includes(option);

          return (
            <button
              key={option}
              className={clsx("answer-option", selected && "active")}
              type="button"
              onClick={() => toggleMultiAnswer(question, option)}
            >
              <span>{option}</span>
              {selected ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <main className="flow-shell">
      <PlatformNav variant="light" />

      <section className="quote-only-page">
        <div className="quote-only-head">
          <a href="/" className="back-link">
            <ArrowLeft size={16} />
            Voltar
          </a>
          <div>
            <p>Orcamento guiado</p>
            <h1>Chatbot de requisitos</h1>
            <span>Responda 5 perguntas. O valor sera analisado depois.</span>
          </div>
        </div>

        <div className="quote-focus-shell">
          <section className={clsx("flow-panel quote-workspace quote-chat-card", !auth.isLoggedIn && "locked-chat")}>
              <div className="flow-heading">
                <div>
                  <span>Chatbot de requisitos</span>
                  <h2>{quoteComplete ? "Resumo pronto" : currentQuestion?.prompt}</h2>
                </div>
                <strong>{answeredCount}/5</strong>
              </div>

              <div className="step-meter">
                <i style={{ width: `${(answeredCount / quoteQuestions.length) * 100}%` }} />
              </div>

              <div className="chat-context">
                <div className="bot-message">
                  <Bot size={18} />
                  <p>
                    Vou fazer perguntas diretas para montar um planejamento enxuto e
                    indicar qual assinatura combina com seu momento.
                  </p>
                </div>

                {quoteQuestions
                  .slice(0, quoteComplete ? quoteQuestions.length : activeQuestionIndex)
                  .map((question, index) => (
                    <button
                      className="answered-line"
                      key={question.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionIndex(index);
                        setQuoteComplete(false);
                      }}
                    >
                      <span>{question.label}</span>
                      <strong>{getAnswerText(answers[question.id])}</strong>
                    </button>
                  ))}
              </div>

              <AnimatePresence mode="wait">
                {!quoteComplete && currentQuestion ? (
                  <motion.div
                    key={currentQuestion.id}
                    className="question-stage"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div>
                      <span>Pergunta {activeQuestionIndex + 1}</span>
                      <h3>{currentQuestion.prompt}</h3>
                      <p>{currentQuestion.helper}</p>
                    </div>

                    {renderQuestionControl(currentQuestion)}

                    <div className="flow-actions">
                      <button
                        className="secondary-flow-action"
                        type="button"
                        onClick={() => setActiveQuestionIndex((index) => Math.max(0, index - 1))}
                        disabled={activeQuestionIndex === 0}
                      >
                        Voltar
                      </button>
                      <button className="primary-flow-action" type="button" onClick={goToNextQuestion}>
                        {activeQuestionIndex === quoteQuestions.length - 1
                          ? "Gerar resumo"
                          : "Proxima"}
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="summary"
                    className="quote-summary"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="summary-top">
                      <div>
                        <span>Plano sugerido</span>
                        <h3>{recommendedPlan.name}</h3>
                      </div>
                      <WalletCards size={24} />
                    </div>

                    <div className="summary-profile">
                      {[
                        ["Cliente", auth.profile.fullName || "Nao informado"],
                        ["Empresa", auth.profile.companyName || "Nao informado"],
                        ["Loja", auth.profile.storeName || "Nao informado"],
                        ["Documento", auth.profile.taxId || "Pendente"]
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="summary-answers">
                      {quoteQuestions.map((question, index) => (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => {
                            setActiveQuestionIndex(index);
                            setQuoteComplete(false);
                          }}
                        >
                          <span>{question.label}</span>
                          <strong>{getAnswerText(answers[question.id])}</strong>
                        </button>
                      ))}
                    </div>

                    <div className="flow-actions">
                      <button className="secondary-flow-action" type="button" onClick={resetQuote}>
                        <RefreshCw size={16} />
                        Refazer
                      </button>
                      <button
                        className="primary-flow-action"
                        type="button"
                        onClick={submitQuoteRequest}
                        disabled={requestStatus === "saving"}
                      >
                        {requestStatus === "saving" ? (
                          <Loader2 className="spin" size={17} />
                        ) : (
                          <Send size={17} />
                        )}
                        Enviar pedido
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {requestNotice && (
                <p className={clsx("flow-note", requestStatus === "error" && "danger")}>
                  {requestNotice}{" "}
                  {requestNotice.includes("Perfil") && (
                    <a className="inline-profile-link" href="/perfil">
                      Abrir perfil
                    </a>
                  )}
                </p>
              )}
          </section>

          {!auth.isLoggedIn && (
            <div className="quote-login-overlay">
              <section className="login-required-card">
                <div className="login-card-icon">
                  <LockKeyhole size={22} />
                </div>
                <div>
                  <span>Login necessario</span>
                  <h2>Entre para responder o chatbot</h2>
                  <p>
                    O orcamento precisa estar conectado ao seu perfil para gerar o
                    resumo, salvar no Supabase e enviar a confirmacao por email.
                  </p>
                </div>

                <div className="login-card-panel">
                  <div className="auth-avatar">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <strong>Acesso do cliente</strong>
                    <span>Google com Supabase Auth</span>
                  </div>
                </div>

                <button className="primary-flow-action full" type="button" onClick={auth.handleGoogleLogin}>
                  <Chrome size={17} />
                  Entrar com Google
                </button>

                {!isSupabaseConfigured && (
                  <button className="secondary-flow-action full" type="button" onClick={auth.handleDemoLogin}>
                    Entrar em modo demo
                  </button>
                )}

                {auth.profileNotice && <p className="flow-note">{auth.profileNotice}</p>}
              </section>
            </div>
          )}
        </div>

        {auth.isLoggedIn && !completeness.isComplete && (
          <aside className="flow-panel quote-profile-reminder">
            <div>
              <span>Perfil incompleto</span>
              <strong>Antes de enviar, complete seus dados cadastrais.</strong>
            </div>
            <a className="secondary-flow-action" href="/perfil">
              Abrir perfil
            </a>
          </aside>
        )}
      </section>
    </main>
  );
}
