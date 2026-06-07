"use server";

import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, normalizeUsername } from "@/lib/utils";
import { validateUsername } from "@/lib/validation";

export type AuthState = {
  error?: string;
  success?: string;
};

async function verifyTurnstile(formData: FormData) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return true;
  }

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!token) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: "Email veya şifre hatalı." };
  }

  await supabase.auth.setSession(data.session);

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function discordLoginAction(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard");
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      scopes: "identify",
    },
  });

  if (error || !data.url) {
    redirect("/login?oauth=discord-error");
  }

  redirect(data.url);
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const usernameError = validateUsername(username);
  if (usernameError) {
    return { error: usernameError };
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  const captchaOk = await verifyTurnstile(formData);
  if (!captchaOk) {
    return { error: "Bot koruması doğrulanamadı. Lütfen tekrar dene." };
  }

  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Kayıt oluşturulamadı." };
  }

  if (!data.session) {
    return {
      success:
        "Kayıt alındı. Supabase email doğrulaması açıksa gelen kutundaki linke tıklayıp giriş yap.",
    };
  }

  await supabase.auth.setSession(data.session);

  const profile = await ensureUserProfile(supabase, data.user);
  if (!profile) {
    return {
      error:
        "Hesap oluştu ama profil oluşturulamadı. Supabase SQL trigger/RLS ayarlarını tekrar çalıştır.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
