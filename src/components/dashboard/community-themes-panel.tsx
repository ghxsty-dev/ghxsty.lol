"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Check, Send } from "lucide-react";
import {
  applyCommunityThemeAction,
  submitCommunityThemeAction,
  type ThemeState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityThemeWithAuthor } from "@/types/database";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? "Gönderiliyor..." : "Mevcut görünümü gönder"}
    </Button>
  );
}

function ApplyButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      <Check className="h-4 w-4" />
      {pending ? "Uygulanıyor..." : "Temayı uygula"}
    </Button>
  );
}

function StateMessage({ state }: { state: ThemeState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-200">
      {state.error ?? state.success}
    </p>
  );
}

export function CommunityThemesPanel({
  themes,
}: {
  themes: CommunityThemeWithAuthor[];
}) {
  const router = useRouter();
  const [submitState, submitAction] = useActionState(
    submitCommunityThemeAction,
    {},
  );

  useEffect(() => {
    if (submitState.success) {
      router.refresh();
    }
  }, [router, submitState]);

  return (
    <div className="space-y-5">
      <form
        action={submitAction}
        className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-4"
      >
        <div>
          <h3 className="text-sm font-semibold text-white">Tema paylaş</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            Yalnızca renk, şekil, arka plan ve müzik ayarların paylaşılır.
            İsim, bio, avatar ve linkler dahil edilmez.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="community_theme_name">Tema adı</Label>
            <Input
              id="community_theme_name"
              name="name"
              maxLength={40}
              placeholder="Midnight Glass"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="community_theme_description">Kısa açıklama</Label>
            <Textarea
              id="community_theme_description"
              name="description"
              maxLength={160}
              placeholder="Koyu, şeffaf ve müzikli bir profil görünümü."
            />
          </div>
        </div>
        <StateMessage state={submitState} />
        <SubmitButton />
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {themes.length ? (
          themes.map((theme) => (
            <article
              key={theme.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
            >
              <div
                className="h-24"
                style={{
                  background: theme.banner_url
                    ? `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.45)), url(${theme.banner_url}) center/cover`
                    : `linear-gradient(135deg, ${theme.header_color ?? "#ffffff"}, ${theme.page_background_color ?? "#050507"})`,
                }}
              />
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-white">{theme.name}</h3>
                  <p className="text-xs text-zinc-500">
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
                        className="h-6 w-6 rounded border border-white/15"
                        style={{ backgroundColor: color ?? undefined }}
                      />
                    ))}
                </div>
                <form action={applyCommunityThemeAction}>
                  <input type="hidden" name="theme_id" value={theme.id} />
                  <ApplyButton />
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400 md:col-span-2">
            Henüz onaylanmış topluluk teması yok.
          </p>
        )}
      </div>
    </div>
  );
}
