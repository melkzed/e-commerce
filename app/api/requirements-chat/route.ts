import { NextResponse } from "next/server";
import {
  getAnswerText,
  getPlanByKey,
  quoteQuestions,
  recommendPlan,
  subscriptionPlans,
  validateQuoteAnswer,
  type ClientProfile,
  type QuoteAnswers,
  type QuoteQuestion,
  type SubscriptionKey
} from "@/lib/platform";

export const dynamic = "force-dynamic";

type AiTurn = {
  adminSummary: string;
  assistantMessage: string;
  clientSummary: string;
  planReason: string;
};

const planKeys: SubscriptionKey[] = ["starter", "growth", "scale"];

function isAnswerFilled(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());
}

function readPlanKey(value: unknown) {
  return planKeys.includes(value as SubscriptionKey) ? (value as SubscriptionKey) : null;
}

function getAnsweredQuestions(answers: QuoteAnswers) {
  return quoteQuestions
    .filter((question) => isAnswerFilled(answers[question.id]))
    .map((question) => ({
      id: question.id,
      label: question.label,
      question: question.prompt,
      answer: getAnswerText(answers[question.id])
    }));
}

function getNextQuestion(answers: QuoteAnswers) {
  return quoteQuestions.find((question) => !isAnswerFilled(answers[question.id])) ?? null;
}

function getInvalidAnsweredQuestion(answers: QuoteAnswers) {
  return quoteQuestions
    .filter((question) => isAnswerFilled(answers[question.id]))
    .map((question) => ({
      question,
      validation: validateQuoteAnswer(question, answers[question.id])
    }))
    .find((item) => !item.validation.isValid) ?? null;
}

function getRecommendedPlan(answers: QuoteAnswers, selectedPlanKey: SubscriptionKey | null) {
  return selectedPlanKey ? getPlanByKey(selectedPlanKey) : recommendPlan(answers);
}

function buildPlanReason(planKey: SubscriptionKey, answers: QuoteAnswers) {
  const catalogSize = Number(answers.catalog_size || 0);
  const integrations = getAnswerText(answers.integrations_need);
  const features = getAnswerText(answers.must_have_features);
  const priority = getAnswerText(answers.main_priority);

  if (planKey === "scale") {
    return `Indicado porque a operacao pede mais controle: catalogo de ${catalogSize || "tamanho nao informado"}, prioridade em ${priority} e integracoes/recursos como ${integrations || features}.`;
  }

  if (planKey === "growth") {
    return `Indicado porque a loja precisa vender com mais rotina: catalogo de ${catalogSize || "tamanho nao informado"}, recursos como ${features} e prioridade em ${priority}.`;
  }

  return "Indicado porque a necessidade principal e colocar uma loja objetiva no ar, validar vendas e evoluir os recursos depois.";
}

function buildFallbackSummary(profile: ClientProfile, answers: QuoteAnswers, planName: string) {
  const answered = getAnsweredQuestions(answers);
  const clientLabel = profile.storeName || profile.companyName || profile.fullName || "Cliente";
  const details = answered.map((item) => `${item.label}: ${item.answer}`).join(" | ");

  return `${clientLabel} respondeu ${answered.length} perguntas de levantamento. Plano indicado: ${planName}. Respostas: ${details || "sem respostas completas"}.`;
}

function getOutputText(responseJson: unknown) {
  if (!responseJson || typeof responseJson !== "object") {
    return "";
  }

  const response = responseJson as {
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
    output_text?: string;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text): text is string => Boolean(text))
    .join("\n") || "";
}

function normalizeAiTurn(value: unknown): AiTurn | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Partial<AiTurn>;

  if (
    typeof data.assistantMessage !== "string" ||
    typeof data.adminSummary !== "string" ||
    typeof data.clientSummary !== "string" ||
    typeof data.planReason !== "string"
  ) {
    return null;
  }

  return {
    adminSummary: data.adminSummary,
    assistantMessage: data.assistantMessage,
    clientSummary: data.clientSummary,
    planReason: data.planReason
  };
}

async function getAiTurn({
  answeredQuestions,
  answers,
  nextQuestion,
  planName,
  progressPercent,
  profile
}: {
  answeredQuestions: ReturnType<typeof getAnsweredQuestions>;
  answers: QuoteAnswers;
  nextQuestion: QuoteQuestion | null;
  planName: string;
  progressPercent: number;
  profile: ClientProfile;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_REQUIREMENTS_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Seu nome e Zeze. Voce e uma IA atendente de levantamento de requisitos para e-commerce. Leia todas as respostas ja dadas antes de escrever a proxima fala. Faca perguntas curtas, objetivas e sem repeticao. Nunca crie perguntas fora do banco enviado. Se ainda houver proxima pergunta, conecte brevemente com o que o cliente acabou de dizer e apresente somente a proxima pergunta em tom consultivo. Se a conversa estiver completa, confirme o plano indicado para o cliente sem exibir resumo da conversa, e gere um resumo operacional para o admin/e-mail. A justificativa do plano deve nascer das respostas do cliente. Responda apenas JSON valido."
        },
        {
          role: "user",
          content: JSON.stringify({
            maxQuestions: quoteQuestions.length,
            progressPercent,
            clientProfile: {
              name: profile.fullName,
              company: profile.companyName,
              segment: profile.segment,
              storeName: profile.storeName
            },
            answeredQuestions,
            rawAnswers: answers,
            nextQuestion,
            recommendedPlan: planName,
            availablePlans: subscriptionPlans.map((plan) => ({
              key: plan.key,
              name: plan.name,
              idealFor: plan.idealFor
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "requirements_chat_turn",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              assistantMessage: {
                type: "string",
                description: "Mensagem curta para o cliente nesta etapa."
              },
              clientSummary: {
                type: "string",
                description: "Confirmacao curta do plano indicado para o cliente, sem listar respostas."
              },
              adminSummary: {
                type: "string",
                description: "Resumo operacional com necessidades, restricoes e sinais do plano."
              },
              planReason: {
                type: "string",
                description: "Justificativa objetiva do plano indicado."
              }
            },
            required: ["assistantMessage", "clientSummary", "adminSummary", "planReason"]
          }
        }
      },
      temperature: 0.2,
      max_output_tokens: 900
    })
  });

  if (!response.ok) {
    return null;
  }

  const output = getOutputText(await response.json());

  try {
    return normalizeAiTurn(JSON.parse(output));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = (body?.answers || {}) as QuoteAnswers;
    const profile = (body?.profile || {}) as ClientProfile;
    const selectedPlanKey = readPlanKey(body?.selectedPlanKey);
    const answeredQuestions = getAnsweredQuestions(answers);
    const nextQuestion = getNextQuestion(answers);
    const answeredCount = answeredQuestions.length;
    const maxQuestions = quoteQuestions.length;
    const progressPercent = Math.round((answeredCount / maxQuestions) * 100);
    const recommendedPlan = getRecommendedPlan(answers, selectedPlanKey);
    const fallbackPlanReason = buildPlanReason(recommendedPlan.key, answers);
    const fallbackSummary = buildFallbackSummary(profile, answers, recommendedPlan.name);
    const invalidAnsweredQuestion = getInvalidAnsweredQuestion(answers);

    if (invalidAnsweredQuestion) {
      const invalidQuestionIndex = quoteQuestions.findIndex(
        (question) => question.id === invalidAnsweredQuestion.question.id
      );

      return NextResponse.json({
        adminSummary: fallbackSummary,
        aiAvailable: false,
        answeredCount,
        assistantMessage: invalidAnsweredQuestion.validation.message,
        clientSummary: fallbackSummary,
        maxQuestions,
        moderationMessage: invalidAnsweredQuestion.validation.message,
        nextQuestionId: invalidAnsweredQuestion.question.id,
        planReason: fallbackPlanReason,
        progressPercent,
        recommendedPlan: {
          key: recommendedPlan.key,
          name: recommendedPlan.name,
          reason: fallbackPlanReason,
          idealFor: recommendedPlan.idealFor
        },
        status: "blocked",
        targetQuestionIndex: invalidQuestionIndex
      });
    }

    const aiTurn = await getAiTurn({
      answeredQuestions,
      answers,
      nextQuestion,
      planName: recommendedPlan.name,
      progressPercent,
      profile
    });

    return NextResponse.json({
      adminSummary: aiTurn?.adminSummary || fallbackSummary,
      aiAvailable: Boolean(aiTurn),
      answeredCount,
      assistantMessage:
        aiTurn?.assistantMessage ||
        (nextQuestion
          ? `Entendi. Para encaixar o melhor plano, me responda: ${nextQuestion.prompt}`
          : "Conversa finalizada. Ja tenho informacoes suficientes para indicar o plano."),
      clientSummary: aiTurn?.clientSummary || fallbackSummary,
      maxQuestions,
      nextQuestionId: nextQuestion?.id || null,
      planReason: aiTurn?.planReason || fallbackPlanReason,
      progressPercent,
      recommendedPlan: {
        key: recommendedPlan.key,
        name: recommendedPlan.name,
        reason: aiTurn?.planReason || fallbackPlanReason,
        idealFor: recommendedPlan.idealFor
      },
      status: nextQuestion ? "ask" : "summary"
    });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel processar a conversa de requisitos." },
      { status: 500 }
    );
  }
}
