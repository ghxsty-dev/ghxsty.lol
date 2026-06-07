"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Gamepad2, Music, Save, Trash2, Upload } from "lucide-react";
import {
  disconnectDiscordAction,
  removeImageAction,
  removeMusicAction,
  updateProfileAction,
  uploadImageAction,
  uploadMusicAction,
  type DashboardState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AvatarDecoration, Profile } from "@/types/database";

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
  const [value, setValue] = useState(defaultValue);
  const safeValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : defaultValue;

  function updateValue(nextValue: string) {
    const normalized = nextValue.startsWith("#") ? nextValue : `#${nextValue}`;
    setValue(normalized.slice(0, 7));
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-2">
      <input type="hidden" name={id} value={safeValue} />
      <Label htmlFor={`${id}_color`} className="text-xs text-zinc-400">
        {label}
      </Label>
      <div className="mt-2 flex items-center gap-2">
        <Input
          id={`${id}_color`}
          type="color"
          value={safeValue}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 w-12 shrink-0 rounded-md p-1"
        />
        <Input
          aria-label={`${label} hex kodu`}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          onBlur={() => {
            if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
              setValue(defaultValue);
            }
          }}
          className="h-10 min-w-0 font-mono text-xs uppercase"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function RangeField({
  id,
  label,
  defaultValue,
  min,
  max,
  suffix = "",
}: {
  id: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  suffix?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs text-zinc-300">
          {value}
          {suffix}
        </span>
      </div>
      <Input
        id={id}
        name={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ToggleField({
  id,
  label,
  defaultChecked,
  disabled,
}: {
  id: string;
  label: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="h-4 w-4 accent-white disabled:opacity-40"
      />
      <span>{label}</span>
    </label>
  );
}

function AppearanceGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h4>
      {children}
    </section>
  );
}
export function ProfileEditor({
  profile,
  decorations,
}: {
  profile: Profile;
  decorations: AvatarDecoration[];
}) {
  const router = useRouter();
  const [profileState, profileAction] = useActionState(updateProfileAction, {});
  const [uploadState, uploadAction] = useActionState(uploadImageAction, {});
  const [musicState, musicAction] = useActionState(uploadMusicAction, {});

  useEffect(() => {
    if (profileState.success || uploadState.success || musicState.success) {
      router.refresh();
    }
  }, [musicState, profileState, router, uploadState]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={profileAction} className="space-y-5">
        <input type="hidden" name="music_title" value={profile.music_title ?? ""} />
        <input type="hidden" name="theme" value={profile.theme} />
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
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-white">Görünüm</h3>
            <p className="text-xs text-zinc-500">
              Renk, şeffaflık, efekt ve görünürlük ayarları düzenli gruplandı.
            </p>
          </div>

          <AppearanceGroup title="Renk Paleti">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <ColorField id="accent_color" label="Vurgu" defaultValue={profile.accent_color ?? "#ffffff"} />
              <ColorField id="page_background_color" label="Sayfa arka planı" defaultValue={profile.page_background_color ?? "#050507"} />
              <ColorField id="panel_background_color" label="Panel arka planı" defaultValue={profile.panel_background_color ?? "#111113"} />
              <ColorField id="text_color" label="Ana yazı" defaultValue={profile.text_color ?? "#ffffff"} />
              <ColorField id="muted_text_color" label="İkincil yazı" defaultValue={profile.muted_text_color ?? "#d4d4d8"} />
              <ColorField id="button_background_color" label="Link arka planı" defaultValue={profile.button_background_color ?? "#ffffff"} />
              <ColorField id="button_text_color" label="Link yazısı" defaultValue={profile.button_text_color ?? "#ffffff"} />
              <ColorField id="header_color" label="Üst alan başlangıç" defaultValue={profile.header_color ?? "#74d9bf"} />
              <ColorField id="header_color_to" label="Üst alan bitiş" defaultValue={profile.header_color_to ?? "#2f9d8f"} />
            </div>
          </AppearanceGroup>

          <AppearanceGroup title="Görünürlük">
            <div className="grid gap-2 md:grid-cols-2">
              <ToggleField id="header_enabled" label="Profil üst renk alanını göster" defaultChecked={profile.header_enabled ?? true} />
              <ToggleField id="panel_visible" label="Panel arayüzünü göster" defaultChecked={profile.panel_visible ?? true} />
              <ToggleField id="links_icon_only" label="Linklerde sadece ikon göster" defaultChecked={profile.links_icon_only ?? false} />
              <ToggleField id="music_show_volume" label="Ses kontrolünü göster" defaultChecked={profile.music_show_volume ?? true} />
              <ToggleField
                id="discord_show_presence"
                label="Discord etkinliğini public profilde göster"
                defaultChecked={profile.discord_show_presence ?? true}
                disabled={!profile.discord_id}
              />
            </div>
          </AppearanceGroup>

          <AppearanceGroup title="Ölçü ve Şeffaflık">
            <div className="grid gap-3 md:grid-cols-2">
              <RangeField id="background_blur" label="Arka plan blur" min={0} max={40} defaultValue={profile.background_blur ?? 10} suffix="px" />
              <RangeField id="panel_opacity" label="Panel şeffaflığı" min={10} max={100} defaultValue={profile.panel_opacity ?? 70} suffix="%" />
              <RangeField id="button_opacity" label="Link şeffaflığı" min={0} max={100} defaultValue={profile.button_opacity ?? 12} suffix="%" />
              <RangeField id="panel_radius" label="Panel köşe yumuşaklığı" min={0} max={32} defaultValue={profile.panel_radius ?? 8} suffix="px" />
              <RangeField id="button_radius" label="Link köşe yumuşaklığı" min={0} max={32} defaultValue={profile.button_radius ?? 6} suffix="px" />
            </div>
          </AppearanceGroup>

          <AppearanceGroup title="Stil Seçimleri">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="background_style">Arka plan efekti</Label>
                <Select id="background_style" name="background_style" defaultValue={profile.background_style ?? "soft"}>
                  <option value="soft">Soft glass</option>
                  <option value="grid">Grid</option>
                  <option value="spotlight">Spotlight</option>
                  <option value="minimal">Minimal</option>
                  <option value="aurora">Aurora</option>
                  <option value="scanlines">Scanlines</option>
                  <option value="vignette">Vignette</option>
                  <option value="noise">Noise</option>
                  <option value="rings">Rings</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="header_background_style">Üst renk alanı</Label>
                <Select id="header_background_style" name="header_background_style" defaultValue={profile.header_background_style ?? "gradient"}>
                  <option value="gradient">Gradyan</option>
                  <option value="solid">Tek renk</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="music_volume_position">Ses kontrolü konumu</Label>
                <Select id="music_volume_position" name="music_volume_position" defaultValue={profile.music_volume_position ?? "top-right"}>
                  <option value="top-right">Sağ üst</option>
                  <option value="top-left">Sol üst</option>
                  <option value="bottom-right">Sağ alt</option>
                  <option value="bottom-left">Sol alt</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_style">Link butonları</Label>
                <Select id="button_style" name="button_style" defaultValue={profile.button_style ?? "glass"}>
                  <option value="glass">Glass</option>
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="neon">Neon</option>
                  <option value="glow">Glow</option>
                  <option value="shine">Shine</option>
                  <option value="hologram">Hologram</option>
                  <option value="pulse">Pulse</option>
                  <option value="lift">Lift</option>
                  <option value="chromatic">Chromatic</option>
                  <option value="plasma">Plasma</option>
                  <option value="matrix">Matrix</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font_style">Yazı stili</Label>
                <Select id="font_style" name="font_style" defaultValue={profile.font_style ?? "clean"}>
                  <option value="clean">Clean</option>
                  <option value="display">Display</option>
                  <option value="rounded">Rounded</option>
                  <option value="condensed">Condensed</option>
                  <option value="elegant">Elegant</option>
                  <option value="wide">Wide</option>
                  <option value="bold">Bold</option>
                  <option value="mono">Mono</option>
                  <option value="serif">Serif</option>
                  <option value="cyber">Cyber</option>
                  <option value="pixel">Pixel</option>
                  <option value="script">Script</option>
                  <option value="editorial">Editorial</option>
                  <option value="terminal">Terminal</option>
                  <option value="impact">Impact</option>
                  <option value="soft-serif">Soft serif</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name_effect">Görünen isim efekti</Label>
                <Select id="display_name_effect" name="display_name_effect" defaultValue={profile.display_name_effect ?? "none"}>
                  <option value="none">Sade</option>
                  <option value="gradient-shift">Gradient shift</option>
                  <option value="neon-flicker">Neon flicker</option>
                  <option value="glitch">Glitch</option>
                  <option value="float">Float</option>
                  <option value="shine">Shine</option>
                  <option value="pulse">Pulse</option>
                  <option value="wave">Wave</option>
                  <option value="fire">Fire</option>
                </Select>
              </div>
            </div>
          </AppearanceGroup>

          <AppearanceGroup title="Avatar Dekorasyonu">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="avatar_decoration_id">Seçili dekorasyon</Label>
                <Select id="avatar_decoration_id" name="avatar_decoration_id" defaultValue={profile.avatar_decoration_id ?? ""}>
                  <option value="">Yok</option>
                  {decorations.map((decoration) => (
                    <option key={decoration.id} value={decoration.id}>
                      {decoration.name}
                    </option>
                  ))}
                </Select>
              </div>
              {decorations.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {decorations.slice(0, 8).map((decoration) => (
                    <div key={decoration.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-black/20 p-2">
                      <Image src={decoration.image_url} alt="" width={40} height={40} unoptimized className="h-10 w-10 object-contain" />
                      <span className="min-w-0 truncate text-xs text-zinc-300">{decoration.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-zinc-500">
                  Henüz aktif dekorasyon yok.
                </p>
              )}
            </div>
          </AppearanceGroup>
        </div>
        <StateMessage state={profileState} />
        <SaveButton />
      </form>

      <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-sm font-semibold text-white">Medya</h3>
        <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865f2] text-white">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Discord</p>
              <p className="truncate text-xs text-zinc-400">
                {profile.discord_id
                  ? `${profile.discord_global_name ?? profile.discord_username} bağlı`
                  : "Discord profilini ve etkinliğini bağla"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.discord_id ? (
              <form action={disconnectDiscordAction}>
                <Button type="submit" variant="ghost">
                  Bağlantıyı kaldır
                </Button>
              </form>
            ) : (
              <Link
                href="/api/discord/connect"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Discord bağla
              </Link>
            )}
          </div>
          {profile.discord_id ? (
            <p className="text-xs leading-5 text-zinc-500">
              Canlı etkinlik için Discord hesabının Lanyard tarafından görülebilir olması gerekir.
            </p>
          ) : null}
        </div>
        {(["avatar_url", "banner_url"] as const).map((field) => (
          <form key={field} action={uploadAction} className="space-y-3">
            <input type="hidden" name="field" value={field} />
            <Label htmlFor={field}>
              {field === "avatar_url" ? "Profil fotoğrafı" : "Arka plan görseli"}
            </Label>
            <Input id={field} name="file" type="file" accept="image/*" />
            <div className="flex flex-wrap gap-2">
              <UploadButton />
              {field === "banner_url" && profile.banner_url ? (
                <Button formAction={removeImageAction} variant="ghost">
                  <Trash2 className="h-4 w-4" />
                  Arka planı sil
                </Button>
              ) : null}
            </div>
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
            <input type="hidden" name="avatar_decoration_id" value={profile.avatar_decoration_id ?? ""} />
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
            {(profile.music_show_volume ?? true) ? <input type="hidden" name="music_show_volume" value="on" /> : null}
            {(profile.discord_show_presence ?? true) ? <input type="hidden" name="discord_show_presence" value="on" /> : null}
            <input type="hidden" name="music_volume_position" value={profile.music_volume_position ?? "top-right"} />
            <input type="hidden" name="background_blur" value={profile.background_blur ?? 10} />
            <input type="hidden" name="panel_opacity" value={profile.panel_opacity ?? 70} />
            <input type="hidden" name="button_opacity" value={profile.button_opacity ?? 12} />
            <input type="hidden" name="panel_radius" value={profile.panel_radius ?? 8} />
            <input type="hidden" name="button_radius" value={profile.button_radius ?? 6} />
            <input type="hidden" name="background_style" value={profile.background_style ?? "soft"} />
            <input type="hidden" name="button_style" value={profile.button_style ?? "glass"} />
            <input type="hidden" name="font_style" value={profile.font_style ?? "clean"} />
            <input type="hidden" name="display_name_effect" value={profile.display_name_effect ?? "none"} />
            <div className="space-y-2">
              <Label htmlFor="music_title">Şarkı adı</Label>
              <Input id="music_title" name="music_title" defaultValue={profile.music_title ?? ""} />
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
