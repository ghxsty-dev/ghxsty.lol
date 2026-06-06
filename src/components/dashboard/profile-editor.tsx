"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Music, Save, Trash2, Upload } from "lucide-react";
import {
  removeMusicAction,
  updateProfileAction,
  uploadImageAction,
  uploadMusicAction,
  type DashboardState,
} from "@/app/dashboard/actions";
import { THEMES } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types/database";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Kaydediliyor..." : "Kaydet"}
    </Button>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      <Upload className="h-4 w-4" />
      {pending ? "Yükleniyor..." : "Yükle"}
    </Button>
  );
}

function StateMessage({ state }: { state: DashboardState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-200">
      {state.error ?? state.success}
    </p>
  );
}

export function ProfileEditor({ profile }: { profile: Profile }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, {});
  const [uploadState, uploadAction] = useActionState(uploadImageAction, {});
  const [musicState, musicAction] = useActionState(uploadMusicAction, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={profileAction} className="space-y-5">
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-sm font-semibold text-white">Kimlik</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Görünen isim</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name ?? ""}
                placeholder="Ghxsty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı adı</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile.username}
                pattern="^[a-z0-9_-]{3,20}$"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Hakkımda</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              maxLength={280}
              placeholder="Kısa, net, sana ait."
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-sm font-semibold text-white">Görünüm</h3>
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select id="theme" name="theme" defaultValue={profile.theme}>
              {Object.entries(THEMES).map(([value, theme]) => (
                <option key={value} value={value}>
                  {theme.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accent_color">Vurgu rengi</Label>
            <Input
              id="accent_color"
              name="accent_color"
              type="color"
              defaultValue={profile.accent_color ?? "#ffffff"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_background_color">Sayfa arka plan rengi</Label>
            <Input
              id="page_background_color"
              name="page_background_color"
              type="color"
              defaultValue={profile.page_background_color ?? "#050507"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel_background_color">Panel rengi</Label>
            <Input
              id="panel_background_color"
              name="panel_background_color"
              type="color"
              defaultValue={profile.panel_background_color ?? "#111113"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Ana yazı rengi</Label>
            <Input
              id="text_color"
              name="text_color"
              type="color"
              defaultValue={profile.text_color ?? "#ffffff"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="muted_text_color">İkincil yazı rengi</Label>
            <Input
              id="muted_text_color"
              name="muted_text_color"
              type="color"
              defaultValue={profile.muted_text_color ?? "#d4d4d8"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button_background_color">Link arka plan rengi</Label>
            <Input
              id="button_background_color"
              name="button_background_color"
              type="color"
              defaultValue={profile.button_background_color ?? "#ffffff"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button_text_color">Link yazı rengi</Label>
            <Input
              id="button_text_color"
              name="button_text_color"
              type="color"
              defaultValue={profile.button_text_color ?? "#ffffff"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_style">Arka plan</Label>
            <Select
              id="background_style"
              name="background_style"
              defaultValue={profile.background_style ?? "soft"}
            >
              <option value="soft">Soft glass</option>
              <option value="grid">Grid</option>
              <option value="spotlight">Spotlight</option>
              <option value="minimal">Minimal</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="header_background_style">Üst renk alanı</Label>
            <Select
              id="header_background_style"
              name="header_background_style"
              defaultValue={profile.header_background_style ?? "gradient"}
            >
              <option value="gradient">Gradyan</option>
              <option value="solid">Tek renk</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="header_color">Üst alan rengi</Label>
            <Input
              id="header_color"
              name="header_color"
              type="color"
              defaultValue={profile.header_color ?? "#74d9bf"}
              className="h-11 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="header_color_to">Üst alan gradyan rengi</Label>
            <Input
              id="header_color_to"
              name="header_color_to"
              type="color"
              defaultValue={profile.header_color_to ?? "#2f9d8f"}
              className="h-11 p-1"
            />
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3 sm:col-span-2">
            <input
              id="header_enabled"
              name="header_enabled"
              type="checkbox"
              defaultChecked={profile.header_enabled ?? true}
              className="h-4 w-4 accent-white"
            />
            <Label htmlFor="header_enabled">Profil üst renk alanını göster</Label>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3">
            <input
              id="panel_visible"
              name="panel_visible"
              type="checkbox"
              defaultChecked={profile.panel_visible ?? true}
              className="h-4 w-4 accent-white"
            />
            <Label htmlFor="panel_visible">Panel arayüzünü göster</Label>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3">
            <input
              id="links_icon_only"
              name="links_icon_only"
              type="checkbox"
              defaultChecked={profile.links_icon_only ?? false}
              className="h-4 w-4 accent-white"
            />
            <Label htmlFor="links_icon_only">Linklerde sadece ikon göster</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_blur">Arka plan blur</Label>
            <Input
              id="background_blur"
              name="background_blur"
              type="range"
              min="0"
              max="40"
              defaultValue={profile.background_blur ?? 10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel_opacity">Panel şeffaflığı</Label>
            <Input
              id="panel_opacity"
              name="panel_opacity"
              type="range"
              min="10"
              max="100"
              defaultValue={profile.panel_opacity ?? 70}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button_opacity">Link şeffaflığı</Label>
            <Input
              id="button_opacity"
              name="button_opacity"
              type="range"
              min="0"
              max="100"
              defaultValue={profile.button_opacity ?? 12}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button_style">Link butonları</Label>
            <Select
              id="button_style"
              name="button_style"
              defaultValue={profile.button_style ?? "glass"}
            >
              <option value="glass">Glass</option>
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
              <option value="neon">Neon</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="font_style">Yazı stili</Label>
            <Select
              id="font_style"
              name="font_style"
              defaultValue={profile.font_style ?? "clean"}
            >
              <option value="clean">Clean</option>
              <option value="display">Display</option>
              <option value="rounded">Rounded</option>
              <option value="condensed">Condensed</option>
              <option value="elegant">Elegant</option>
              <option value="wide">Wide</option>
              <option value="bold">Bold</option>
              <option value="mono">Mono</option>
              <option value="serif">Serif</option>
            </Select>
          </div>
          </div>
        </div>
        <StateMessage state={profileState} />
        <SaveButton />
      </form>

      <div className="space-y-4">
        {(["avatar_url", "banner_url"] as const).map((field) => (
          <form key={field} action={uploadAction} className="space-y-3">
            <input type="hidden" name="field" value={field} />
            <Label htmlFor={field}>
              {field === "avatar_url" ? "Profil fotoğrafı" : "Arka plan görseli"}
            </Label>
            <Input id={field} name="file" type="file" accept="image/*" />
            <UploadButton />
          </form>
        ))}
        <form action={musicAction} className="space-y-3">
          <Label htmlFor="music_url">Profil şarkısı</Label>
          <Input
            id="music_url"
            name="file"
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a"
          />
          <div className="flex flex-wrap gap-2">
            <UploadButton />
            {profile.music_url ? (
              <Button formAction={removeMusicAction} variant="ghost">
                <Trash2 className="h-4 w-4" />
                Şarkıyı sil
              </Button>
            ) : null}
          </div>
          {profile.music_url ? (
            <p className="flex items-center gap-2 text-xs text-zinc-400">
              <Music className="h-3.5 w-3.5" />
              Public profil açıldığında otomatik çalmayı dener.
            </p>
          ) : null}
        </form>
        <StateMessage state={uploadState} />
        <StateMessage state={musicState} />
      </div>
    </div>
  );
}
