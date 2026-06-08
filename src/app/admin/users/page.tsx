import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Search, Settings, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

function cleanSearch(value?: string) {
  return String(value ?? "")
    .replace(/[%_,()]/g, " ")
    .trim()
    .slice(0, 60);
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = cleanSearch(q);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/users");
  }

  const adminProfile = await ensureUserProfile(supabase, user);
  if (!adminProfile || (!adminProfile.is_admin && adminProfile.username !== "ghxsty")) {
    redirect("/dashboard");
  }

  let request = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (query) {
    request = request.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);
  }

  const { data } = await request;
  const profiles = (data ?? []) as Profile[];

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Admin paneli
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-normal">
              <UserRound className="h-7 w-7" />
              Üyeler
            </h1>
          </div>
          <p className="text-sm text-zinc-400">En fazla 50 sonuç gösterilir.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Üye Ara</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input name="q" defaultValue={query} placeholder="Kullanıcı adı veya görünen isim" />
              <Button type="submit">
                <Search className="h-4 w-4" />
                Ara
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {profiles.length ? (
            profiles.map((profile) => (
              <article
                key={profile.id}
                className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">
                      {profile.display_name || profile.username}
                    </h2>
                    {(profile.role === "admin" || profile.is_admin) ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-red-400/30 bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
                  <p className="mt-2 line-clamp-1 text-sm text-zinc-400">
                    {profile.bio || "Bio yok."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${profile.username}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Profil
                  </Link>
                  <Link
                    href={`/admin/users/${profile.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-zinc-400">
                Aramaya uygun üye bulunamadı.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
