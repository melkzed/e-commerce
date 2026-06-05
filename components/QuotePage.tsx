"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronRight,
  Link2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  WalletCards
} from "lucide-react";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { TaxIdField } from "@/components/TaxIdField";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { sendQuoteEmails } from "@/lib/emailjs";
import {
  ADMIN_EMAIL,
  getAnswerText,
  getPlanByKey,
  getProfileCompleteness,
  quoteQuestions,
  recommendPlan,
  subscriptionPlans,
  validateQuoteAnswer,
  type ClientProfile,
  type QuoteAnswers,
  type QuotePlanSuggestion,
  type QuoteQuestion,
  type SubscriptionPlan
} from "@/lib/platform";

type RequestStatus = "idle" | "saving" | "success" | "error";

type RequirementChatResponse = {
  adminSummary: string;
  aiAvailable: boolean;
  answeredCount: number;
  assistantMessage: string;
  clientSummary: string;
  maxQuestions: number;
  moderationMessage?: string;
  nextQuestionId: string | null;
  planReason: string;
  progressPercent: number;
  recommendedPlan: QuotePlanSuggestion;
  status: "ask" | "blocked" | "summary";
  targetQuestionIndex?: number;
};

const QUOTE_DRAFT_PREFIX = "melkzedek-quote-draft";

type BrowserWindowWithAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function hasQuoteAnswer(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
}

const requiredProfileFields: Array<keyof ClientProfile> = [
  "fullName",
  "email",
  "companyName",
  "taxId",
  "segment",
  "storeName"
];

const profileFieldLabels: Record<keyof ClientProfile, string> = {
  fullName: "Nome",
  email: "E-mail",
  companyName: "Empresa",
  taxId: "CPF/CNPJ",
  phone: "Telefone",
  segment: "Segmento",
  storeName: "Nome da loja"
};

const inlineProfileFields: Array<{
  field: keyof ClientProfile;
  label: string;
  placeholder: string;
  required?: boolean;
}> = [
  { field: "fullName", label: "Nome", placeholder: "Seu nome", required: true },
  { field: "companyName", label: "Empresa", placeholder: "Nome da empresa ou marca", required: true },
  { field: "taxId", label: "CPF/CNPJ", placeholder: "CPF ou CNPJ", required: true },
  { field: "phone", label: "Telefone", placeholder: "WhatsApp para contato" },
  { field: "segment", label: "Segmento", placeholder: "Moda, mercado, serviços...", required: true },
  { field: "storeName", label: "Nome da loja", placeholder: "Nome que vai aparecer na loja", required: true }
];

function getDraftKey(userId?: string) {
  return userId ? `${QUOTE_DRAFT_PREFIX}:${userId}` : "";
}

function clampQuestionIndex(index: number) {
  return Math.min(Math.max(index, 0), quoteQuestions.length - 1);
}

export function QuotePage() {
  const auth = usePlatformAuth();
  const chatTranscriptRef = useRef<HTMLDivElement | null>(null);
  const zezeAudioContextRef = useRef<AudioContext | null>(null);
  const [answers, setAnswers] = useState<QuoteAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestNotice, setRequestNotice] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiPlanReason, setAiPlanReason] = useState("");
  const [aiPlanSuggestion, setAiPlanSuggestion] = useState<QuotePlanSuggestion | null>(null);
  const [aiRequirementSummary, setAiRequirementSummary] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [serviceNote, setServiceNote] = useState("");
  const [referenceLinks, setReferenceLinks] = useState("");

  const completeness = useMemo(() => getProfileCompleteness(auth.profile), [auth.profile]);
  const canUseZeze = auth.isConnected && completeness.isComplete;
  const recommendedPlan = useMemo(
    () => selectedPlan ?? (aiPlanSuggestion ? getPlanByKey(aiPlanSuggestion.key) : recommendPlan(answers)),
    [aiPlanSuggestion, answers, selectedPlan]
  );
  const draftKey = useMemo(() => getDraftKey(auth.session?.user.id), [auth.session?.user.id]);
  const missingProfileFields = useMemo(
    () => requiredProfileFields.filter((field) => !auth.profile[field].trim()),
    [auth.profile]
  );
  const currentQuestion = quoteQuestions[activeQuestionIndex];
  const visibleAnsweredQuestions = quoteQuestions
    .slice(0, quoteComplete ? quoteQuestions.length : activeQuestionIndex)
    .filter((question) => hasQuoteAnswer(answers[question.id]));
  const answeredCount = quoteQuestions.filter((question) => {
    return hasQuoteAnswer(answers[question.id]);
  }).length;
  const allAnswersComplete = answeredCount === quoteQuestions.length;
  const progressPercent = Math.round((answeredCount / quoteQuestions.length) * 100);
  const remainingQuestions = Math.max(quoteQuestions.length - answeredCount, 0);
  const currentAssistantMessage =
    currentQuestion && activeQuestionIndex === answeredCount && aiMessage
      ? aiMessage
      : currentQuestion?.prompt;

  const getZezeAudioContext = () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!zezeAudioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext || (window as BrowserWindowWithAudio).webkitAudioContext;

      if (!AudioContextConstructor) {
        return null;
      }

      zezeAudioContextRef.current = new AudioContextConstructor();
    }

    return zezeAudioContextRef.current;
  };

  const primeZezeSound = () => {
    const context = getZezeAudioContext();

    if (context?.state === "suspended") {
      void context.resume().catch(() => null);
    }
  };

  const playZezeNotification = () => {
    const context = getZezeAudioContext();

    if (!context) {
      return;
    }

    const playChime = () => {
      const startedAt = context.currentTime;
      const masterGain = context.createGain();

      masterGain.gain.setValueAtTime(0.0001, startedAt);
      masterGain.gain.exponentialRampToValueAtTime(0.05, startedAt + 0.02);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.42);
      masterGain.connect(context.destination);

      [659.25, 880].forEach((frequency, index) => {
        const offset = index * 0.09;
        const oscillator = context.createOscillator();
        const noteGain = context.createGain();
        const noteStart = startedAt + offset;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.exponentialRampToValueAtTime(index === 0 ? 0.34 : 0.24, noteStart + 0.018);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.2);

        oscillator.connect(noteGain);
        noteGain.connect(masterGain);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.22);
      });

      window.setTimeout(() => masterGain.disconnect(), 520);
    };

    if (context.state === "suspended") {
      void context.resume().then(playChime).catch(() => null);
      return;
    }

    playChime();
  };

  useEffect(() => {
    const selectedKey = new URLSearchParams(window.location.search).get("plan");
    const planFromUrl = subscriptionPlans.find((plan) => plan.key === selectedKey) ?? null;
    setSelectedPlan(planFromUrl);
  }, []);

  useEffect(() => {
    const transcript = chatTranscriptRef.current;

    if (!transcript) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollChatToBottom = () => {
      transcript.scrollTo({
        top: transcript.scrollHeight,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    };

    const animationFrame = window.requestAnimationFrame(scrollChatToBottom);
    const settleTimer = window.setTimeout(scrollChatToBottom, 120);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
    };
  }, [activeQuestionIndex, aiLoading, currentAssistantMessage, quoteComplete]);

  useEffect(() => {
    if (!draftKey) {
      setDraftLoaded(false);
      return;
    }

    setDraftLoaded(false);

    try {
      const stored = window.localStorage.getItem(draftKey);

      if (stored) {
        const draft = JSON.parse(stored) as {
          activeQuestionIndex?: number;
          aiMessage?: string;
          aiPlanReason?: string;
          aiPlanSuggestion?: QuotePlanSuggestion | null;
          aiRequirementSummary?: string;
          answers?: QuoteAnswers;
          quoteComplete?: boolean;
          referenceLinks?: string;
          serviceNote?: string;
          selectedPlanKey?: string;
        };

        setAnswers(draft.answers || {});
        setActiveQuestionIndex(clampQuestionIndex(Number(draft.activeQuestionIndex || 0)));
        setAiMessage(draft.aiMessage || "");
        setAiPlanReason(draft.aiPlanReason || "");
        setAiPlanSuggestion(draft.aiPlanSuggestion || null);
        setAiRequirementSummary(draft.aiRequirementSummary || "");
        setQuoteComplete(Boolean(draft.quoteComplete));
        setReferenceLinks(draft.referenceLinks || "");
        setServiceNote(draft.serviceNote || "");

        const planFromUrl = new URLSearchParams(window.location.search).get("plan");
        const planFromDraft = subscriptionPlans.find((plan) => plan.key === draft.selectedPlanKey);

        if (!planFromUrl && planFromDraft) {
          setSelectedPlan(planFromDraft);
        }

        setRequestNotice("Rascunho recuperado. Você pode continuar de onde parou.");
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    } finally {
      setDraftLoaded(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftLoaded || requestStatus === "success") {
      return;
    }

    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        activeQuestionIndex,
        aiMessage,
        aiPlanReason,
        aiPlanSuggestion,
        aiRequirementSummary,
        answers,
        quoteComplete,
        referenceLinks,
        serviceNote,
        selectedPlanKey: selectedPlan?.key,
        updatedAt: new Date().toISOString()
      })
    );
  }, [
    activeQuestionIndex,
    aiMessage,
    aiPlanReason,
    aiPlanSuggestion,
    aiRequirementSummary,
    answers,
    draftKey,
    draftLoaded,
    quoteComplete,
    referenceLinks,
    requestStatus,
    selectedPlan?.key,
    serviceNote
  ]);

  const setQuestionAnswer = (question: QuoteQuestion, value: string | string[]) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: value
    }));
    setRequestNotice("");
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
    return hasQuoteAnswer(answers[question.id]);
  };

  const clearQuoteDraft = () => {
    if (draftKey) {
      window.localStorage.removeItem(draftKey);
    }
  };

  const buildLocalRequirementSummary = (requestAnswers: QuoteAnswers, planName: string) => {
    const conversation = quoteQuestions
      .filter((question) => {
        const value = requestAnswers[question.id];
        return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
      })
      .map((question) => `${question.label}: ${getAnswerText(requestAnswers[question.id])}`)
      .join(" | ");

    return `Plano indicado: ${planName}. Respostas do levantamento: ${conversation || "sem respostas completas"}.`;
  };

  const syncRequirementAi = async (nextAnswers: QuoteAnswers) => {
    setAiLoading(true);

    try {
      const response = await fetch("/api/requirements-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          answers: nextAnswers,
          profile: auth.profile,
          selectedPlanKey: selectedPlan?.key || null
        })
      });

      if (!response.ok) {
        throw new Error("AI requirements route failed");
      }

      const result = (await response.json()) as RequirementChatResponse;

      setAiMessage(result.assistantMessage);
      setAiPlanReason(result.planReason || result.recommendedPlan.reason);
      setAiPlanSuggestion(result.recommendedPlan);
      setAiRequirementSummary(result.adminSummary || result.clientSummary);

      if (result.status === "blocked") {
        const blockedIndex =
          typeof result.targetQuestionIndex === "number"
            ? result.targetQuestionIndex
            : quoteQuestions.findIndex((question) => question.id === result.nextQuestionId);

        setRequestNotice(result.moderationMessage || result.assistantMessage);
        setQuoteComplete(false);
        setActiveQuestionIndex(blockedIndex >= 0 ? blockedIndex : activeQuestionIndex);
        return;
      }

      playZezeNotification();

      if (!result.aiAvailable) {
        setRequestNotice("");
      }

      if (result.status === "summary" || !result.nextQuestionId) {
        setQuoteComplete(true);
        return;
      }

      const nextIndex = quoteQuestions.findIndex((question) => question.id === result.nextQuestionId);
      setActiveQuestionIndex(nextIndex >= 0 ? nextIndex : activeQuestionIndex + 1);
    } catch {
      const nextIndex = activeQuestionIndex + 1;

      setAiMessage("");
      setRequestNotice("");

      if (nextIndex >= quoteQuestions.length) {
        setQuoteComplete(true);
        return;
      }

      setActiveQuestionIndex(nextIndex);
    } finally {
      setAiLoading(false);
    }
  };

  const goToNextQuestion = async () => {
    if (!canUseZeze) {
      setRequestNotice("Complete e salve todos os dados do perfil para conversar com o Zezé.");
      return;
    }

    if (!currentQuestion || !isQuestionAnswered(currentQuestion)) {
      setRequestNotice("Responda a pergunta atual para continuar.");
      return;
    }

    const validation = validateQuoteAnswer(currentQuestion, answers[currentQuestion.id]);

    if (!validation.isValid) {
      setRequestNotice(validation.message);
      return;
    }

    setRequestNotice("");
    primeZezeSound();
    await syncRequirementAi({ ...answers });
  };

  const resetQuote = () => {
    clearQuoteDraft();
    setAnswers({});
    setActiveQuestionIndex(0);
    setAiMessage("");
    setAiPlanReason("");
    setAiPlanSuggestion(null);
    setAiRequirementSummary("");
    setQuoteComplete(false);
    setReferenceLinks("");
    setServiceNote("");
    setRequestStatus("idle");
    setRequestNotice("Rascunho limpo. Você pode preencher novamente.");
  };

  const startNewQuote = () => {
    clearQuoteDraft();
    setAnswers({});
    setActiveQuestionIndex(0);
    setAiMessage("");
    setAiPlanReason("");
    setAiPlanSuggestion(null);
    setAiRequirementSummary("");
    setQuoteComplete(false);
    setReferenceLinks("");
    setServiceNote("");
    setRequestStatus("idle");
    setRequestNotice("Nova solicitação iniciada. Preencha as perguntas para enviar outro orçamento.");
  };

  const submitQuoteRequest = async () => {
    if (!auth.isConnected) {
      setRequestNotice("Entre na sua conta antes de enviar o orçamento.");
      return;
    }

    if (!completeness.isComplete) {
      setRequestNotice("Complete e salve os dados de perfil acima antes de enviar.");
      return;
    }

    if (!allAnswersComplete) {
      setRequestNotice(`Finalize as ${quoteQuestions.length} perguntas antes de enviar.`);
      return;
    }

    setRequestStatus("saving");
    setRequestNotice("");

    const plan = recommendedPlan;
    const requestAnswers: QuoteAnswers = { ...answers };
    const trimmedServiceNote = serviceNote.trim();
    const trimmedReferenceLinks = referenceLinks.trim();

    if (trimmedServiceNote) {
      requestAnswers.service_note = trimmedServiceNote;
    }

    if (trimmedReferenceLinks) {
      requestAnswers.reference_links = trimmedReferenceLinks;
    }

    requestAnswers.ai_answered_questions = `${answeredCount}/${quoteQuestions.length}`;
    requestAnswers.ai_recommended_plan = plan.name;
    requestAnswers.ai_plan_reason = aiPlanReason || plan.idealFor;
    requestAnswers.ai_requirement_summary =
      aiRequirementSummary || buildLocalRequirementSummary(requestAnswers, plan.name);

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
            answers: requestAnswers,
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

      await auth.createSubscriptionRequest(plan.key, requestId);

      const emailResult = await sendQuoteEmails({
        requestId,
        profile: auth.profile,
        answers: requestAnswers,
        recommendedPlan: plan.name,
        referenceLinks,
        serviceNote
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
          answers: requestAnswers,
          status: "novo",
          admin_email: ADMIN_EMAIL,
          email_status: emailResult.status,
          created_at: createdAt
        },
        ...current
      ]);

      setRequestStatus("success");
      clearQuoteDraft();
      setRequestNotice(
        `${emailResult.detail} O orçamento também fica disponível no painel admin.`
      );
      await auth.refreshAdminRequests();
    } catch {
      setRequestStatus("error");
      setRequestNotice("Não foi possível enviar o orçamento agora.");
    }
  };

  const renderQuestionControl = (question: QuoteQuestion) => {
    const value = answers[question.id];

    if (question.type === "text") {
      return (
        <input
          className="chat-composer-input"
          disabled={!canUseZeze}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => setQuestionAnswer(question, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void goToNextQuestion();
            }
          }}
          placeholder={question.placeholder}
        />
      );
    }

    if (question.type === "number") {
      return (
        <input
          className="chat-composer-input"
          disabled={!canUseZeze}
          min={1}
          type="number"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => setQuestionAnswer(question, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void goToNextQuestion();
            }
          }}
          placeholder={question.placeholder}
        />
      );
    }

    if (question.type === "single") {
      return (
        <div className="quick-reply-grid">
          {question.options?.map((option) => (
            <button
              key={option}
              className={clsx("quick-reply-chip", value === option && "active")}
              disabled={!canUseZeze}
              type="button"
              onClick={() => setQuestionAnswer(question, option)}
            >
              <span>{option}</span>
              {value === option ? <Check size={15} /> : <ChevronRight size={15} />}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="quick-reply-grid multi">
        {question.options?.map((option) => {
          const selected = Array.isArray(value) && value.includes(option);

          return (
            <button
              key={option}
              className={clsx("quick-reply-chip", selected && "active")}
              disabled={!canUseZeze}
              type="button"
              onClick={() => toggleMultiAnswer(question, option)}
            >
              <span>{option}</span>
              {selected ? <Check size={15} /> : <ChevronRight size={15} />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <main className="flow-shell" aria-labelledby="quote-page-title">
      <section className="quote-only-page">
        <div className="quote-only-head">
          <a href="/" className="back-link">
            <ArrowLeft size={16} />
            Voltar
          </a>
          <div>
            <p>Zezé</p>
            <h1 id="quote-page-title">Converse sobre a loja que voce quer montar.</h1>
            <span>
              {selectedPlan
                ? `Voce escolheu ${selectedPlan.name}. O Zezé fara ate ${quoteQuestions.length} perguntas objetivas para confirmar as necessidades do site.`
                : `Converse com o Zezé. Ele fara no maximo ${quoteQuestions.length} perguntas rapidas e indicara o plano ideal.`}
            </span>
          </div>
        </div>

        {auth.isConnected && !completeness.isComplete && (
          <section className="flow-panel quote-inline-profile">
            <div className="quote-inline-profile-head">
              <div>
                <span>Perfil incompleto</span>
                <h2>Complete os dados para enviar o orçamento.</h2>
                <p>
                  Você pode preencher aqui mesmo. Não precisa sair para a página de perfil.
                </p>
              </div>
              <strong>{completeness.percent}%</strong>
            </div>

            <div className="quote-missing-list" aria-label="Dados faltando">
              <span>Faltam:</span>
              {missingProfileFields.map((field) => (
                <strong key={field}>{profileFieldLabels[field]}</strong>
              ))}
            </div>

            <div className="profile-grid quote-profile-grid">
              {inlineProfileFields.map((field) =>
                field.field === "taxId" ? (
                  <TaxIdField key={field.field} auth={auth} required={field.required} />
                ) : (
                  <label key={field.field} className={field.field === "storeName" ? "wide-field" : undefined}>
                    {field.label}
                    {field.required && <small>Obrigatório</small>}
                    <input
                      value={auth.profile[field.field]}
                      onChange={(event) => auth.handleProfileChange(field.field, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  </label>
                )
              )}
            </div>

            <button
              className="primary-flow-action full"
              type="button"
              onClick={auth.saveProfile}
              disabled={auth.profileLoading}
            >
              {auth.profileLoading ? <Loader2 className="spin" size={17} /> : <BadgeCheck size={17} />}
              Salvar dados e continuar
            </button>

            {auth.profileNotice && <p className="flow-note">{auth.profileNotice}</p>}
          </section>
        )}

        <div className="quote-focus-shell">
          <section className={clsx("flow-panel quote-workspace quote-chat-card", !canUseZeze && "locked-chat")}>
              <div className="flow-heading">
                <div>
                  <span>Zezé IA</span>
                  <h2>{quoteComplete ? "Plano indicado" : "Conversa com Zezé"}</h2>
                </div>
                <strong>{progressPercent}%</strong>
              </div>

              <div className="step-meter">
                <i style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="chat-progress-detail">
                <span>
                  {answeredCount} de {quoteQuestions.length} perguntas respondidas
                </span>
                <strong>
                  {remainingQuestions === 0
                    ? "Conversa pronta"
                    : `Faltam ${remainingQuestions} pergunta${remainingQuestions === 1 ? "" : "s"}`}
                </strong>
              </div>

              <div className="chat-meta-row">
                {auth.isConnected && (
                  <div className="quote-draft-pill">
                    Rascunho salvo automaticamente neste navegador.
                  </div>
                )}

                {selectedPlan && (
                  <div className="selected-plan-inline">
                    <span>Plano travado para este orçamento</span>
                    <strong>{selectedPlan.name}</strong>
                    <small>{selectedPlan.idealFor}</small>
                  </div>
                )}
              </div>

              <div
                className="chat-transcript"
                ref={chatTranscriptRef}
                aria-label="Histórico da conversa com o Zezé"
                aria-live="polite"
                role="log"
              >
                <div className="chat-line ai">
                  <span className="chat-avatar">
                    <Bot size={16} />
                  </span>
                  <div className="chat-bubble">
                    <strong>Zezé</strong>
                    <p>
                      {selectedPlan
                        ? `Vi que voce escolheu ${selectedPlan.name}. Vou entender sua loja antes de confirmar se esse plano encaixa mesmo.`
                        : "Oi! Vou entender sua loja em uma conversa rapida. Responda do seu jeito; eu organizo as informacoes e indico o plano que melhor encaixa."}
                    </p>
                  </div>
                </div>

                {visibleAnsweredQuestions.map((question, index) => (
                  <div
                    className="chat-exchange"
                    key={question.id}
                  >
                    <button
                      className="chat-line ai editable"
                      key={question.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionIndex(index);
                        setQuoteComplete(false);
                      }}
                    >
                      <span className="chat-avatar">
                        <Bot size={16} />
                      </span>
                      <span className="chat-bubble">
                        <strong>Zezé</strong>
                        <p>{question.prompt}</p>
                        <small>{question.helper}</small>
                      </span>
                    </button>

                    <div className="chat-line user">
                      <div className="chat-bubble">
                        <strong>Voce</strong>
                        <p>{getAnswerText(answers[question.id])}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!quoteComplete && currentQuestion && (
                  <div className="chat-line ai current">
                    <span className="chat-avatar">
                      <Bot size={16} />
                    </span>
                    <div className="chat-bubble">
                      <strong>Zezé</strong>
                      <p>{currentAssistantMessage}</p>
                      <small>{currentQuestion.helper}</small>
                    </div>
                  </div>
                )}

                {aiLoading && (
                  <div className="chat-line ai">
                    <span className="chat-avatar">
                      <Loader2 className="spin" size={16} />
                    </span>
                    <div className="chat-bubble typing-bubble">
                      <strong>Zezé</strong>
                      <p>Lendo sua resposta e preparando a proxima pergunta...</p>
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!quoteComplete && currentQuestion ? (
                  <motion.div
                    key={currentQuestion.id}
                    className="chat-composer-panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="chat-composer-head">
                      <span>Pergunta {activeQuestionIndex + 1} de {quoteQuestions.length}</span>
                      <p>Responda como se estivesse falando com o Zezé.</p>
                    </div>

                    {renderQuestionControl(currentQuestion)}

                    <div className="flow-actions">
                      <button
                        className="secondary-flow-action"
                        type="button"
                        onClick={() => setActiveQuestionIndex((index) => Math.max(0, index - 1))}
                        disabled={!canUseZeze || activeQuestionIndex === 0 || aiLoading}
                      >
                        Voltar
                      </button>
                      <button
                        className="primary-flow-action"
                        type="button"
                        onClick={goToNextQuestion}
                        disabled={!canUseZeze || aiLoading || !isQuestionAnswered(currentQuestion)}
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="spin" size={17} />
                            Analisando
                          </>
                        ) : activeQuestionIndex === quoteQuestions.length - 1 ? (
                          "Ver plano indicado"
                        ) : (
                          "Enviar resposta"
                        )}
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
                    <div className="chat-line ai final">
                      <span className="chat-avatar">
                        <Bot size={16} />
                      </span>
                      <div className="chat-bubble">
                        <strong>Zezé</strong>
                        <p>
                          Pelo que voce contou, este e o plano que faz mais sentido para comecar com foco e sem contratar recursos desnecessarios.
                        </p>
                      </div>
                    </div>

                    <div className="summary-top final-plan-result">
                      <div>
                        <span>{selectedPlan ? "Plano escolhido" : "Plano sugerido"}</span>
                        <h3>{recommendedPlan.name}</h3>
                        <p>{aiPlanReason || recommendedPlan.idealFor}</p>
                      </div>
                      <WalletCards size={24} />
                    </div>

                    <div className="quote-observation-bubble">
                      <div>
                        <MessageSquareText size={18} />
                        <span>Observação para o projeto</span>
                      </div>
                      <textarea
                        value={serviceNote}
                        onChange={(event) => setServiceNote(event.target.value)}
                        placeholder="Ex.: preciso de integração com ERP, pagamento recorrente, prazo específico, layout parecido com uma referência..."
                      />
                      <small>
                        Essa observação aparece no e-mail e no painel admin junto do orçamento.
                      </small>
                    </div>

                    <div className="quote-reference-field">
                      <label htmlFor="quote-reference-links">
                        <div>
                          <Link2 size={18} />
                          <span>Links de referência</span>
                        </div>
                        <small>Opcional. Use para mandar exemplos de sites, layouts ou lojas que você gostou.</small>
                      </label>
                      <input
                        id="quote-reference-links"
                        className="question-input"
                        value={referenceLinks}
                        onChange={(event) => setReferenceLinks(event.target.value)}
                        placeholder="Ex.: https://site1.com, https://site2.com"
                      />
                    </div>

                    {requestStatus === "success" ? (
                      <div className="flow-actions">
                        <button className="primary-flow-action" type="button" onClick={startNewQuote}>
                          <RefreshCw size={16} />
                          Fazer nova solicitação
                        </button>
                      </div>
                    ) : (
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
                          Enviar orçamento
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {requestNotice && (
                <p className={clsx("flow-note", requestStatus === "error" && "danger")}>
                  {requestNotice}
                </p>
              )}
          </section>

          {!auth.isConnected && (
            <div className="quote-login-overlay">
              <AuthAccessCard
                auth={auth}
                eyebrow="Login necessário"
                title="Entre para salvar seu orçamento"
                text="Assim seu orçamento fica ligado ao seu perfil e você recebe a confirmação por e-mail."
              />
            </div>
          )}

          {auth.isConnected && !completeness.isComplete && (
            <div className="quote-login-overlay quote-profile-lock-overlay">
              <section className="command-center-card quote-profile-lock-card">
                <BadgeCheck size={22} />
                <div>
                  <span>Perfil incompleto</span>
                  <h2>Complete todos os dados para falar com o Zezé.</h2>
                  <p>
                    O campo de resposta fica bloqueado até o cadastro chegar a 100%.
                    Preencha os dados acima e salve o perfil para liberar a conversa.
                  </p>
                </div>
                <strong>{completeness.percent}% preenchido</strong>
              </section>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
