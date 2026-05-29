import emailjs from "@emailjs/browser";
import { ADMIN_EMAIL, type ClientProfile, type QuoteAnswers } from "@/lib/platform";

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const sharedTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const clientTemplateId =
  process.env.NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID || sharedTemplateId;
const adminTemplateId =
  process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || sharedTemplateId;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const isEmailJsConfigured = Boolean(
  serviceId && clientTemplateId && adminTemplateId && publicKey
);

export type SendQuoteEmailInput = {
  requestId: string;
  profile: ClientProfile;
  answers: QuoteAnswers;
  recommendedPlan: string;
};

export type EmailSendResult = {
  status: "sent" | "skipped" | "failed";
  detail: string;
};

function stringifyAnswers(answers: QuoteAnswers) {
  return Object.entries(answers)
    .map(([key, value]) => {
      const answer = Array.isArray(value) ? value.join(", ") : value;
      return `${key}: ${answer || "Nao informado"}`;
    })
    .join("\n");
}

export async function sendQuoteEmails({
  requestId,
  profile,
  answers,
  recommendedPlan
}: SendQuoteEmailInput): Promise<EmailSendResult> {
  if (!isEmailJsConfigured || !serviceId || !clientTemplateId || !adminTemplateId || !publicKey) {
    return {
      status: "skipped",
      detail: "EmailJS ainda nao configurado no ambiente."
    };
  }

  const commonPayload = {
    request_id: requestId,
    client_name: profile.fullName,
    client_email: profile.email,
    company_name: profile.companyName,
    tax_id: profile.taxId,
    phone: profile.phone,
    segment: profile.segment,
    store_name: profile.storeName,
    recommended_plan: recommendedPlan,
    answers_summary: stringifyAnswers(answers),
    admin_email: ADMIN_EMAIL
  };

  try {
    await Promise.all([
      emailjs.send(
        serviceId,
        clientTemplateId,
        {
          ...commonPayload,
          to_email: profile.email
        },
        { publicKey }
      ),
      emailjs.send(
        serviceId,
        adminTemplateId,
        {
          ...commonPayload,
          to_email: ADMIN_EMAIL
        },
        { publicKey }
      )
    ]);

    return {
      status: "sent",
      detail: "Confirmacao enviada para o cliente e para o admin."
    };
  } catch {
    return {
      status: "failed",
      detail: "O pedido foi salvo, mas o envio por EmailJS falhou."
    };
  }
}
