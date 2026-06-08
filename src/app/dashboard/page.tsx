import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { CommunityThemesPanel } from "@/components/dashboard/community-themes-panel";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
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
import { ensureUserProfile, hasTemporaryUsername } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type {
  CommunityThemeWithAuthor,
  Profile,
  ProfileLink,
  AvatarDecoration,
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
  const { data: rawDecorations } = await supabase
    .from("avatar_decorations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  const decorations = (rawDecorations ?? []) as AvatarDecoration[];
  const activeDecoration =
    decorations.find((decoration) => decoration.id === typedProfile.avatar_decoration_id) ?? null;
  const isAdmin = Boolean(typedProfile.is_admin) || typedProfile.username === "ghxsty";

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="grid w-full gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={typedProfile.username} />
        <div className="flex min-w-0 flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Profil, görünüm, medya ve linklerini tek yerden yönet.
            </p>
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
                <ProfileEditor
                  key={typedProfile.updated_at}
                  profile={typedProfile}
                />
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
                  decoration={activeDecoration}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
        </div>
      </div>
    </main>
  );
}
