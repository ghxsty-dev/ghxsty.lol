import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import {
  applyCommunityThemeToProfileAction,
  cloneProfileAsCommunityThemeAction,
  deleteCommunityThemeAction,
  setCommunityThemeStatusAction,
  setProfileAdminAction,
  updateProfileFromAdminAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type {
  CommunityThemeWithAuthor,
  Profile,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const adminProfile = await ensureUserProfile(supabase, user);
  if (!adminProfile || (!adminProfile.is_admin && adminProfile.username !== "ghxsty")) {
    redirect("/dashboard");
  }

  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const profiles = (rawProfiles ?? []) as Profile[];

  const { data: rawThemes } = await supabase
    .from("community_themes")
    .select("*, author:profiles!community_themes_author_profile_id_fkey(username, display_name, avatar_url)")
    .order("created_at", { ascending: false });
  const themes = (rawThemes ?? []) as CommunityThemeWithAuthor[];
  const approvedThemes = themes.filter((theme) => theme.status === "approved");

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-normal">
              <ShieldCheck className="h-7 w-7" />
              Admin Paneli
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            @{adminProfile.username} olarak yönetiyorsun.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Topluluk Tema Onayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-2">
              {themes.length ? (
                themes.map((theme) => (
                  <article
                    key={theme.id}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{theme.name}</h2>
                        <p className="text-xs text-zinc-500">
                          @{theme.author?.username ?? "unknown"} · {theme.status}
                        </p>
                      </div>
                      <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300">
                        {theme.status}
                      </span>
                    </div>
                    {theme.description ? (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {theme.description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={setCommunityThemeStatusAction}>
                        <input type="hidden" name="theme_id" value={theme.id} />
                        <input type="hidden" name="status" value="approved" />
                        <Button type="submit" size="sm">Onayla</Button>
                      </form>
                      <form action={setCommunityThemeStatusAction}>
                        <input type="hidden" name="theme_id" value={theme.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Button type="submit" size="sm" variant="secondary">Reddet</Button>
                      </form>
                      <form action={setCommunityThemeStatusAction}>
                        <input type="hidden" name="theme_id" value={theme.id} />
                        <input type="hidden" name="status" value="pending" />
                        <Button type="submit" size="sm" variant="ghost">Beklemeye al</Button>
                      </form>
                      <form action={deleteCommunityThemeAction}>
                        <input type="hidden" name="theme_id" value={theme.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                          Sil
                        </Button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400 lg:col-span-2">
                  Henüz gönderilmiş tema yok.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar ve Arayüz Kontrolü</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold">
                        {profile.display_name || profile.username}
                      </h2>
                      <p className="text-sm text-zinc-500">@{profile.username}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/${profile.username}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white transition hover:bg-white/15"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Aç
                      </Link>
                      <form action={setProfileAdminAction} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
                        <input type="hidden" name="profile_id" value={profile.id} />
                        <input
                          id={`admin-${profile.id}`}
                          name="is_admin"
                          type="checkbox"
                          defaultChecked={profile.is_admin ?? false}
                          className="h-4 w-4 accent-white"
                        />
                        <Label htmlFor={`admin-${profile.id}`}>Admin</Label>
                        <Button type="submit" size="sm" variant="ghost">Kaydet</Button>
                      </form>
                    </div>
                  </div>

                  <form action={updateProfileFromAdminAction} className="grid gap-4 lg:grid-cols-4">
                    <input type="hidden" name="profile_id" value={profile.id} />
                    <input type="hidden" name="current_username" value={profile.username} />
                    <div className="space-y-2">
                      <Label htmlFor={`username-${profile.id}`}>Kullanıcı adı</Label>
                      <Input id={`username-${profile.id}`} name="username" defaultValue={profile.username} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`display-${profile.id}`}>Görünen isim</Label>
                      <Input id={`display-${profile.id}`} name="display_name" defaultValue={profile.display_name ?? ""} />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor={`bio-${profile.id}`}>Bio</Label>
                      <Textarea id={`bio-${profile.id}`} name="bio" defaultValue={profile.bio ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`accent-${profile.id}`}>Vurgu</Label>
                      <Input id={`accent-${profile.id}`} name="accent_color" type="color" defaultValue={profile.accent_color ?? "#ffffff"} className="h-10 w-16 p-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`page-${profile.id}`}>Sayfa</Label>
                      <Input id={`page-${profile.id}`} name="page_background_color" type="color" defaultValue={profile.page_background_color ?? "#050507"} className="h-10 w-16 p-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`panel-${profile.id}`}>Panel</Label>
                      <Input id={`panel-${profile.id}`} name="panel_background_color" type="color" defaultValue={profile.panel_background_color ?? "#111113"} className="h-10 w-16 p-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`panel-opacity-${profile.id}`}>Panel opaklık</Label>
                      <Input id={`panel-opacity-${profile.id}`} name="panel_opacity" type="range" min="10" max="100" defaultValue={profile.panel_opacity ?? 70} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`button-opacity-${profile.id}`}>Link opaklık</Label>
                      <Input id={`button-opacity-${profile.id}`} name="button_opacity" type="range" min="0" max="100" defaultValue={profile.button_opacity ?? 12} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`panel-radius-${profile.id}`}>Panel köşe</Label>
                      <Input id={`panel-radius-${profile.id}`} name="panel_radius" type="range" min="0" max="32" defaultValue={profile.panel_radius ?? 8} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`button-radius-${profile.id}`}>Link köşe</Label>
                      <Input id={`button-radius-${profile.id}`} name="button_radius" type="range" min="0" max="32" defaultValue={profile.button_radius ?? 6} />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit">Profili güncelle</Button>
                    </div>
                  </form>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <form action={cloneProfileAsCommunityThemeAction} className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-end">
                      <input type="hidden" name="profile_id" value={profile.id} />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`clone-theme-${profile.id}`}>Bu arayüzü tema yap</Label>
                        <Input id={`clone-theme-${profile.id}`} name="name" placeholder={`${profile.username} theme`} />
                      </div>
                      <Button type="submit" variant="secondary">Tema oluştur</Button>
                    </form>
                    <form action={applyCommunityThemeToProfileAction} className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-end">
                      <input type="hidden" name="profile_id" value={profile.id} />
                      <input type="hidden" name="current_username" value={profile.username} />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`apply-theme-${profile.id}`}>Onaylı tema uygula</Label>
                        <select
                          id={`apply-theme-${profile.id}`}
                          name="theme_id"
                          className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                        >
                          {approvedThemes.map((theme) => (
                            <option key={theme.id} value={theme.id}>{theme.name}</option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" variant="secondary" disabled={!approvedThemes.length}>
                        Uygula
                      </Button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
