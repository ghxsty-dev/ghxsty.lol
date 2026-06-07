export function getBackgroundEffectClass(style?: string | null) {
  switch (style) {
    case "aurora":
      return "bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.30),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,.30),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(74,222,128,.18),transparent_32%)]";
    case "grid":
      return "bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:28px_28px]";
    case "noise":
      return "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.20)_1px,transparent_0)] bg-[size:13px_13px]";
    case "rings":
      return "bg-[radial-gradient(circle_at_center,transparent_0,transparent_17%,rgba(255,255,255,.14)_18%,transparent_20%,transparent_36%,rgba(255,255,255,.11)_37%,transparent_39%,transparent_54%,rgba(255,255,255,.08)_55%,transparent_57%)]";
    case "scanlines":
      return "bg-[linear-gradient(rgba(255,255,255,.10)_1px,transparent_1px)] bg-[size:100%_6px]";
    case "spotlight":
      return "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.26),transparent_38%)]";
    case "vignette":
      return "bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,.18)_42%,rgba(0,0,0,.72)_100%)]";
    case "minimal":
      return "";
    default:
      return "bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,.12),transparent_32%)]";
  }
}

export function getButtonEffectClass(style?: string | null) {
  switch (style) {
    case "glow":
      return "profile-button-glow border-white/30 bg-white/12 hover:brightness-125";
    case "hologram":
      return "profile-button-hologram border-white/25";
    case "lift":
      return "profile-button-lift";
    case "solid":
      return "border-transparent hover:brightness-110";
    case "outline":
      return "border-current bg-transparent hover:bg-white/10";
    case "neon":
      return "profile-button-neon border-current";
    case "pulse":
      return "profile-button-pulse border-white/25 bg-white/10";
    case "shine":
      return "profile-button-shine overflow-hidden border-white/25 bg-white/10";
    case "chromatic":
      return "profile-button-chromatic border-white/20";
    case "plasma":
      return "profile-button-plasma border-white/20";
    case "matrix":
      return "profile-button-matrix border-emerald-300/40";
    default:
      return "";
  }
}

export function getFontStyleClass(style?: string | null) {
  switch (style) {
    case "display":
      return "font-[Trebuchet_MS]";
    case "rounded":
      return "font-[Verdana]";
    case "condensed":
      return "font-[Arial_Narrow]";
    case "elegant":
      return "font-[Georgia]";
    case "wide":
      return "tracking-[0.04em]";
    case "bold":
      return "font-black";
    case "mono":
      return "font-mono";
    case "serif":
      return "font-serif";
    case "cyber":
      return "font-[Orbitron,Arial,sans-serif] tracking-[0.06em]";
    case "editorial":
      return "font-[Didot,Georgia,serif]";
    case "impact":
      return "font-[Impact,Arial_Black,sans-serif]";
    case "pixel":
      return "font-[Courier_New,monospace] tracking-[0.08em]";
    case "script":
      return "font-[Brush_Script_MT,cursive]";
    case "soft-serif":
      return "font-[Palatino,Georgia,serif]";
    case "terminal":
      return "font-[Lucida_Console,Monaco,monospace]";
    default:
      return "";
  }
}

export function getDisplayNameEffectClass(style?: string | null) {
  switch (style) {
    case "float":
      return "animate-[profile-float_4s_ease-in-out_infinite]";
    case "glitch":
      return "profile-name-glitch";
    case "gradient-shift":
      return "animate-[profile-gradient_4s_linear_infinite] bg-[linear-gradient(90deg,var(--profile-accent),#fff,#67e8f9,var(--profile-accent))] bg-[length:300%_100%] bg-clip-text text-transparent";
    case "neon-flicker":
      return "animate-[profile-flicker_3.2s_linear_infinite] drop-shadow-[0_0_18px_var(--profile-accent)]";
    case "pulse":
      return "animate-[profile-name-pulse_2.8s_ease-in-out_infinite]";
    case "shine":
      return "profile-name-shine";
    case "wave":
      return "profile-name-wave";
    case "fire":
      return "profile-name-fire";
    default:
      return "";
  }
}
