import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Mail, UserRound } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { AccountSettingsForm } from "@/components/dashboard/account-settings-form";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function DashboardAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/account");
  }

  const profile = (await ensureUserProfile(supabase, user)) as Profile | null;
  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={profile.username} isAdmin={profile.role === "admin" || profile.is_admin === true} />
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hesap Ayarları</CardTitle>
              <CardDescription>
                Oturum, hesap bilgisi ve hızlı hesap işlemleri.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-zinc-300" />
                  <div>
                    <p className="font-semibold">@{profile.username}</p>
                    <p className="text-sm text-zinc-500">{profile.display_name || "Görünen isim yok"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-zinc-300" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-zinc-500">{user.email ?? "Email bilgisi yok"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Adı</CardTitle>
              <CardDescription>
                Public profil adresini buradan değiştir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm username={profile.username} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link
                href={`/${profile.username}`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Public profili aç
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="destructive">
                  <LogOut className="h-4 w-4" />
                  Çıkış yap
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
