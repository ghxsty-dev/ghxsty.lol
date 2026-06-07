import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { applyCommunityThemeAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { CommunityThemeWithAuthor } from "@/types/database";

export const metadata: Metadata = {
  title: "Topluluk Temaları",
};

export default async function ThemesPage() {
  const supabase = await createClient();
  const { data: rawThemes } = await supabase
    .from("community_themes")
    .select("*, author:profiles!community_themes_author_profile_id_fkey(username, display_name, avatar_url)")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  const themes = (rawThemes ?? []) as CommunityThemeWithAuthor[];

  return (
    <main className="min-h-screen bg-[#050507] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-normal">Topluluk Temaları</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Admin onayından geçen renk, şekil, arka plan ve müzik ayarlarını
            kendi profiline tek tıkla aktar.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.length ? (
            themes.map((theme) => (
              <article
                key={theme.id}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]"
              >
                <div
                  className="h-36"
                  style={{
                    background: theme.banner_url
                      ? `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.55)), url(${theme.banner_url}) center/cover`
                      : `linear-gradient(135deg, ${theme.header_color ?? "#ffffff"}, ${theme.page_background_color ?? "#050507"})`,
                  }}
                />
                <div className="space-y-4 p-4">
                  <div>
                    <h2 className="text-lg font-semibold">{theme.name}</h2>
                    <p className="text-sm text-zinc-500">
                      @{theme.author?.username ?? "unknown"}
                    </p>
                  </div>
                  {theme.description ? (
                    <p className="line-clamp-2 text-sm leading-6 text-zinc-400">
                      {theme.description}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    {[theme.accent_color, theme.panel_background_color, theme.button_background_color]
                      .filter(Boolean)
                      .map((color) => (
                        <span
                          key={color}
                          className="h-7 w-7 rounded border border-white/15"
                          style={{ backgroundColor: color ?? undefined }}
                        />
                      ))}
                  </div>
                  <form action={applyCommunityThemeAction}>
                    <input type="hidden" name="theme_id" value={theme.id} />
                    <Button type="submit" className="w-full">
                      <Check className="h-4 w-4" />
                      Temayı uygula
                    </Button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400 md:col-span-2 xl:col-span-3">
              Henüz onaylanan topluluk teması yok.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
