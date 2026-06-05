import emailjs, { EmailJSResponseStatus } from "@emailjs/browser";
import {
  ADMIN_EMAIL,
  getAnswerText,
  getQuoteAnswerLabel,
  type ClientProfile,
  type QuoteAnswers
} from "@/lib/platform";

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const sharedTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const clientTemplateId =
  process.env.NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID || sharedTemplateId;
const adminTemplateId =
  process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || sharedTemplateId;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const emailSendGapMs = 1100;

export const isEmailJsConfigured = Boolean(
  serviceId && clientTemplateId && adminTemplateId && publicKey
);

export type SendQuoteEmailInput = {
  requestId: string;
  profile: ClientProfile;
  answers: QuoteAnswers;
  recommendedPlan: string;
  referenceLinks?: string;
  serviceNote?: string;
};

export type SendQuoteResponseEmailInput = {
  adminResponse: string;
  planName: string;
  profile: ClientProfile;
  quoteValue: string;
  requestId: string;
};

export type EmailSendResult = {
  status: "sent" | "skipped" | "failed";
  detail: string;
};

function stringifyAnswers(answers: QuoteAnswers) {
  return Object.entries(answers)
    .map(([key, value]) => {
      return `${getQuoteAnswerLabel(key)}: ${getAnswerText(value)}`;
    })
    .join("\n");
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function compactErrorDetail(detail: string) {
  return detail.length > 140 ? `${detail.slice(0, 137)}...` : detail;
}

function getEmailJsErrorDetail(error: unknown) {
  if (error instanceof EmailJSResponseStatus) {
    return compactErrorDetail(`${error.status} ${error.text}`);
  }

  if (error && typeof error === "object" && "status" in error && "text" in error) {
    const response = error as { status?: number; text?: string };
    return compactErrorDetail(`${response.status || 0} ${response.text || "Erro do EmailJS"}`);
  }

  if (error instanceof Error) {
    return compactErrorDetail(error.message);
  }

  return "Erro desconhecido no EmailJS";
}

export async function sendQuoteEmails({
  requestId,
  profile,
  answers,
  recommendedPlan,
  referenceLinks = "",
  serviceNote = ""
}: SendQuoteEmailInput): Promise<EmailSendResult> {
  if (!isEmailJsConfigured || !serviceId || !clientTemplateId || !adminTemplateId || !publicKey) {
    return {
      status: "skipped",
      detail: "EmailJS ainda não configurado no ambiente."
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
    reference_links: referenceLinks.trim() || "Sem links de referência",
    service_note: serviceNote.trim() || "Sem observação adicional",
    additional_notes: serviceNote.trim() || "Sem observação adicional",
    admin_email: ADMIN_EMAIL
  };

  const emailJobs = [
    { label: "cliente", templateId: clientTemplateId, toEmail: profile.email },
    { label: "admin", templateId: adminTemplateId, toEmail: ADMIN_EMAIL }
  ];
  const failures: string[] = [];

  for (let index = 0; index < emailJobs.length; index += 1) {
    const job = emailJobs[index];

    if (index > 0) {
      await wait(emailSendGapMs);
    }

    try {
      await emailjs.send(
        serviceId,
        job.templateId,
        {
          ...commonPayload,
          to_email: job.toEmail
        },
        { publicKey }
      );
    } catch (error) {
      const detail = getEmailJsErrorDetail(error);
      failures.push(`${job.label}: ${detail}`);
      console.error("EmailJS quote send failed", {
        target: job.label,
        detail
      });
    }
  }

  if (failures.length === 0) {
    return {
      status: "sent",
      detail: "Confirmação enviada para o cliente e para o admin."
    };
  }

  if (failures.length < emailJobs.length) {
    return {
      status: "failed",
      detail: `O orçamento foi salvo. Parte dos e-mails foi enviada, mas o EmailJS falhou em ${failures.join("; ")}.`
    };
  }

  return {
    status: "failed",
    detail: `O orçamento foi salvo, mas o EmailJS falhou em ${failures.join("; ")}.`
  };
}

export async function sendQuoteResponseEmail({
  adminResponse,
  planName,
  profile,
  quoteValue,
  requestId
}: SendQuoteResponseEmailInput): Promise<EmailSendResult> {
  if (!isEmailJsConfigured || !serviceId || !clientTemplateId || !publicKey) {
    return {
      status: "skipped",
      detail: "Resposta salva. EmailJS ainda não configurado no ambiente."
    };
  }

  try {
    await emailjs.send(
      serviceId,
      clientTemplateId,
      {
        request_id: requestId,
        client_name: profile.fullName,
        client_email: profile.email,
        company_name: profile.companyName,
        phone: profile.phone,
        segment: profile.segment,
        store_name: profile.storeName,
        recommended_plan: planName,
        quote_value: quoteValue,
        quote_amount: quoteValue,
        admin_response: adminResponse,
        quote_response: adminResponse,
        answers_summary: `Valor informado: ${quoteValue}\nResposta do admin: ${adminResponse}`,
        additional_notes: adminResponse,
        admin_email: ADMIN_EMAIL,
        to_email: profile.email
      },
      { publicKey }
    );

    return {
      status: "sent",
      detail: "Resposta enviada para o cliente por e-mail."
    };
  } catch (error) {
    return {
      status: "failed",
      detail: `Resposta salva, mas o EmailJS falhou: ${getEmailJsErrorDetail(error)}.`
    };
  }
}
