"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_EMAIL,
  type AdminProfileRow,
  type ClientReviewRow,
  type ClientSubscriptionRow,
  demoProfile,
  emptyProfile,
  type ClientProfile,
  type ProfileRow,
  type QuoteRequestRow,
  type SupportTicketRow,
  type SubscriptionKey
} from "@/lib/platform";
import { getSupabaseClient } from "@/lib/supabase/client";

const DEMO_PROFILE_KEY = "melkzedek-demo-profile";
const DEMO_MODE_KEY = "melkzedek-demo-mode";

function normalizeProfile(row: ProfileRow | null, user: User): ClientProfile {
  return {
    fullName: row?.full_name || user.user_metadata?.full_name || user.email || "",
    email: row?.email || user.email || "",
    companyName: row?.company_name || "",
    taxId: row?.tax_id || "",
    phone: row?.phone || "",
    segment: row?.segment || "",
    storeName: row?.store_name || ""
  };
}

function readStoredProfile() {
  if (typeof window === "undefined") {
    return demoProfile;
  }

  try {
    const stored = window.localStorage.getItem(DEMO_PROFILE_KEY);
    return stored ? { ...demoProfile, ...JSON.parse(stored) } : demoProfile;
  } catch {
    return demoProfile;
  }
}

function getCleanAuthRedirectUrl() {
  const url = new URL(window.location.href);

  [
    "access_token",
    "code",
    "error",
    "error_code",
    "error_description",
    "expires_in",
    "provider_refresh_token",
    "provider_token",
    "refresh_token",
    "token_type"
  ].forEach((key) => {
    url.searchParams.delete(key);
  });

  url.hash = "";

  return url.toString();
}

function getOAuthErrorMessage() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const description =
    searchParams.get("error_description") ||
    hashParams.get("error_description") ||
    searchParams.get("error") ||
    hashParams.get("error");

  return description ? decodeURIComponent(description.replace(/\+/g, " ")) : "";
}

function getOAuthCode() {
  return new URLSearchParams(window.location.search).get("code");
}

type SupabaseLikeError = {
  code?: string;
  details?: string;
  message?: string;
};

function isMissingTableError(error: SupabaseLikeError | null | undefined) {
  if (!error) {
    return false;
  }

  const text = `${error.code || ""} ${error.message || ""} ${error.details || ""}`.toLowerCase();

  return (
    text.includes("42p01") ||
    text.includes("pgrst205") ||
    text.includes("could not find the table") ||
    text.includes("does not exist") ||
    text.includes("not found")
  );
}

export function usePlatformAuth() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [profile, setProfile] = useState<ClientProfile>(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [taxIdLocked, setTaxIdLocked] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [adminRequests, setAdminRequests] = useState<QuoteRequestRow[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfileRow[]>([]);
  const [adminSubscriptions, setAdminSubscriptions] = useState<ClientSubscriptionRow[]>([]);
  const [adminSupportTickets, setAdminSupportTickets] = useState<SupportTicketRow[]>([]);
  const [adminReviews, setAdminReviews] = useState<ClientReviewRow[]>([]);
  const [adminDataNotice, setAdminDataNotice] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [clientQuoteRequests, setClientQuoteRequests] = useState<QuoteRequestRow[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRow[]>([]);
  const [clientReviews, setClientReviews] = useState<ClientReviewRow[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportNotice, setSupportNotice] = useState("");

  const accountEmail = session?.user.email || profile.email;
  const isConnected = Boolean(session?.user);
  const isLoggedIn = Boolean(session?.user || demoMode);
  const isAdmin = Boolean(session?.user?.email?.toLowerCase() === ADMIN_EMAIL);

  useEffect(() => {
    const oauthError = getOAuthErrorMessage();

    if (oauthError) {
      setProfileNotice(`Google não concluiu o login: ${oauthError}`);
      window.history.replaceState(null, "", getCleanAuthRedirectUrl());
    }

    const storedDemo =
      typeof window !== "undefined" &&
      window.localStorage.getItem(DEMO_MODE_KEY) === "true";

    if (storedDemo) {
      const storedProfile = readStoredProfile();
      setDemoMode(true);
      setProfile(storedProfile);
      setProfileSaved(Boolean(storedProfile.fullName || storedProfile.companyName));
      setTaxIdLocked(Boolean(storedProfile.taxId.trim()));
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const fallbackTimer = window.setTimeout(() => {
      if (active) {
        setAuthLoading(false);
      }
    }, 2500);

    const initializeSession = async () => {
      const code = getOAuthCode();

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) {
          return;
        }

        window.history.replaceState(null, "", getCleanAuthRedirectUrl());

        if (error) {
          setProfileNotice(
            `Google criou a conta, mas não conseguiu abrir a sessão: ${error.message}.`
          );
          setSession(null);
        } else {
          setSession(data.session);
        }

        setAuthLoading(false);
        window.clearTimeout(fallbackTimer);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setAuthLoading(false);
        window.clearTimeout(fallbackTimer);
        return;
      }

      setSession(data.session);
      setAuthLoading(false);
      window.clearTimeout(fallbackTimer);
    };

    initializeSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const client = supabase;
    const user = session?.user;

    if (!client || !user) {
      return;
    }

    const activeClient = client;
    const activeUser = user;
    let active = true;

    async function loadProfile() {
      setProfileLoading(true);

      const { data } = await activeClient
        .from("profiles")
        .select("email, full_name, company_name, tax_id, phone, segment, store_name")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      const nextProfile = normalizeProfile((data as ProfileRow | null) ?? null, activeUser);
      setProfile(nextProfile);
      setTaxIdLocked(Boolean(nextProfile.taxId.trim()));
      setProfileSaved(Boolean(data));
      setProfileLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user, supabase]);

  const refreshAdminRequests = useCallback(async () => {
    if (!supabase || !isAdmin) {
      return;
    }

    setAdminLoading(true);
    setAdminDataNotice("");

    const [requestsResult, profilesResult, subscriptionsResult, ticketsResult, reviewsResult] =
      await Promise.all([
        supabase
          .from("quote_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("client_subscriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("support_tickets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("client_reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80)
      ]);

    if (!requestsResult.error) {
      setAdminRequests((requestsResult.data || []) as QuoteRequestRow[]);
    }

    if (!profilesResult.error) {
      setAdminProfiles((profilesResult.data || []) as AdminProfileRow[]);
    }

    if (!subscriptionsResult.error) {
      setAdminSubscriptions((subscriptionsResult.data || []) as ClientSubscriptionRow[]);
    } else {
      setAdminSubscriptions([]);
    }

    if (!ticketsResult.error) {
      setAdminSupportTickets((ticketsResult.data || []) as SupportTicketRow[]);
    } else {
      setAdminSupportTickets([]);
    }

    if (!reviewsResult.error) {
      setAdminReviews((reviewsResult.data || []) as ClientReviewRow[]);
    } else {
      setAdminReviews([]);
    }

    const missingTables = [
      [subscriptionsResult.error, "client_subscriptions"],
      [ticketsResult.error, "support_tickets"],
      [reviewsResult.error, "client_reviews"]
    ]
      .filter(([error]) => isMissingTableError(error as SupabaseLikeError | null))
      .map(([, table]) => table);

    if (missingTables.length > 0) {
      setAdminDataNotice(
        `As tabelas ${missingTables.join(", ")} ainda não existem no Supabase. Rode o SQL de supabase/schema.sql para conectar assinaturas, suporte e avaliações ao admin.`
      );
    } else if (subscriptionsResult.error || ticketsResult.error || reviewsResult.error) {
      setAdminDataNotice("Alguns dados do admin não foram carregados. Confira as políticas RLS e as tabelas no Supabase.");
    }

    setAdminLoading(false);
  }, [isAdmin, supabase]);

  useEffect(() => {
    refreshAdminRequests();
  }, [refreshAdminRequests]);

  const refreshClientSupport = useCallback(async () => {
    if (!supabase || !session?.user || isAdmin) {
      setClientQuoteRequests([]);
      setSupportTickets([]);
      setClientReviews([]);
      setSupportNotice("");
      return;
    }

    setSupportLoading(true);

    const [quotesResult, ticketsResult, reviewsResult] = await Promise.all([
      supabase
        .from("quote_requests")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("client_reviews")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    if (!quotesResult.error) {
      setClientQuoteRequests((quotesResult.data || []) as QuoteRequestRow[]);
    }

    if (!ticketsResult.error) {
      setSupportTickets((ticketsResult.data || []) as SupportTicketRow[]);
    }

    if (!reviewsResult.error) {
      setClientReviews((reviewsResult.data || []) as ClientReviewRow[]);
    }

    if (quotesResult.error || ticketsResult.error || reviewsResult.error) {
      setSupportNotice("Suporte ainda precisa das tabelas novas no Supabase.");
    }

    setSupportLoading(false);
  }, [isAdmin, session?.user, supabase]);

  useEffect(() => {
    refreshClientSupport();
  }, [refreshClientSupport]);

  const handleGoogleLogin = async (redirectTo?: string) => {
    if (!supabase) {
      setProfileNotice("Configure as variáveis do Supabase para liberar login com Google.");
      return;
    }

    setProfileNotice("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || getCleanAuthRedirectUrl()
      }
    });

    if (error) {
      setProfileNotice("Não foi possível iniciar o login com Google.");
    }
  };

  const handleEmailAuth = async ({
    email,
    fullName,
    mode,
    password
  }: {
    email: string;
    fullName?: string;
    mode: "login" | "register";
    password: string;
  }) => {
    if (!supabase) {
      setProfileNotice("Configure o Supabase para liberar cadastro e login por e-mail.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || password.length < 6) {
      setProfileNotice("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setAuthActionLoading(true);
    setProfileNotice("");

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName?.trim() || cleanEmail
            },
            emailRedirectTo: window.location.href
          }
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setProfileNotice("Conta criada. Confirme seu e-mail para entrar.");
        } else {
          setProfileNotice("Conta criada e conectada.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          throw error;
        }

        setProfileNotice("Conta conectada.");
      }
    } catch {
      setProfileNotice(
        mode === "register"
          ? "Não foi possível criar a conta agora."
          : "E-mail ou senha incorretos."
      );
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const storedProfile = readStoredProfile();
    setDemoMode(true);
    setProfile(storedProfile);
    setProfileSaved(false);
    setTaxIdLocked(Boolean(storedProfile.taxId.trim()));
    setProfileNotice("Modo demo ativo ate conectar o Supabase.");

    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_MODE_KEY, "true");
      window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(storedProfile));
    }
  };

  const handleLogout = async () => {
    if (supabase && session?.user) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setDemoMode(false);
    setProfile(emptyProfile);
    setProfileSaved(false);
    setTaxIdLocked(false);
    setAdminRequests([]);
    setAdminProfiles([]);
    setAdminSubscriptions([]);
    setAdminSupportTickets([]);
    setAdminReviews([]);
    setAdminDataNotice("");
    setSupportTickets([]);
    setClientReviews([]);
    setProfileNotice("");
    setSupportNotice("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_MODE_KEY);
      window.localStorage.removeItem(DEMO_PROFILE_KEY);
    }
  };

  const handleProfileChange = (field: keyof ClientProfile, value: string) => {
    if (field === "email") {
      return;
    }

    if (field === "taxId" && taxIdLocked) {
      return;
    }

    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    if (!isLoggedIn) {
      setProfileNotice("Entre na plataforma antes de salvar o perfil.");
      return;
    }

    setProfileLoading(true);
    setProfileNotice("");

    try {
      if (supabase && session?.user) {
        const { error } = await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email || profile.email,
          full_name: profile.fullName,
          company_name: profile.companyName,
          tax_id: profile.taxId,
          phone: profile.phone,
          segment: profile.segment,
          store_name: profile.storeName
        });

        if (error) {
          throw error;
        }
      }

      if (demoMode && typeof window !== "undefined") {
        window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
      }

      setProfileSaved(true);
      setTaxIdLocked(Boolean(profile.taxId.trim()));
    setProfileNotice("Perfil salvo. E-mail e CPF/CNPJ ficam travados no cadastro.");
    } catch {
      setProfileNotice("Não foi possível salvar o perfil agora.");
    } finally {
      setProfileLoading(false);
    }
  };

  const createSubscriptionRequest = async (planKey: SubscriptionKey, sourceRequestId?: string) => {
    if (!supabase || !session?.user) {
      return;
    }

    const { data, error } = await supabase
      .from("client_subscriptions")
      .insert({
        user_id: session.user.id,
        plan_key: planKey,
        status: "requested",
        profile_snapshot: profile,
        source_request_id: sourceRequestId || null
      })
      .select("*")
      .single();

    if (!error && data) {
      setAdminSubscriptions((current) => [data as ClientSubscriptionRow, ...current]);
    }
  };

  const createSupportTicket = async ({
    message,
    priority,
    subject
  }: {
    message: string;
    priority: string;
    subject: string;
  }) => {
    if (!session?.user || !supabase) {
      setSupportNotice("Entre na plataforma para abrir um ticket.");
      return false;
    }

    if (!subject.trim() || !message.trim()) {
      setSupportNotice("Informe o assunto e a mensagem do suporte.");
      return false;
    }

    setSupportLoading(true);
    setSupportNotice("");

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: session.user.id,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: "open",
        profile_snapshot: profile
      })
      .select("*")
      .single();

    setSupportLoading(false);

    if (error) {
      setSupportNotice("Não foi possível abrir o ticket. Confira se o SQL novo foi aplicado no Supabase.");
      return false;
    }

    setSupportTickets((current) => [data as SupportTicketRow, ...current]);
    setSupportNotice("Ticket enviado. Você acompanha a resposta aqui na plataforma.");
    await refreshAdminRequests();
    return true;
  };

  const submitClientReview = async ({ comment, rating }: { comment: string; rating: number }) => {
    if (!session?.user || !supabase) {
      setSupportNotice("Entre na plataforma para enviar uma avaliação.");
      return false;
    }

    if (rating < 1 || rating > 5 || !comment.trim()) {
      setSupportNotice("Escolha uma nota e escreva um comentário para enviar a avaliação.");
      return false;
    }

    setSupportLoading(true);
    setSupportNotice("");

    const { data, error } = await supabase
      .from("client_reviews")
      .insert({
        user_id: session.user.id,
        rating,
        comment: comment.trim(),
        status: "published",
        profile_snapshot: profile
      })
      .select("*")
      .single();

    setSupportLoading(false);

    if (error) {
      setSupportNotice("Não foi possível salvar a avaliação. Confira se o SQL novo foi aplicado no Supabase.");
      return false;
    }

    setClientReviews((current) => [data as ClientReviewRow, ...current]);
    setSupportNotice("Avaliação enviada. Obrigado pelo retorno.");
    await refreshAdminRequests();
    return true;
  };

  const replySupportTicket = async (ticketId: string, reply: string) => {
    if (!supabase || !isAdmin || !reply.trim()) {
      return false;
    }

    setAdminLoading(true);

    const { error } = await supabase
      .from("support_tickets")
      .update({
        admin_reply: reply.trim(),
        status: "answered"
      })
      .eq("id", ticketId);

    setAdminLoading(false);

    if (error) {
      return false;
    }

    setAdminSupportTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, admin_reply: reply.trim(), status: "answered" }
          : ticket
      )
    );
    return true;
  };

  const updateSupportTicketStatus = async (ticketId: string, status: string) => {
    if (!supabase || !isAdmin) {
      return false;
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId);

    if (error) {
      return false;
    }

    setAdminSupportTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket))
    );
    return true;
  };

  const updateQuoteRequestStatus = async (requestId: string, status: string) => {
    if (!supabase || !isAdmin) {
      return false;
    }

    const { error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      return false;
    }

    setAdminRequests((current) =>
      current.map((request) => (request.id === requestId ? { ...request, status } : request))
    );
    return true;
  };

  const replyQuoteRequest = async ({
    adminResponse,
    quoteValue,
    requestId
  }: {
    adminResponse: string;
    quoteValue: string;
    requestId: string;
  }) => {
    if (!supabase || !isAdmin || !adminResponse.trim() || !quoteValue.trim()) {
      return null;
    }

    setAdminLoading(true);

    const quoteRespondedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        admin_response: adminResponse.trim(),
        quote_response_email_status: "pending",
        quote_responded_at: quoteRespondedAt,
        quote_value: quoteValue.trim(),
        status: "proposta enviada"
      })
      .eq("id", requestId)
      .select("*")
      .single();

    setAdminLoading(false);

    if (error || !data) {
      return null;
    }

    const updatedRequest = data as QuoteRequestRow;

    setAdminRequests((current) =>
      current.map((request) => (request.id === requestId ? updatedRequest : request))
    );
    setClientQuoteRequests((current) =>
      current.map((request) => (request.id === requestId ? updatedRequest : request))
    );

    return updatedRequest;
  };

  const updateQuoteResponseEmailStatus = async (requestId: string, emailStatus: string) => {
    if (!supabase || !isAdmin) {
      return false;
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update({ quote_response_email_status: emailStatus })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error || !data) {
      return false;
    }

    const updatedRequest = data as QuoteRequestRow;

    setAdminRequests((current) =>
      current.map((request) => (request.id === requestId ? updatedRequest : request))
    );
    setClientQuoteRequests((current) =>
      current.map((request) => (request.id === requestId ? updatedRequest : request))
    );

    return true;
  };

  const updateSubscriptionStatus = async (subscriptionId: string, status: string) => {
    if (!supabase || !isAdmin) {
      return false;
    }

    const { error } = await supabase
      .from("client_subscriptions")
      .update({ status })
      .eq("id", subscriptionId);

    if (error) {
      return false;
    }

    setAdminSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === subscriptionId ? { ...subscription, status } : subscription
      )
    );
    return true;
  };

  return {
    accountEmail,
    adminDataNotice,
    adminLoading,
    adminProfiles,
    adminRequests,
    adminReviews,
    adminSubscriptions,
    adminSupportTickets,
    authActionLoading,
    authLoading,
    clientReviews,
    clientQuoteRequests,
    createSubscriptionRequest,
    createSupportTicket,
    demoMode,
    handleEmailAuth,
    handleDemoLogin,
    handleGoogleLogin,
    handleLogout,
    handleProfileChange,
    isAdmin,
    isConnected,
    isLoggedIn,
    profile,
    profileLoading,
    profileNotice,
    profileSaved,
    refreshAdminRequests,
    refreshClientSupport,
    replyQuoteRequest,
    replySupportTicket,
    saveProfile,
    session,
    setAdminRequests,
    setProfileNotice,
    setSupportNotice,
    submitClientReview,
    supabase,
    supportLoading,
    supportNotice,
    supportTickets,
    updateQuoteRequestStatus,
    updateQuoteResponseEmailStatus,
    updateSubscriptionStatus,
    updateSupportTicketStatus,
    taxIdLocked
  };
}
