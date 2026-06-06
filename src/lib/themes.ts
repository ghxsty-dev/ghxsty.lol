import type { ProfileTheme } from "@/types/database";

export const THEMES: Record<
  ProfileTheme,
  {
    label: string;
    page: string;
    panel: string;
    button: string;
    muted: string;
    accent: string;
  }
> = {
  dark: {
    label: "Dark",
    page: "bg-[#050507] text-zinc-50",
    panel: "border-white/10 bg-white/[0.07] shadow-2xl shadow-black/30",
    button: "border-white/10 bg-white/10 hover:bg-white/15",
    muted: "text-zinc-300",
    accent: "from-zinc-200 to-zinc-500",
  },
  light: {
    label: "Light",
    page: "bg-[#f7f5ef] text-zinc-950",
    panel: "border-zinc-200 bg-white/75 shadow-xl shadow-zinc-300/35",
    button: "border-zinc-200 bg-white/80 hover:bg-white",
    muted: "text-zinc-600",
    accent: "from-zinc-900 to-zinc-500",
  },
  midnight: {
    label: "Midnight",
    page: "bg-[#080712] text-slate-50",
    panel: "border-cyan-300/15 bg-slate-950/55 shadow-2xl shadow-cyan-950/40",
    button: "border-cyan-200/15 bg-cyan-200/10 hover:bg-cyan-200/15",
    muted: "text-slate-300",
    accent: "from-cyan-200 to-indigo-300",
  },
  cyberpunk: {
    label: "Cyberpunk",
    page: "bg-[#100817] text-yellow-50",
    panel: "border-fuchsia-300/20 bg-fuchsia-950/30 shadow-2xl shadow-fuchsia-950/40",
    button: "border-yellow-200/20 bg-yellow-300/10 hover:bg-yellow-300/15",
    muted: "text-fuchsia-100/80",
    accent: "from-yellow-200 via-fuchsia-300 to-cyan-200",
  },
  anime: {
    label: "Anime",
    page: "bg-[#170a13] text-rose-50",
    panel: "border-rose-200/20 bg-rose-100/10 shadow-2xl shadow-rose-950/40",
    button: "border-rose-100/20 bg-rose-100/12 hover:bg-rose-100/20",
    muted: "text-rose-100/80",
    accent: "from-rose-200 via-pink-200 to-sky-200",
  },
  glass: {
    label: "Glass",
    page: "bg-[#07110f] text-emerald-50",
    panel: "border-emerald-100/15 bg-emerald-50/10 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl",
    button: "border-emerald-100/15 bg-emerald-50/10 hover:bg-emerald-50/15",
    muted: "text-emerald-50/75",
    accent: "from-emerald-100 to-teal-300",
  },
};

export const DEFAULT_THEME: ProfileTheme = "dark";
