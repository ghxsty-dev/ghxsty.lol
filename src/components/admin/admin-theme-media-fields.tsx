"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(color: [number, number, number], target: [number, number, number], amount: number) {
  return color.map((channel, index) => channel + (target[index] - channel) * amount) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function setColor(form: HTMLFormElement, name: string, value: string) {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) {
    return;
  }

  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function getAverageColor(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
    }

    canvas.width = 48;
    canvas.height = 48;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let index = 0; index < data.length; index += 16) {
      const alpha = data[index + 3];
      if (alpha < 128) {
        continue;
      }
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      count += 1;
    }

    if (!count) {
      return null;
    }

    return [red / count, green / count, blue / count] as [number, number, number];
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function AdminThemeMediaFields() {
  async function updateColors(file?: File) {
    if (!file) {
      return;
    }

    const form = document.querySelector<HTMLFormElement>("#admin-theme-create-form");
    const base = await getAverageColor(file);
    if (!form || !base) {
      return;
    }

    const dark = mix(base, [5, 5, 7], 0.72);
    const panel = mix(base, [18, 18, 20], 0.58);
    const accent = mix(base, [255, 255, 255], 0.32);
    const header = mix(base, [255, 255, 255], 0.18);
    const headerTo = mix(base, [0, 0, 0], 0.18);
    const button = mix(base, luminance(base) > 0.55 ? [20, 20, 22] : [255, 255, 255], 0.42);
    const textColor = luminance(dark) > 0.45 ? "#111113" : "#ffffff";
    const mutedText = luminance(dark) > 0.45 ? "#3f3f46" : "#d4d4d8";
    const buttonText = luminance(button) > 0.55 ? "#111113" : "#ffffff";

    setColor(form, "accent_color", rgbToHex(...accent));
    setColor(form, "page_background_color", rgbToHex(...dark));
    setColor(form, "panel_background_color", rgbToHex(...panel));
    setColor(form, "text_color", textColor);
    setColor(form, "muted_text_color", mutedText);
    setColor(form, "button_background_color", rgbToHex(...button));
    setColor(form, "button_text_color", buttonText);
    setColor(form, "header_color", rgbToHex(...header));
    setColor(form, "header_color_to", rgbToHex(...headerTo));
  }

  return (
    <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="admin-theme-banner">Arka plan görseli</Label>
        <Input
          id="admin-theme-banner"
          name="banner_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => void updateColors(event.currentTarget.files?.[0])}
        />
        <p className="text-xs text-zinc-500">Görsel seçilince tema renkleri otomatik önerilir.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-theme-music">Tema şarkısı</Label>
        <Input id="admin-theme-music" name="music_file" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-theme-music-title">Şarkı adı</Label>
        <Input id="admin-theme-music-title" name="music_title" placeholder="Profil şarkısı" />
      </div>
    </div>
  );
}
