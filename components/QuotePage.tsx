"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Loader2,
  RefreshCw,
  Send,
  WalletCards
} from "lucide-react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { useEffect, useMemo, useState } from "react";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { sendQuoteEmails } from "@/lib/emailjs";
import {
  ADMIN_EMAIL,
  getAnswerText,
  getProfileCompleteness,
  quoteQuestions,
  recommendPlan,
  subscriptionPlans,
  type QuoteAnswers,
  type QuoteQuestion,
  type SubscriptionPlan
} from "@/lib/platform";

type RequestStatus = "idle" | "saving" | "success" | "error";

export function QuotePage() {
  const auth = usePlatformAuth();
  const [answers, setAnswers] = useState<QuoteAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestNotice, setRequestNotice] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const completeness = useMemo(() => getProfileCompleteness(auth.profile), [auth.profile]);
  const recommendedPlan = useMemo(() => selectedPlan ?? recommendPlan(answers), [answers, selectedPlan]);
  const currentQuestion = quoteQuestions[activeQuestionIndex];
  const answeredCount = quoteQuestions.filter((question) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
  }).length;
  const allAnswersComplete = answeredCount === quoteQuestions.length;

  useEffect(() => {
    const selectedKey = new URLSearchParams(window.location.search).get("plan");
    const planFromUrl = subscriptionPlans.find((plan) => plan.key === selectedKey) ?? null;
    setSelectedPlan(planFromUrl);
  }, []);

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
    if (!auth.isConnected) {
      setRequestNotice("Entre na sua conta antes de enviar o pedido.");
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

    const plan = recommendedPlan;
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
      <section className="quote-only-page">
        <div className="quote-only-head">
          <a href="/" className="back-link">
            <ArrowLeft size={16} />
            Voltar
          </a>
          <div>
            <p>Pedido guiado</p>
            <h1>Conte o que sua loja precisa.</h1>
            <span>
              {selectedPlan
                ? `Voce escolheu ${selectedPlan.name}. Responda 5 perguntas para confirmar as necessidades do site.`
                : "Responda 5 perguntas simples. Depois eu analiso e indico o melhor caminho."}
            </span>
          </div>
        </div>

        <div className="quote-focus-shell">
          <section className={clsx("flow-panel quote-workspace quote-chat-card", !auth.isConnected && "locked-chat")}>
              <div className="flow-heading">
                <div>
                  <span>Pedido da loja</span>
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
                    {selectedPlan
                      ? `Plano escolhido: ${selectedPlan.name}. Vou confirmar catalogo, recursos, prazo e operacao antes de enviar o pedido.`
                      : "Vou te guiar passo a passo. No final, voce recebe uma sugestao de plano para comecar sem pagar por coisa desnecessaria."}
                  </p>
                </div>

                {selectedPlan && (
                  <div className="selected-plan-inline">
                    <span>Plano travado para este pedido</span>
                    <strong>{selectedPlan.name}</strong>
                    <small>{selectedPlan.idealFor}</small>
                  </div>
                )}

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
                        <span>{selectedPlan ? "Plano escolhido" : "Plano sugerido"}</span>
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

          {!auth.isConnected && (
            <div className="quote-login-overlay">
              <AuthAccessCard
                auth={auth}
                eyebrow="Login necessario"
                title="Entre para salvar seu pedido"
                text="Assim seu pedido fica ligado ao seu perfil e voce recebe a confirmacao por email."
              />
            </div>
          )}
        </div>

        {auth.isConnected && !completeness.isComplete && (
          <aside className="flow-panel quote-profile-reminder">
            <div>
              <span>Perfil incompleto</span>
              <strong>Antes de enviar, complete seus dados de contato.</strong>
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
