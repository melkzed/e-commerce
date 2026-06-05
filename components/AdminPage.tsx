"use client";

import clsx from "clsx";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Headphones,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  Users,
  WalletCards
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AuthAccessCard } from "@/components/AuthAccessCard";
import { usePlatformAuth } from "@/components/usePlatformAuth";
import { sendQuoteResponseEmail } from "@/lib/emailjs";
import {
  ADMIN_EMAIL,
  getAnswerText,
  getPlanByKey,
  getQuoteAnswerLabel,
  getReferenceLinks,
  getServiceNote,
  requestPipeline,
  subscriptionPlans,
  subscriptionStatusLabels,
  supportStatusLabels,
  type AdminProfileRow,
  type ClientProfile,
  type QuoteRequestRow,
  type SupportTicketRow
} from "@/lib/platform";
import type { LucideIcon } from "lucide-react";

type AdminView =
  | "dashboard"
  | "orders"
  | "clients"
  | "subscriptions"
  | "support"
  | "reviews"
  | "reports"
  | "settings";

const adminViews: Array<{ description: string; icon: LucideIcon; key: AdminView; label: string }> = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Indicadores, funil e saúde da operação",
    icon: LayoutDashboard
  },
  {
    key: "orders",
    label: "Orçamentos",
    description: "Pipeline de solicitações comerciais",
    icon: ClipboardList
  },
  {
    key: "clients",
    label: "Clientes",
    description: "Base, contatos e dados cadastrais",
    icon: Users
  },
  {
    key: "subscriptions",
    label: "Assinaturas",
    description: "Planos, status e ativação",
    icon: WalletCards
  },
  {
    key: "support",
    label: "Suporte",
    description: "Tickets, SLA e respostas",
    icon: Headphones
  },
  {
    key: "reviews",
    label: "Avaliações",
    description: "Feedbacks e satisfação",
    icon: Star
  },
  {
    key: "reports",
    label: "Relatórios",
    description: "Leitura comercial e operacional",
    icon: FileText
  },
  {
    key: "settings",
    label: "Configurações",
    description: "Preferências do painel",
    icon: Settings
  }
];

type AdminSettings = {
  autoEmailAlerts: boolean;
  defaultReply: string;
  preferredChannel: string;
  requireProfileBeforeQuote: boolean;
  slaTarget: string;
};

type QuoteQueue = "pending" | "answered";

type ReportSectionKey = "clients" | "quotes" | "subscriptions" | "support" | "reviews";

type ReportOptions = Record<ReportSectionKey, boolean>;

const ADMIN_SETTINGS_KEY = "melkzedek-admin-settings";

const defaultAdminSettings: AdminSettings = {
  autoEmailAlerts: true,
  defaultReply:
    "Olá! Recebi sua solicitação e já estou analisando. Vou te responder com o próximo passo em breve.",
  preferredChannel: "WhatsApp + plataforma",
  requireProfileBeforeQuote: true,
  slaTarget: "24h"
};

const chartColors = ["#8b5cf6", "#22d3ee", "#ec4899", "#f59e0b", "#22c55e", "#6366f1"];

const chartTooltipStyle = {
  background: "rgba(5, 1, 15, 0.96)",
  border: "1px solid rgba(124, 58, 237, 0.35)",
  borderRadius: "12px",
  color: "#f0ecff"
};

const chartContainerProps = {
  debounce: 80,
  height: "100%",
  initialDimension: { width: 520, height: 240 },
  minHeight: 180,
  minWidth: 1,
  width: "100%"
} as const;

const defaultReportOptions: ReportOptions = {
  clients: true,
  quotes: true,
  subscriptions: true,
  support: true,
  reviews: true
};

const reportSectionLabels: Record<ReportSectionKey, string> = {
  clients: "Clientes cadastrados",
  quotes: "Orçamentos",
  subscriptions: "Assinaturas",
  support: "Suportes",
  reviews: "Avaliações"
};

function readAdminSettings(): AdminSettings {
  if (typeof window === "undefined") {
    return defaultAdminSettings;
  }

  try {
    const stored = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    return stored ? { ...defaultAdminSettings, ...JSON.parse(stored) } : defaultAdminSettings;
  } catch {
    return defaultAdminSettings;
  }
}

type AdminMetric = {
  icon: LucideIcon;
  label: string;
  note: string;
  value: number | string;
};

function getTodayCount(requests: QuoteRequestRow[]) {
  const today = new Date().toDateString();

  return requests.filter((request) => new Date(request.created_at).toDateString() === today).length;
}

function getClientLabel(profile: ClientProfile) {
  return profile.storeName || profile.companyName || profile.fullName || "Cliente sem nome";
}

function getProfileRowLabel(profile: AdminProfileRow) {
  return profile.store_name || profile.company_name || profile.full_name || "Cliente";
}

function getWhatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}`;
}

function getTicketClient(ticket: SupportTicketRow) {
  return ticket.profile_snapshot?.storeName || ticket.profile_snapshot?.companyName || "Cliente";
}

function getReferenceLinkItems(value: string) {
  return value
    .split(/[\n,]+/)
    .map((link) => link.trim())
    .filter(Boolean);
}

function normalizeReferenceHref(link: string) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function getRequestStatusLabel(status: string) {
  const cleanStatus = status.toLowerCase();
  return requestPipeline.find((item) => item.toLowerCase() === cleanStatus) || status || "Novo";
}

function getPipelineStatusValue(status: string) {
  const cleanStatus = status.toLowerCase();
  return requestPipeline.find((item) => item.toLowerCase() === cleanStatus)?.toLowerCase() || cleanStatus || "novo";
}

function hasQuoteAdminResponse(request: QuoteRequestRow) {
  return Boolean(request.admin_response?.trim() || request.quote_responded_at);
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
}

function formatReportDate(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Date(value).toLocaleString("pt-BR");
}

function escapeReportText(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildReportTable(headers: string[], rows: Array<Array<unknown>>) {
  if (rows.length === 0) {
    return '<p class="empty">Nenhum registro para esta seção.</p>';
  }

  return `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeReportText(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${escapeReportText(cell || "Não informado")}</td>`).join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function buildDailyRequestData(requests: QuoteRequestRow[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      requests: 0
    };
  });

  const dayMap = new Map(days.map((day) => [day.key, day]));

  requests.forEach((request) => {
    const key = new Date(request.created_at).toISOString().slice(0, 10);
    const day = dayMap.get(key);

    if (day) {
      day.requests += 1;
    }
  });

  return days;
}

function getProfileCompletion(profile: AdminProfileRow) {
  const fields = [
    profile.full_name,
    profile.email,
    profile.company_name,
    profile.tax_id,
    profile.phone,
    profile.segment,
    profile.store_name
  ];
  const completed = fields.filter((field) => Boolean(field?.trim())).length;

  return Math.round((completed / fields.length) * 100);
}

export function AdminPage() {
  const auth = usePlatformAuth();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(readAdminSettings);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [quoteQueue, setQuoteQueue] = useState<QuoteQueue>("pending");
  const [quoteProposalDrafts, setQuoteProposalDrafts] = useState<
    Record<string, { adminResponse: string; quoteValue: string }>
  >({});
  const [quoteProposalNotice, setQuoteProposalNotice] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [reportOptions, setReportOptions] = useState<ReportOptions>(defaultReportOptions);
  const [reportNotice, setReportNotice] = useState("");
  const [settingsNotice, setSettingsNotice] = useState("");
  const todayCount = getTodayCount(auth.adminRequests);
  const pendingQuoteRequests = useMemo(
    () => auth.adminRequests.filter((request) => !hasQuoteAdminResponse(request)),
    [auth.adminRequests]
  );
  const answeredQuoteRequests = useMemo(
    () => auth.adminRequests.filter((request) => hasQuoteAdminResponse(request)),
    [auth.adminRequests]
  );
  const visibleQuoteRequests = quoteQueue === "pending" ? pendingQuoteRequests : answeredQuoteRequests;
  const selectedRequest = useMemo(
    () => visibleQuoteRequests.find((request) => request.id === selectedRequestId) || visibleQuoteRequests[0],
    [selectedRequestId, visibleQuoteRequests]
  );
  const openTickets = auth.adminSupportTickets.filter((ticket) => ticket.status !== "closed");
  const activeSubscriptions = auth.adminSubscriptions.filter((subscription) => subscription.status === "active");
  const requestedSubscriptions = auth.adminSubscriptions.filter((subscription) => subscription.status === "requested");
  const averageRating =
    auth.adminReviews.length > 0
      ? auth.adminReviews.reduce((sum, review) => sum + review.rating, 0) / auth.adminReviews.length
      : 0;
  const emailSentCount = auth.adminRequests.filter((request) => request.email_status === "sent").length;
  const conversionRate = auth.adminRequests.length
    ? Math.round((activeSubscriptions.length / auth.adminRequests.length) * 100)
    : 0;
  const emailSuccessRate = auth.adminRequests.length
    ? Math.round((emailSentCount / auth.adminRequests.length) * 100)
    : 0;
  const averageProfileCompletion = auth.adminProfiles.length
    ? Math.round(
        auth.adminProfiles.reduce((sum, profile) => sum + getProfileCompletion(profile), 0) /
          auth.adminProfiles.length
      )
    : 0;
  const planCounts = subscriptionPlans.map((plan) => ({
    name: plan.signal,
    plan,
    requests: auth.adminRequests.filter((request) => request.plan_key === plan.key).length,
    subscriptions: auth.adminSubscriptions.filter((subscription) => subscription.plan_key === plan.key).length
  }));
  const bestPlan = [...planCounts].sort((a, b) => b.requests - a.requests)[0];
  const dailyRequestData = buildDailyRequestData(auth.adminRequests);
  const requestStatusData = requestPipeline.map((status) => ({
    name: status,
    value: auth.adminRequests.filter(
      (request) => request.status.toLowerCase() === status.toLowerCase()
    ).length
  }));
  const requestStatusTotal = requestStatusData.reduce((sum, item) => sum + item.value, 0);
  const supportStatusData = Object.entries(supportStatusLabels).map(([status, label]) => ({
    name: label,
    value: auth.adminSupportTickets.filter((ticket) => ticket.status === status).length
  }));
  const supportStatusTotal = supportStatusData.reduce((sum, item) => sum + item.value, 0);
  const recentActivity = [
    ...auth.adminRequests.map((request) => ({
      date: request.created_at,
      label: "Orçamento",
      note: getPlanByKey(request.plan_key).name,
      title: getClientLabel(request.profile_snapshot)
    })),
    ...auth.adminSupportTickets.map((ticket) => ({
      date: ticket.created_at,
      label: "Suporte",
      note: supportStatusLabels[ticket.status] || ticket.status,
      title: ticket.subject
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const reportCards = [
    {
      icon: TrendingUp,
      label: "Taxa de ativação",
      value: `${conversionRate}%`,
      text: `${activeSubscriptions.length} assinatura(s) ativa(s) a partir de ${auth.adminRequests.length} orçamento(s).`
    },
    {
      icon: Gauge,
      label: "SLA operacional",
      value: adminSettings.slaTarget,
      text: `${openTickets.length} ticket(s) precisam de acompanhamento no suporte.`
    },
    {
      icon: Mail,
      label: "Entrega por e-mail",
      value: `${emailSuccessRate}%`,
      text: `${emailSentCount} orçamento(s) com confirmação enviada pelo EmailJS.`
    },
    {
      icon: Star,
      label: "CSAT médio",
      value: averageRating ? `${averageRating.toFixed(1)}/5` : "Sem nota",
      text: `${auth.adminReviews.length} avaliação(ões) registrada(s) pelos clientes.`
    }
  ];
  const adminMetrics: AdminMetric[] = [
    { icon: ClipboardList, label: "Orçamentos", note: `${todayCount} hoje`, value: auth.adminRequests.length },
    { icon: Users, label: "Clientes", note: "Perfis salvos", value: auth.adminProfiles.length },
    {
      icon: WalletCards,
      label: "Assinaturas",
      note: `${requestedSubscriptions.length} solicitadas`,
      value: activeSubscriptions.length || auth.adminSubscriptions.length
    },
    { icon: Headphones, label: "Tickets", note: "Abertos", value: openTickets.length },
    {
      icon: Star,
      label: "Avaliações",
      note: averageRating ? `${averageRating.toFixed(1)}/5` : "Sem nota",
      value: auth.adminReviews.length
    },
    {
      icon: Mail,
      label: "E-mail",
      note: `${emailSuccessRate}% de entrega`,
      value: emailSentCount
    }
  ];

  const handleReply = async (ticketId: string) => {
    const reply = replyDrafts[ticketId] || "";
    const updated = await auth.replySupportTicket(ticketId, reply);

    if (updated) {
      setReplyDrafts((current) => ({ ...current, [ticketId]: "" }));
    }
  };

  const getQuoteProposalDraft = (request: QuoteRequestRow) => {
    return quoteProposalDrafts[request.id] || {
      adminResponse: request.admin_response || "",
      quoteValue: request.quote_value || ""
    };
  };

  const updateQuoteProposalDraft = (
    requestId: string,
    field: "adminResponse" | "quoteValue",
    value: string
  ) => {
    setQuoteProposalDrafts((current) => ({
      ...current,
      [requestId]: {
        adminResponse:
          current[requestId]?.adminResponse ||
          auth.adminRequests.find((request) => request.id === requestId)?.admin_response ||
          "",
        quoteValue:
          current[requestId]?.quoteValue ||
          auth.adminRequests.find((request) => request.id === requestId)?.quote_value ||
          "",
        [field]: value
      }
    }));
    setQuoteProposalNotice("");
  };

  const handleQuoteProposal = async (request: QuoteRequestRow) => {
    const draft = getQuoteProposalDraft(request);

    if (!draft.quoteValue.trim() || !draft.adminResponse.trim()) {
      setQuoteProposalNotice("Informe o valor e a resposta antes de enviar ao cliente.");
      return;
    }

    setQuoteProposalNotice("Salvando proposta...");

    const updatedRequest = await auth.replyQuoteRequest({
      adminResponse: draft.adminResponse,
      quoteValue: draft.quoteValue,
      requestId: request.id
    });

    if (!updatedRequest) {
      setQuoteProposalNotice("Não foi possível salvar a proposta no orçamento.");
      return;
    }

    const emailResult = await sendQuoteResponseEmail({
      adminResponse: draft.adminResponse,
      planName: getPlanByKey(updatedRequest.plan_key).name,
      profile: updatedRequest.profile_snapshot,
      quoteValue: draft.quoteValue,
      requestId: updatedRequest.id
    });

    await auth.updateQuoteResponseEmailStatus(updatedRequest.id, emailResult.status);
    setQuoteQueue("answered");
    setSelectedRequestId(updatedRequest.id);
    setQuoteProposalNotice(emailResult.detail);
  };

  const updateAdminSetting = <Key extends keyof AdminSettings>(key: Key, value: AdminSettings[Key]) => {
    setAdminSettings((current) => ({
      ...current,
      [key]: value
    }));
    setSettingsNotice("");
  };

  const saveAdminSettings = () => {
    window.localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(adminSettings));
    setSettingsNotice("Configurações salvas neste navegador.");
  };

  const toggleReportOption = (section: ReportSectionKey) => {
    setReportOptions((current) => ({
      ...current,
      [section]: !current[section]
    }));
    setReportNotice("");
  };

  const generateReportPdf = () => {
    const selectedSections = (Object.keys(reportOptions) as ReportSectionKey[]).filter(
      (section) => reportOptions[section]
    );

    if (selectedSections.length === 0) {
      setReportNotice("Escolha pelo menos uma seção para gerar o relatório.");
      return;
    }

    const sections: string[] = [];

    if (reportOptions.clients) {
      sections.push(`
        <section>
          <h2>Clientes cadastrados</h2>
          ${buildReportTable(
            ["Cliente", "E-mail", "Telefone", "Empresa", "Segmento", "Cadastro", "Criado em"],
            auth.adminProfiles.map((profile) => [
              getProfileRowLabel(profile),
              profile.email,
              profile.phone,
              profile.company_name,
              profile.segment,
              `${getProfileCompletion(profile)}%`,
              formatReportDate(profile.created_at)
            ])
          )}
        </section>
      `);
    }

    if (reportOptions.quotes) {
      sections.push(`
        <section>
          <h2>Orçamentos</h2>
          ${buildReportTable(
            ["Cliente", "Plano", "Status", "Resposta", "Valor", "E-mail", "Criado em", "Mensagem do admin"],
            auth.adminRequests.map((request) => [
              getClientLabel(request.profile_snapshot),
              getPlanByKey(request.plan_key).name,
              getRequestStatusLabel(request.status),
              hasQuoteAdminResponse(request) ? "Respondido" : "Pendente",
              request.quote_value,
              request.quote_response_email_status || request.email_status,
              formatReportDate(request.created_at),
              request.admin_response
            ])
          )}
        </section>
      `);
    }

    if (reportOptions.subscriptions) {
      sections.push(`
        <section>
          <h2>Assinaturas</h2>
          ${buildReportTable(
            ["Cliente", "Plano", "Status", "Origem", "Criado em", "Atualizado em"],
            auth.adminSubscriptions.map((subscription) => [
              getClientLabel(subscription.profile_snapshot),
              getPlanByKey(subscription.plan_key).name,
              subscriptionStatusLabels[subscription.status] || subscription.status,
              subscription.source_request_id || "Sem orçamento vinculado",
              formatReportDate(subscription.created_at),
              formatReportDate(subscription.updated_at)
            ])
          )}
        </section>
      `);
    }

    if (reportOptions.support) {
      sections.push(`
        <section>
          <h2>Suportes</h2>
          ${buildReportTable(
            ["Cliente", "Assunto", "Prioridade", "Status", "Mensagem", "Resposta admin", "Criado em"],
            auth.adminSupportTickets.map((ticket) => [
              getTicketClient(ticket),
              ticket.subject,
              ticket.priority,
              supportStatusLabels[ticket.status] || ticket.status,
              ticket.message,
              ticket.admin_reply,
              formatReportDate(ticket.created_at)
            ])
          )}
        </section>
      `);
    }

    if (reportOptions.reviews) {
      sections.push(`
        <section>
          <h2>Avaliações</h2>
          ${buildReportTable(
            ["Cliente", "Nota", "Status", "Comentário", "Criado em"],
            auth.adminReviews.map((review) => [
              getClientLabel(review.profile_snapshot),
              `${review.rating}/5`,
              review.status,
              review.comment,
              formatReportDate(review.created_at)
            ])
          )}
        </section>
      `);
    }

    const reportWindow = window.open("", "_blank", "width=1200,height=800");

    if (!reportWindow) {
      setReportNotice("O navegador bloqueou a janela do relatório. Libere pop-ups para gerar o PDF.");
      return;
    }

    const generatedAt = new Date().toLocaleString("pt-BR");

    reportWindow.document.open();
    reportWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relatório Melkzedek Tech</title>
          <style>
            @page { margin: 14mm; size: A4 landscape; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #111827;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 1.45;
            }
            header {
              border-bottom: 2px solid #7c3aed;
              margin-bottom: 18px;
              padding-bottom: 12px;
            }
            h1, h2, p { margin: 0; }
            h1 { color: #2e1065; font-size: 22px; }
            h2 {
              color: #3b0764;
              font-size: 15px;
              margin: 22px 0 8px;
            }
            .meta {
              color: #4b5563;
              margin-top: 6px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              margin: 14px 0 18px;
            }
            .summary div {
              border: 1px solid #ddd6fe;
              border-radius: 8px;
              padding: 9px;
              background: #faf5ff;
            }
            .summary span {
              display: block;
              color: #6b21a8;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .summary strong {
              color: #111827;
              display: block;
              font-size: 17px;
              margin-top: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              page-break-inside: auto;
            }
            tr { page-break-inside: avoid; }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 6px;
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
            }
            th {
              background: #ede9fe;
              color: #3b0764;
              font-size: 9px;
              text-transform: uppercase;
            }
            .empty {
              border: 1px dashed #c4b5fd;
              border-radius: 8px;
              color: #6b7280;
              padding: 10px;
            }
            .print-action {
              background: #4c1d95;
              border: 0;
              border-radius: 999px;
              color: #fff;
              cursor: pointer;
              font-weight: 700;
              margin: 0 0 14px;
              padding: 10px 14px;
            }
            @media print {
              .print-action { display: none; }
              header { break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <button class="print-action" type="button" onclick="window.print()">Salvar como PDF</button>
          <header>
            <h1>Relatório Melkzedek Tech</h1>
            <p class="meta">Gerado em ${escapeReportText(generatedAt)}. Seções: ${escapeReportText(
              selectedSections.map((section) => reportSectionLabels[section]).join(", ")
            )}.</p>
          </header>
          <div class="summary">
            <div><span>Clientes</span><strong>${auth.adminProfiles.length}</strong></div>
            <div><span>Orçamentos</span><strong>${auth.adminRequests.length}</strong></div>
            <div><span>Assinaturas</span><strong>${auth.adminSubscriptions.length}</strong></div>
            <div><span>Suportes</span><strong>${auth.adminSupportTickets.length}</strong></div>
            <div><span>Avaliações</span><strong>${auth.adminReviews.length}</strong></div>
          </div>
          ${sections.join("")}
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    window.setTimeout(() => reportWindow.print(), 250);
    setReportNotice("Relatório aberto. Use a opção Salvar como PDF na janela de impressão.");
  };

  const renderContactActions = (profile: ClientProfile) => {
    const whatsappHref = getWhatsAppHref(profile.phone);

    return (
      <div className="admin-contact-actions">
        <a className="secondary-flow-action compact" href={`mailto:${profile.email}`}>
          <Mail size={15} />
          E-mail
        </a>
        {whatsappHref ? (
          <a className="secondary-flow-action compact" href={whatsappHref} target="_blank" rel="noreferrer">
            <Phone size={15} />
            WhatsApp
          </a>
        ) : (
          <span className="admin-muted-pill">Sem telefone</span>
        )}
      </div>
    );
  };

  if (auth.authLoading) {
    return (
      <main className="flow-shell">
        <section className="access-loading-card">
          <Loader2 className="spin" size={22} />
          Verificando acesso admin...
        </section>
      </main>
    );
  }

  if (!auth.isConnected) {
    return (
      <main className="flow-shell">
        <section className="access-page-wrap">
          <AuthAccessCard
            adminOnly
            auth={auth}
            eyebrow="Acesso admin"
            title="Entrar com e-mail admin"
            text="Use a conta cadastrada como admin para liberar orçamentos, clientes, suporte e avaliações."
          />
        </section>
      </main>
    );
  }

  if (!auth.isAdmin) {
    return (
      <main className="flow-shell">
        <section className="access-page-wrap access-denied-wrap">
          <section className="command-center-card access-denied-card">
            <div className="login-card-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span>Acesso bloqueado</span>
              <h1>Esta conta não tem permissão de admin.</h1>
              <p>
                Você está conectado como <strong>{auth.accountEmail}</strong>. Para abrir o painel,
                entre com <strong>{ADMIN_EMAIL}</strong>.
              </p>
            </div>
            <button className="secondary-flow-action" type="button" onClick={auth.handleLogout}>
              <LogOut size={17} />
              Sair desta conta
            </button>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flow-shell">
      <section className="command-center-card admin-command-center pro-admin-center">
        <div className="command-center-top admin-command-top">
          <div>
            <span>Operação</span>
            <h2>Painel admin de alto nível</h2>
            <p>Gestão comercial, suporte, assinaturas e relatórios em uma central única.</p>
          </div>
          <button
            className="secondary-flow-action compact"
            type="button"
            onClick={auth.refreshAdminRequests}
            disabled={auth.adminLoading}
          >
            {auth.adminLoading ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
            Atualizar
          </button>
        </div>

        <div className="admin-shell-layout">
          <aside className="admin-sidebar" aria-label="Menu do painel admin">
            <div className="admin-sidebar-brand">
              <span>
                <img src="/brand/melk-zedek-mark-transparent.png" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Gestão Melk Zedek Tech</strong>
                <small>{auth.accountEmail}</small>
              </div>
            </div>

            <nav className="admin-side-nav" role="tablist" aria-label="Áreas do admin">
              {adminViews.map((view) => {
                const ViewIcon = view.icon;

                return (
                  <button
                    key={view.key}
                    className={clsx(activeView === view.key && "active")}
                    type="button"
                    onClick={() => setActiveView(view.key)}
                  >
                    <ViewIcon size={18} />
                    <span>
                      <strong>{view.label}</strong>
                      <small>{view.description}</small>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="admin-sidebar-foot">
              <div>
                <span>SLA</span>
                <strong>{adminSettings.slaTarget}</strong>
              </div>
              <div>
                <span>Suporte aberto</span>
                <strong>{openTickets.length}</strong>
              </div>
            </div>
          </aside>

          <section className="admin-workspace">
            <div className="command-stats-grid admin-kpi-grid">
              {adminMetrics.map(({ icon: MetricIcon, label, note, value }) => (
                <div key={label}>
                  <MetricIcon size={18} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              ))}
            </div>

            {auth.adminDataNotice && (
              <div className="admin-data-note admin-warning-note">
                <AlertCircle size={15} />
                {auth.adminDataNotice}
              </div>
            )}

            {activeView === "dashboard" && (
              <section className="admin-pro-section admin-dashboard-section">
                <div className="admin-dashboard-grid">
                  <article className="admin-chart-card admin-chart-wide">
                    <div className="admin-chart-head">
                      <div>
                        <span>Demanda comercial</span>
                        <h3>Orçamentos nos últimos 7 dias</h3>
                      </div>
                      <BarChart3 size={20} />
                    </div>
                    <div className="admin-chart-box">
                      <ResponsiveContainer {...chartContainerProps}>
                        <AreaChart data={dailyRequestData} margin={{ left: -18, right: 12, top: 12 }}>
                          <defs>
                            <linearGradient id="requestsGradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.55} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(124, 58, 237, 0.14)" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#a78bfa", fontSize: 12 }} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#7c6fa0", fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Area
                            dataKey="requests"
                            name="Orçamentos"
                            type="monotone"
                            stroke="#a78bfa"
                            strokeWidth={3}
                            fill="url(#requestsGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </article>

                  <article className="admin-chart-card">
                    <div className="admin-chart-head">
                      <div>
                        <span>Planos</span>
                        <h3>Interesse por assinatura</h3>
                      </div>
                      <WalletCards size={20} />
                    </div>
                    <div className="admin-chart-box compact">
                      <ResponsiveContainer {...chartContainerProps}>
                        <BarChart data={planCounts} margin={{ left: -18, right: 8, top: 12 }}>
                          <CartesianGrid stroke="rgba(124, 58, 237, 0.14)" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#a78bfa", fontSize: 12 }} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#7c6fa0", fontSize: 12 }} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="requests" name="Orçamentos" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="subscriptions" name="Assinaturas" fill="#ec4899" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </article>

                  <article className="admin-chart-card">
                    <div className="admin-chart-head">
                      <div>
                        <span>Pipeline</span>
                        <h3>Status dos orçamentos</h3>
                      </div>
                      <Activity size={20} />
                    </div>
                    {requestStatusTotal === 0 ? (
                      <p className="empty-state compact">Ainda não há dados para o gráfico.</p>
                    ) : (
                      <div className="admin-chart-box compact">
                        <ResponsiveContainer {...chartContainerProps}>
                          <PieChart>
                            <Pie
                              data={requestStatusData.filter((item) => item.value > 0)}
                              dataKey="value"
                              innerRadius={52}
                              nameKey="name"
                              outerRadius={78}
                              paddingAngle={4}
                            >
                              {requestStatusData.map((item, index) => (
                                <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={chartTooltipStyle} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </article>
                </div>

                <div className="admin-management-grid">
                  <article className="admin-insight-panel admin-executive-panel">
                    <div>
                      <TrendingUp size={20} />
                      <span>Leitura executiva</span>
                    </div>
                    <div className="admin-executive-list">
                      <div>
                        <strong>{bestPlan?.plan.name || "Sem plano dominante"}</strong>
                        <span>Plano com maior procura no funil comercial.</span>
                      </div>
                      <div>
                        <strong>{averageProfileCompletion}%</strong>
                        <span>Média de completude dos cadastros de clientes.</span>
                      </div>
                      <div>
                        <strong>{conversionRate}%</strong>
                        <span>Taxa atual de ativação de assinaturas.</span>
                      </div>
                    </div>
                  </article>

                  <article className="admin-insight-panel">
                    <div>
                      <Headphones size={20} />
                      <span>Suporte em tempo real</span>
                    </div>
                    {supportStatusTotal === 0 ? (
                      <p className="empty-state compact">Nenhum ticket registrado ainda.</p>
                    ) : (
                      <div className="admin-support-chart">
                        {supportStatusData.map((item, index) => (
                          <div key={item.name}>
                            <span>{item.name}</span>
                            <strong>{item.value}</strong>
                            <i style={{ width: `${Math.max((item.value / supportStatusTotal) * 100, 6)}%`, background: chartColors[index] }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="admin-insight-panel">
                    <div>
                      <Activity size={20} />
                      <span>Atividade recente</span>
                    </div>
                    {recentActivity.length === 0 ? (
                      <p className="empty-state compact">Nenhuma movimentação recente.</p>
                    ) : (
                      recentActivity.map((activity) => (
                        <button
                          key={`${activity.label}-${activity.date}-${activity.title}`}
                          className="admin-mini-line admin-activity-line"
                          type="button"
                          onClick={() => setActiveView(activity.label === "Suporte" ? "support" : "orders")}
                        >
                          <strong>{activity.title}</strong>
                          <span>{activity.label}</span>
                          <small>{formatShortDate(activity.date)}</small>
                        </button>
                      ))
                    )}
                  </article>
                </div>
              </section>
            )}

            {activeView === "orders" && (
              <section className="admin-pro-section admin-orders-layout">
                <aside className="admin-list-panel">
                  <div className="flow-heading">
                    <div>
                      <span>Orçamentos</span>
                      <h2>Lojas solicitadas</h2>
                    </div>
                  </div>

                  <div className="admin-pipeline">
                    {requestPipeline.map((item, index) => (
                      <span key={item} className={index === 0 ? "active" : undefined}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="admin-quote-queues" role="tablist" aria-label="Fila de orçamentos">
                    <button
                      className={clsx(quoteQueue === "pending" && "active")}
                      type="button"
                      onClick={() => {
                        setQuoteQueue("pending");
                        setSelectedRequestId("");
                      }}
                    >
                      <span>Clientes em pendência</span>
                      <strong>{pendingQuoteRequests.length}</strong>
                    </button>
                    <button
                      className={clsx(quoteQueue === "answered" && "active")}
                      type="button"
                      onClick={() => {
                        setQuoteQueue("answered");
                        setSelectedRequestId("");
                      }}
                    >
                      <span>Clientes respondidos</span>
                      <strong>{answeredQuoteRequests.length}</strong>
                    </button>
                  </div>

                  {visibleQuoteRequests.length === 0 ? (
                    <p className="empty-state">
                      {quoteQueue === "pending"
                        ? "Nenhum cliente pendente de resposta."
                        : "Nenhum orçamento respondido ainda."}
                    </p>
                  ) : (
                    <div className="request-list admin-command-list">
                      {visibleQuoteRequests.map((request) => {
                        const plan = getPlanByKey(request.plan_key);
                        const snapshot = request.profile_snapshot;
                        const active = selectedRequest?.id === request.id;
                        const answered = hasQuoteAdminResponse(request);

                        return (
                          <button
                            key={request.id}
                            className={clsx("request-item admin-request-button", active && "active")}
                            type="button"
                            onClick={() => setSelectedRequestId(request.id)}
                          >
                            <div>
                              <span>{new Date(request.created_at).toLocaleDateString("pt-BR")}</span>
                              <strong>{getClientLabel(snapshot)}</strong>
                              <small>{snapshot.email}</small>
                            </div>
                            <div>
                              <span>{plan.name}</span>
                              <strong>{getRequestStatusLabel(request.status)}</strong>
                              <small className={clsx("admin-response-status", answered && "answered")}>
                                {answered ? "Respondido" : "Pendente"}
                              </small>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </aside>

                <section className="admin-detail-panel">
                  {!selectedRequest ? (
                    <p className="empty-state">Selecione um orçamento para ver os detalhes.</p>
                  ) : (
                    <>
                      <div className="admin-detail-head">
                        <div>
                          <span>Orçamento #{selectedRequest.id.slice(0, 8)}</span>
                          <h2>{getClientLabel(selectedRequest.profile_snapshot)}</h2>
                          <p>{getPlanByKey(selectedRequest.plan_key).name}</p>
                        </div>
                        <select
                          value={getPipelineStatusValue(selectedRequest.status)}
                          onChange={(event) => auth.updateQuoteRequestStatus(selectedRequest.id, event.target.value)}
                        >
                          {requestPipeline.map((status) => (
                            <option key={status} value={status.toLowerCase()}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-client-data-grid">
                        {[
                          ["Cliente", selectedRequest.profile_snapshot.fullName],
                          ["E-mail", selectedRequest.profile_snapshot.email],
                          ["Empresa", selectedRequest.profile_snapshot.companyName],
                          ["Documento", selectedRequest.profile_snapshot.taxId],
                          ["Telefone", selectedRequest.profile_snapshot.phone],
                          ["Segmento", selectedRequest.profile_snapshot.segment]
                        ].map(([label, value]) => (
                          <div key={label}>
                            <span>{label}</span>
                            <strong>{value || "Não informado"}</strong>
                          </div>
                        ))}
                      </div>

                      {renderContactActions(selectedRequest.profile_snapshot)}

                      {hasQuoteAdminResponse(selectedRequest) && (
                        <div className="admin-quote-response-preview">
                          <CheckCircle2 size={18} />
                          <div>
                            <span>Cliente já respondido</span>
                            <h3>{selectedRequest.quote_value || "Valor não informado"}</h3>
                            <p>{selectedRequest.admin_response || "Resposta registrada sem mensagem."}</p>
                            <small>
                              {selectedRequest.quote_responded_at
                                ? `Respondido em ${new Date(selectedRequest.quote_responded_at).toLocaleString("pt-BR")}`
                                : "Resposta salva no orçamento"}
                              {selectedRequest.quote_response_email_status
                                ? ` - E-mail: ${selectedRequest.quote_response_email_status}`
                                : ""}
                            </small>
                          </div>
                        </div>
                      )}

                      <div className="admin-quote-proposal">
                        <div className="admin-quote-proposal-head">
                          <div>
                            <span>{hasQuoteAdminResponse(selectedRequest) ? "Atualizar resposta" : "Resposta para o cliente"}</span>
                            <h3>
                              {hasQuoteAdminResponse(selectedRequest)
                                ? "Edite o valor ou a mensagem e envie novamente."
                                : "Informe o valor e a mensagem da proposta."}
                            </h3>
                          </div>
                          <small>
                            {selectedRequest.quote_response_email_status
                              ? `E-mail: ${selectedRequest.quote_response_email_status}`
                              : "E-mail pendente"}
                          </small>
                        </div>

                        <div className="admin-quote-proposal-grid">
                          <label>
                            Valor do plano
                            <input
                              value={getQuoteProposalDraft(selectedRequest).quoteValue}
                              onChange={(event) =>
                                updateQuoteProposalDraft(selectedRequest.id, "quoteValue", event.target.value)
                              }
                              placeholder="Ex.: R$ 1.500,00"
                            />
                          </label>
                          <label>
                            Resposta do admin
                            <textarea
                              value={getQuoteProposalDraft(selectedRequest).adminResponse}
                              onChange={(event) =>
                                updateQuoteProposalDraft(selectedRequest.id, "adminResponse", event.target.value)
                              }
                              placeholder="Explique o valor, o que entra no plano e o próximo passo para o cliente."
                            />
                          </label>
                        </div>

                        {selectedRequest.quote_responded_at && (
                          <p className="admin-proposal-meta">
                            Última resposta enviada em{" "}
                            {new Date(selectedRequest.quote_responded_at).toLocaleString("pt-BR")}
                          </p>
                        )}

                        <button
                          className="primary-flow-action"
                          type="button"
                          onClick={() => handleQuoteProposal(selectedRequest)}
                          disabled={
                            auth.adminLoading ||
                            !getQuoteProposalDraft(selectedRequest).quoteValue.trim() ||
                            !getQuoteProposalDraft(selectedRequest).adminResponse.trim()
                          }
                        >
                          {auth.adminLoading ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
                          Salvar e enviar ao cliente
                        </button>

                        {quoteProposalNotice && <p className="flow-note">{quoteProposalNotice}</p>}
                      </div>

                      {getServiceNote(selectedRequest.answers) && (
                        <div className="admin-observation-bubble">
                          <MessageCircle size={18} />
                          <div>
                            <span>Observação do cliente</span>
                            <p>{getServiceNote(selectedRequest.answers)}</p>
                          </div>
                        </div>
                      )}

                      {getReferenceLinks(selectedRequest.answers) && (
                        <div className="admin-observation-bubble admin-reference-bubble">
                          <Link2 size={18} />
                          <div>
                            <span>Links de referência</span>
                            <div className="admin-reference-links">
                              {getReferenceLinkItems(getReferenceLinks(selectedRequest.answers)).map((link) => (
                                <a
                                  key={link}
                                  href={normalizeReferenceHref(link)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="admin-answer-grid">
                        {Object.entries(selectedRequest.answers)
                          .filter(([key]) => !["reference_links", "service_note"].includes(key))
                          .map(([key, value]) => (
                            <div key={key}>
                              <span>{getQuoteAnswerLabel(key)}</span>
                              <strong>{getAnswerText(value)}</strong>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </section>
              </section>
            )}

            {activeView === "clients" && (
              <section className="admin-pro-section admin-card-grid">
                {auth.adminProfiles.length === 0 ? (
                  <p className="empty-state">Nenhum cliente cadastrado ainda.</p>
                ) : (
                  auth.adminProfiles.map((profile) => {
                    const normalizedProfile: ClientProfile = {
                      fullName: profile.full_name || "",
                      email: profile.email || "",
                      companyName: profile.company_name || "",
                      taxId: profile.tax_id || "",
                      phone: profile.phone || "",
                      segment: profile.segment || "",
                      storeName: profile.store_name || ""
                    };
                    const requestCount = auth.adminRequests.filter((request) => request.user_id === profile.id).length;

                    return (
                      <article key={profile.id} className="admin-client-card">
                        <UserRound size={22} />
                        <div>
                          <span>{profile.segment || "Segmento pendente"}</span>
                          <h3>{getProfileRowLabel(profile)}</h3>
                          <p>{profile.email}</p>
                        </div>
                        <div className="admin-card-meta">
                          <strong>{requestCount}</strong>
                          <span>orçamentos</span>
                        </div>
                        <div className="admin-profile-progress">
                          <span>Cadastro</span>
                          <strong>{getProfileCompletion(profile)}%</strong>
                          <i style={{ width: `${getProfileCompletion(profile)}%` }} />
                        </div>
                        {renderContactActions(normalizedProfile)}
                      </article>
                    );
                  })
                )}
              </section>
            )}

            {activeView === "subscriptions" && (
              <section className="admin-pro-section admin-card-grid">
                {auth.adminSubscriptions.length === 0 ? (
                  <div className="admin-fallback-panel">
                    <WalletCards size={24} />
                    <h2>Nenhuma assinatura registrada ainda.</h2>
                    <p>
                      Novos orçamentos passam a registrar uma assinatura solicitada automaticamente.
                      Enquanto isso, use a aba Orçamentos para ver os planos escolhidos.
                    </p>
                  </div>
                ) : (
                  auth.adminSubscriptions.map((subscription) => {
                    const plan = getPlanByKey(subscription.plan_key);

                    return (
                      <article key={subscription.id} className="admin-subscription-card">
                        <div>
                          <span>{subscriptionStatusLabels[subscription.status] || subscription.status}</span>
                          <h3>{plan.name}</h3>
                          <p>{getClientLabel(subscription.profile_snapshot)}</p>
                        </div>
                        <select
                          value={subscription.status}
                          onChange={(event) => auth.updateSubscriptionStatus(subscription.id, event.target.value)}
                        >
                          {Object.entries(subscriptionStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </article>
                    );
                  })
                )}
              </section>
            )}

            {activeView === "support" && (
              <section className="admin-pro-section admin-support-layout">
                {auth.adminSupportTickets.length === 0 ? (
                  <p className="empty-state">Nenhum ticket de suporte ainda.</p>
                ) : (
                  auth.adminSupportTickets.map((ticket) => (
                    <article key={ticket.id} className="admin-ticket-card">
                      <div className="admin-ticket-head">
                        <div>
                          <span>{new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
                          <h3>{ticket.subject}</h3>
                          <p>
                            {getTicketClient(ticket)} - {ticket.priority}
                          </p>
                        </div>
                        <select
                          value={ticket.status}
                          onChange={(event) => auth.updateSupportTicketStatus(ticket.id, event.target.value)}
                        >
                          {Object.entries(supportStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="admin-ticket-message">{ticket.message}</p>
                      {renderContactActions(ticket.profile_snapshot)}

                      {ticket.admin_reply && (
                        <div className="support-reply-box admin-reply-preview">
                          <CheckCircle2 size={17} />
                          <div>
                            <span>Resposta enviada</span>
                            <p>{ticket.admin_reply}</p>
                          </div>
                        </div>
                      )}

                      <button
                        className="text-switch-action admin-default-reply"
                        type="button"
                        onClick={() =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [ticket.id]: adminSettings.defaultReply
                          }))
                        }
                      >
                        Usar resposta padrão
                      </button>

                      <div className="admin-reply-form">
                        <textarea
                          value={replyDrafts[ticket.id] || ""}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))
                          }
                          placeholder="Responder para o cliente dentro da plataforma..."
                        />
                        <button
                          className="primary-flow-action"
                          type="button"
                          onClick={() => handleReply(ticket.id)}
                          disabled={auth.adminLoading || !(replyDrafts[ticket.id] || "").trim()}
                        >
                          {auth.adminLoading ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
                          Responder
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </section>
            )}

            {activeView === "reviews" && (
              <section className="admin-pro-section admin-card-grid">
                {auth.adminReviews.length === 0 ? (
                  <p className="empty-state">Nenhuma avaliação recebida ainda.</p>
                ) : (
                  auth.adminReviews.map((review) => (
                    <article key={review.id} className="admin-review-card">
                      <div className="rating-display">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={16} className={index < review.rating ? "active" : undefined} />
                        ))}
                      </div>
                      <p>{review.comment}</p>
                      <span>
                        {getClientLabel(review.profile_snapshot)} - {new Date(review.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </article>
                  ))
                )}
              </section>
            )}

            {activeView === "reports" && (
              <section className="admin-pro-section admin-reports-section">
                <div className="admin-section-heading">
                  <span>Relatórios</span>
                  <h2>Visão de gestão para tomada de decisão</h2>
                  <p>Indicadores comerciais, operacionais e de atendimento para acompanhar a plataforma com clareza.</p>
                </div>

                <div className="admin-report-builder">
                  <div className="admin-report-builder-head">
                    <div>
                      <span>PDF operacional</span>
                      <h3>Escolha o que entra no relatório</h3>
                      <p>Marque as áreas que devem aparecer e gere uma versão pronta para salvar como PDF.</p>
                    </div>
                    <button className="primary-flow-action" type="button" onClick={generateReportPdf}>
                      <FileText size={17} />
                      Gerar PDF
                    </button>
                  </div>

                  <div className="admin-report-options">
                    {(Object.keys(reportOptions) as ReportSectionKey[]).map((section) => (
                      <label key={section} className="admin-report-option">
                        <input
                          type="checkbox"
                          checked={reportOptions[section]}
                          onChange={() => toggleReportOption(section)}
                        />
                        <span>
                          <strong>{reportSectionLabels[section]}</strong>
                          <small>
                            {section === "clients" && `${auth.adminProfiles.length} cadastro(s)`}
                            {section === "quotes" && `${auth.adminRequests.length} orçamento(s)`}
                            {section === "subscriptions" && `${auth.adminSubscriptions.length} assinatura(s)`}
                            {section === "support" && `${auth.adminSupportTickets.length} ticket(s)`}
                            {section === "reviews" && `${auth.adminReviews.length} avaliação(ões)`}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>

                  {reportNotice && <p className="flow-note">{reportNotice}</p>}
                </div>

                <div className="admin-report-grid">
                  {reportCards.map(({ icon: ReportIcon, label, text, value }) => (
                    <article key={label} className="admin-report-card">
                      <ReportIcon size={20} />
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>

                <div className="admin-report-table">
                  <div className="admin-report-table-head">
                    <span>Área</span>
                    <span>Indicador principal</span>
                    <span>Status</span>
                    <span>Ação recomendada</span>
                  </div>
                  {[
                    [
                      "Comercial",
                      `${auth.adminRequests.length} orçamento(s) no funil`,
                      bestPlan?.requests ? `${bestPlan.plan.name} lidera a demanda` : "Sem demanda registrada",
                      "Priorizar contatos com plano escolhido e observação preenchida."
                    ],
                    [
                      "Clientes",
                      `${averageProfileCompletion}% de completude média`,
                      auth.adminProfiles.length ? "Base em formação" : "Base vazia",
                      "Incentivar perfil completo antes da proposta final."
                    ],
                    [
                      "Assinaturas",
                      `${activeSubscriptions.length} ativa(s), ${requestedSubscriptions.length} solicitada(s)`,
                      conversionRate >= 30 ? "Boa ativação" : "Ativação em evolução",
                      "Acompanhar solicitações paradas e mover para proposta enviada."
                    ],
                    [
                      "Suporte",
                      `${openTickets.length} ticket(s) aberto(s)`,
                      openTickets.length ? "Atenção no SLA" : "Fila limpa",
                      "Responder dentro do prazo configurado e registrar solução."
                    ],
                    [
                      "Satisfação",
                      averageRating ? `${averageRating.toFixed(1)}/5 de média` : "Sem histórico",
                      auth.adminReviews.length ? "Feedback disponível" : "Aguardando avaliações",
                      "Usar avaliações como prova social e fonte de melhoria."
                    ]
                  ].map(([area, metric, status, action]) => (
                    <div key={area} className="admin-report-table-row">
                      <strong>{area}</strong>
                      <span>{metric}</span>
                      <span>{status}</span>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeView === "settings" && (
              <section className="admin-pro-section admin-settings-layout">
                <article className="admin-settings-panel">
                  <div className="admin-settings-head">
                    <Settings size={22} />
                    <div>
                      <span>Configurações do painel</span>
                      <h2>Preferências operacionais</h2>
                      <p>Defina como você quer acompanhar orçamentos e responder clientes.</p>
                    </div>
                  </div>

                  <div className="admin-settings-grid">
                    <label>
                      E-mail admin
                      <input value={ADMIN_EMAIL} disabled />
                    </label>

                    <label>
                      SLA de resposta
                      <input
                        value={adminSettings.slaTarget}
                        onChange={(event) => updateAdminSetting("slaTarget", event.target.value)}
                        placeholder="Ex.: 24h"
                      />
                    </label>

                    <label>
                      Canal preferido
                      <input
                        value={adminSettings.preferredChannel}
                        onChange={(event) => updateAdminSetting("preferredChannel", event.target.value)}
                        placeholder="Ex.: WhatsApp + plataforma"
                      />
                    </label>

                    <label>
                      Resposta padrão de suporte
                      <textarea
                        value={adminSettings.defaultReply}
                        onChange={(event) => updateAdminSetting("defaultReply", event.target.value)}
                        placeholder="Mensagem usada para responder tickets rapidamente."
                      />
                    </label>
                  </div>

                  <div className="admin-settings-toggles">
                    <label className="admin-setting-toggle">
                      <input
                        type="checkbox"
                        checked={adminSettings.autoEmailAlerts}
                        onChange={(event) => updateAdminSetting("autoEmailAlerts", event.target.checked)}
                      />
                      <span>
                        <strong>Alertas por e-mail</strong>
                        <small>Manter EmailJS como canal de confirmação dos orçamentos.</small>
                      </span>
                    </label>

                    <label className="admin-setting-toggle">
                      <input
                        type="checkbox"
                        checked={adminSettings.requireProfileBeforeQuote}
                        onChange={(event) => updateAdminSetting("requireProfileBeforeQuote", event.target.checked)}
                      />
                      <span>
                        <strong>Perfil completo antes do envio</strong>
                        <small>Exigir dados do cliente antes de finalizar o orçamento.</small>
                      </span>
                    </label>
                  </div>

                  <button className="primary-flow-action" type="button" onClick={saveAdminSettings}>
                    <Settings size={17} />
                    Salvar configurações
                  </button>

                  {settingsNotice && <p className="flow-note">{settingsNotice}</p>}
                </article>

                <aside className="admin-settings-panel admin-system-panel">
                  <span>Status do sistema</span>
                  <div>
                    <strong>Supabase</strong>
                    <small>{auth.supabase ? "Conectado" : "Não configurado"}</small>
                  </div>
                  <div>
                    <strong>Conta admin</strong>
                    <small>{auth.accountEmail}</small>
                  </div>
                  <div>
                    <strong>Orçamentos carregados</strong>
                    <small>{auth.adminRequests.length}</small>
                  </div>
                  <div>
                    <strong>Tickets carregados</strong>
                    <small>{auth.adminSupportTickets.length}</small>
                  </div>
                </aside>
              </section>
            )}

            {activeView !== "dashboard" && (
              <div className="admin-data-note">
                <AlertCircle size={15} />
                Dados protegidos por RLS. Apenas a conta admin visualiza todos os registros.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
