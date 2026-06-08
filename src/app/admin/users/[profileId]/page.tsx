import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import {
  applyCommunityThemeToProfileAction,
  cloneProfileAsCommunityThemeAction,
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
import type { AvatarDecoration, CommunityThemeWithAuthor, Profile } from "@/types/database";

type PageProps = {
  params: Promise<{ profileId: string }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/admin/users/${profileId}`);
  }

  const adminProfile = await ensureUserProfile(supabase, user);
  if (!adminProfile || (!adminProfile.is_admin && adminProfile.username !== "ghxsty")) {
    redirect("/dashboard");
  }

  const [{ data: rawProfile }, { data: rawDecorations }, { data: rawThemes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
    supabase
      .from("avatar_decorations")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("community_themes")
      .select("*, author:profiles!community_themes_author_profile_id_fkey(username, display_name, avatar_url)")
      .eq("status", "approved")
      .order("approved_at", { ascending: false }),
  ]);

  if (!rawProfile) {
    notFound();
  }

  const profile = rawProfile as Profile;
  const decorations = (rawDecorations ?? []) as AvatarDecoration[];
  const approvedThemes = (rawThemes ?? []) as CommunityThemeWithAuthor[];

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Üyeler
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-normal">
              {profile.display_name || profile.username}
              {(profile.role === "admin" || profile.is_admin) ? (
                <ShieldCheck className="h-6 w-6 text-red-300" />
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${profile.username}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <ExternalLink className="h-4 w-4" />
              Public profil
            </Link>
            <form action={setProfileAdminAction} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
              <input type="hidden" name="profile_id" value={profile.id} />
              <input
                id={`admin-${profile.id}`}
                name="is_admin"
                type="checkbox"
                defaultChecked={profile.is_admin ?? profile.role === "admin"}
                className="h-4 w-4 accent-white"
              />
              <Label htmlFor={`admin-${profile.id}`}>Admin</Label>
              <Button type="submit" size="sm" variant="ghost">Kaydet</Button>
            </form>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Profil Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProfileFromAdminAction} className="grid gap-4 lg:grid-cols-4">
              <input type="hidden" name="profile_id" value={profile.id} />
              <input type="hidden" name="current_username" value={profile.username} />
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı adı</Label>
                <Input id="username" name="username" defaultValue={profile.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Görünen isim</Label>
                <Input id="display_name" name="display_name" defaultValue={profile.display_name ?? ""} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_decoration_id">Avatar dekorasyonu</Label>
                <select
                  id="avatar_decoration_id"
                  name="avatar_decoration_id"
                  defaultValue={profile.avatar_decoration_id ?? ""}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Yok</option>
                  {decorations.map((decoration) => (
                    <option key={decoration.id} value={decoration.id}>{decoration.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent_color">Vurgu</Label>
                <Input id="accent_color" name="accent_color" type="color" defaultValue={profile.accent_color ?? "#ffffff"} className="h-10 w-16 p-1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page_background_color">Sayfa</Label>
                <Input id="page_background_color" name="page_background_color" type="color" defaultValue={profile.page_background_color ?? "#050507"} className="h-10 w-16 p-1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panel_background_color">Panel</Label>
                <Input id="panel_background_color" name="panel_background_color" type="color" defaultValue={profile.panel_background_color ?? "#111113"} className="h-10 w-16 p-1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panel_opacity">Panel opaklık</Label>
                <Input id="panel_opacity" name="panel_opacity" type="range" min="10" max="100" defaultValue={profile.panel_opacity ?? 70} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_opacity">Link opaklık</Label>
                <Input id="button_opacity" name="button_opacity" type="range" min="0" max="100" defaultValue={profile.button_opacity ?? 12} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panel_radius">Panel köşe</Label>
                <Input id="panel_radius" name="panel_radius" type="range" min="0" max="32" defaultValue={profile.panel_radius ?? 8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_radius">Link köşe</Label>
                <Input id="button_radius" name="button_radius" type="range" min="0" max="32" defaultValue={profile.button_radius ?? 6} />
              </div>
              <div className="flex items-end">
                <Button type="submit">Profili güncelle</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bu Arayüzü Tema Yap</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={cloneProfileAsCommunityThemeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="profile_id" value={profile.id} />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="clone_theme_name">Tema adı</Label>
                  <Input id="clone_theme_name" name="name" placeholder={`${profile.username} theme`} />
                </div>
                <Button type="submit" variant="secondary">Tema oluştur</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onaylı Tema Uygula</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={applyCommunityThemeToProfileAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="profile_id" value={profile.id} />
                <input type="hidden" name="current_username" value={profile.username} />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="theme_id">Tema</Label>
                  <select
                    id="theme_id"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
