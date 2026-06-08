import { redirect } from "next/navigation";
import { CommunityThemesPanel } from "@/components/dashboard/community-themes-panel";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { CommunityThemeWithAuthor, Profile } from "@/types/database";

export default async function DashboardThemesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/themes");
  }

  const profile = (await ensureUserProfile(supabase, user)) as Profile | null;
  if (!profile) {
    redirect("/dashboard");
  }

  const { data: rawCommunityThemes } = await supabase
    .from("community_themes")
    .select("*, author:profiles!community_themes_author_profile_id_fkey(username, display_name, avatar_url)")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  const communityThemes = (rawCommunityThemes ?? []) as CommunityThemeWithAuthor[];

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={profile.username} />
        <div className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Temalar</CardTitle>
              <CardDescription>
                Topluluk temalarını incele, kendi görünümünü gönder veya onaylı temaları profilinde kullan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityThemesPanel themes={communityThemes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
