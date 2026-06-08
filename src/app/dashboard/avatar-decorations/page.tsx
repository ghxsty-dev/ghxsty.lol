import Image from "next/image";
import { Check, X } from "lucide-react";
import { setAvatarDecorationAction } from "@/app/dashboard/actions";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { AvatarDecoration, Profile } from "@/types/database";
import { redirect } from "next/navigation";

export default async function AvatarDecorationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/avatar-decorations");
  }

  const profile = (await ensureUserProfile(supabase, user)) as Profile | null;
  if (!profile) {
    redirect("/dashboard");
  }

  const { data } = await supabase
    .from("avatar_decorations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  const decorations = (data ?? []) as AvatarDecoration[];

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={profile.username} />
        <div className="min-w-0">
        <header className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold">Avatar Dekorasyonları</h1>
            <p className="mt-1 text-sm text-zinc-500">Bir dekorasyon kartına tıklayarak avatarına uygula.</p>
          </div>
          <form action={setAvatarDecorationAction}>
            <input type="hidden" name="avatar_decoration_id" value="" />
            <Button type="submit" variant="secondary">
              <X className="h-4 w-4" />
              Dekorasyonu kaldır
            </Button>
          </form>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {decorations.map((decoration) => {
            const selected = profile.avatar_decoration_id === decoration.id;
            return (
              <form key={decoration.id} action={setAvatarDecorationAction}>
                <input type="hidden" name="avatar_decoration_id" value={decoration.id} />
                <button
                  type="submit"
                  className="group relative w-full rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-black/30">
                    <Image
                      src={decoration.image_url}
                      alt=""
                      width={160}
                      height={160}
                      unoptimized
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-semibold">{decoration.name}</p>
                    {selected ? (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-zinc-950">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                </button>
              </form>
            );
          })}
        </div>
        </div>
      </div>
    </main>
  );
}
