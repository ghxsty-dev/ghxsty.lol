"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
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

function ColorField({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type="color"
        defaultValue={defaultValue}
        className="h-12 w-16 rounded-md p-1"
      />
    </div>
  );
}

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [profileState, profileAction] = useActionState(updateProfileAction, {});
  const [uploadState, uploadAction] = useActionState(uploadImageAction, {});
  const [musicState, musicAction] = useActionState(uploadMusicAction, {});

  useEffect(() => {
    if (profileState.success || uploadState.success || musicState.success) {
      router.refresh();
    }
  }, [musicState.success, profileState.success, router, uploadState.success]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={profileAction} className="space-y-5">
        <input type="hidden" name="music_title" value={profile.music_title ?? ""} />
        {(profile.music_show_volume ?? true) ? (
          <input type="hidden" name="music_show_volume" value="on" />
        ) : null}
        <input
          type="hidden"
          name="music_volume_position"
          value={profile.music_volume_position ?? "top-right"}
        />
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
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:grid-cols-4">
            <ColorField id="accent_color" label="Vurgu" defaultValue={profile.accent_color ?? "#ffffff"} />
            <ColorField id="page_background_color" label="Sayfa" defaultValue={profile.page_background_color ?? "#050507"} />
            <ColorField id="panel_background_color" label="Panel" defaultValue={profile.panel_background_color ?? "#111113"} />
            <ColorField id="text_color" label="Ana yazı" defaultValue={profile.text_color ?? "#ffffff"} />
            <ColorField id="muted_text_color" label="İkincil yazı" defaultValue={profile.muted_text_color ?? "#d4d4d8"} />
            <ColorField id="button_background_color" label="Link bg" defaultValue={profile.button_background_color ?? "#ffffff"} />
            <ColorField id="button_text_color" label="Link yazı" defaultValue={profile.button_text_color ?? "#ffffff"} />
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
          <ColorField id="header_color" label="Üst alan" defaultValue={profile.header_color ?? "#74d9bf"} />
          <ColorField id="header_color_to" label="Üst gradyan" defaultValue={profile.header_color_to ?? "#2f9d8f"} />
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

      <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-sm font-semibold text-white">Medya</h3>
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
            id="music_upload_title"
            name="music_title"
            defaultValue={profile.music_title ?? ""}
            placeholder="Şarkı adı"
          />
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
              {profile.music_title ?? "Profil şarkısı"}
            </p>
          ) : null}
        </form>
        {profile.music_url ? (
          <form action={profileAction} className="space-y-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
            <input type="hidden" name="username" value={profile.username} />
            <input type="hidden" name="display_name" value={profile.display_name ?? ""} />
            <input type="hidden" name="bio" value={profile.bio ?? ""} />
            <input type="hidden" name="theme" value={profile.theme} />
            <input type="hidden" name="accent_color" value={profile.accent_color ?? "#ffffff"} />
            <input type="hidden" name="page_background_color" value={profile.page_background_color ?? "#050507"} />
            <input type="hidden" name="panel_background_color" value={profile.panel_background_color ?? "#111113"} />
            <input type="hidden" name="text_color" value={profile.text_color ?? "#ffffff"} />
            <input type="hidden" name="muted_text_color" value={profile.muted_text_color ?? "#d4d4d8"} />
            <input type="hidden" name="button_background_color" value={profile.button_background_color ?? "#ffffff"} />
            <input type="hidden" name="button_text_color" value={profile.button_text_color ?? "#ffffff"} />
            <input type="hidden" name="header_background_style" value={profile.header_background_style ?? "gradient"} />
            <input type="hidden" name="header_color" value={profile.header_color ?? "#74d9bf"} />
            <input type="hidden" name="header_color_to" value={profile.header_color_to ?? "#2f9d8f"} />
            {(profile.header_enabled ?? true) ? <input type="hidden" name="header_enabled" value="on" /> : null}
            {(profile.panel_visible ?? true) ? <input type="hidden" name="panel_visible" value="on" /> : null}
            {(profile.links_icon_only ?? false) ? <input type="hidden" name="links_icon_only" value="on" /> : null}
            <input type="hidden" name="music_volume_position" value={profile.music_volume_position ?? "top-right"} />
            <input type="hidden" name="background_blur" value={profile.background_blur ?? 10} />
            <input type="hidden" name="panel_opacity" value={profile.panel_opacity ?? 70} />
            <input type="hidden" name="button_opacity" value={profile.button_opacity ?? 12} />
            <input type="hidden" name="background_style" value={profile.background_style ?? "soft"} />
            <input type="hidden" name="button_style" value={profile.button_style ?? "glass"} />
            <input type="hidden" name="font_style" value={profile.font_style ?? "clean"} />
            <div className="space-y-2">
              <Label htmlFor="music_title">Şarkı adı</Label>
              <Input id="music_title" name="music_title" defaultValue={profile.music_title ?? ""} />
            </div>
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 py-3">
              <input
                id="music_show_volume"
                name="music_show_volume"
                type="checkbox"
                defaultChecked={profile.music_show_volume ?? true}
                className="h-4 w-4 accent-white"
              />
              <Label htmlFor="music_show_volume">Ses kontrolünü göster</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="music_volume_position">Ses kontrolü konumu</Label>
              <Select
                id="music_volume_position"
                name="music_volume_position"
                defaultValue={profile.music_volume_position ?? "top-right"}
              >
                <option value="top-right">Sağ üst</option>
                <option value="top-left">Sol üst</option>
                <option value="bottom-right">Sağ alt</option>
                <option value="bottom-left">Sol alt</option>
              </Select>
            </div>
            <SaveButton />
          </form>
        ) : null}
        <StateMessage state={uploadState} />
        <StateMessage state={musicState} />
      </div>
    </div>
  );
}
