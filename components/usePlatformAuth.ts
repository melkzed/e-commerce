"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_EMAIL,
  demoProfile,
  emptyProfile,
  type ClientProfile,
  type ProfileRow,
  type QuoteRequestRow
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
  const [adminLoading, setAdminLoading] = useState(false);
  const [authActionLoading, setAuthActionLoading] = useState(false);

  const accountEmail = session?.user.email || profile.email;
  const isConnected = Boolean(session?.user);
  const isLoggedIn = Boolean(session?.user || demoMode);
  const isAdmin = Boolean(session?.user?.email?.toLowerCase() === ADMIN_EMAIL);

  useEffect(() => {
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

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setAuthLoading(false);
      window.clearTimeout(fallbackTimer);
    });

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

    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setAdminRequests((data || []) as QuoteRequestRow[]);
    }

    setAdminLoading(false);
  }, [isAdmin, supabase]);

  useEffect(() => {
    refreshAdminRequests();
  }, [refreshAdminRequests]);

  const handleGoogleLogin = async (redirectTo?: string) => {
    if (!supabase) {
      setProfileNotice("Configure as variaveis do Supabase para liberar login com Google.");
      return;
    }

    setProfileNotice("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || window.location.href
      }
    });

    if (error) {
      setProfileNotice("Nao foi possivel iniciar o login com Google.");
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
      setProfileNotice("Configure o Supabase para liberar cadastro e login por email.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || password.length < 6) {
      setProfileNotice("Informe um email valido e uma senha com pelo menos 6 caracteres.");
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
          setProfileNotice("Conta criada. Confirme seu email para entrar.");
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
          ? "Nao foi possivel criar a conta agora."
          : "Email ou senha incorretos."
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
    setProfileNotice("");

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
      setProfileNotice("Perfil salvo. Email e CPF/CNPJ ficam travados no cadastro.");
    } catch {
      setProfileNotice("Nao foi possivel salvar o perfil agora.");
    } finally {
      setProfileLoading(false);
    }
  };

  return {
    accountEmail,
    adminLoading,
    adminRequests,
    authActionLoading,
    authLoading,
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
    saveProfile,
    session,
    setAdminRequests,
    setProfileNotice,
    supabase,
    taxIdLocked
  };
}
