import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/(auth)/actions";
import { CommunityThemesPanel } from "@/components/dashboard/community-themes-panel";
import { LinkManager } from "@/components/dashboard/link-manager";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { UsernameSetup } from "@/components/dashboard/username-setup";
import { ProfilePreview } from "@/components/profile/profile-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureUserProfile, hasTemporaryUsername } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type {
  CommunityThemeWithAuthor,
  Profile,
  ProfileLink,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const resolvedProfile = profile ?? (await ensureUserProfile(supabase, user));

  if (!resolvedProfile) {
    redirect("/login");
  }

  const typedProfile = resolvedProfile as Profile;

  const { data: rawLinks } = await supabase
    .from("profile_links")
    .select("*")
    .eq("profile_id", typedProfile.id)
    .order("position", { ascending: true });
  const links = (rawLinks ?? []) as ProfileLink[];
  const { data: rawCommunityThemes } = await supabase
    .from("community_themes")
    .select("*, author:profiles!community_themes_author_profile_id_fkey(username, display_name, avatar_url)")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  const communityThemes = (rawCommunityThemes ?? []) as CommunityThemeWithAuthor[];
  const isAdmin = Boolean(typedProfile.is_admin) || typedProfile.username === "ghxsty";

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="flex w-full flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <Image src="/glitch-logo.png" alt="ghxsty.lol" width={22} height={22} className="rounded" />
              ghxsty.lol
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <Link
              href={`/${typedProfile.username}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <ExternalLink className="h-4 w-4" />
              Profili aç
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            </form>
          </div>
        </header>

        {hasTemporaryUsername(typedProfile) ? (
          <UsernameSetup profile={typedProfile} />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
                <CardDescription>
                  Görünen isim, kullanıcı adı, bio, görünüm ve görseller.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditor key={typedProfile.updated_at} profile={typedProfile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topluluk Temaları</CardTitle>
                <CardDescription>
                  Onaylanan temaları kullan veya kendi görünümünü gönder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommunityThemesPanel themes={communityThemes} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Linkler</CardTitle>
                <CardDescription>
                  Sosyal link ekle, sil ve sürükle bırak ile sırala.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LinkManager links={links} />
              </CardContent>
            </Card>
          </div>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Canlı önizleme</CardTitle>
                <CardDescription>Public profil görünümünün kompakt hali.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ProfilePreview
                  key={typedProfile.updated_at}
                  profile={typedProfile}
                  links={links}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
