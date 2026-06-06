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
