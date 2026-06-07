import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaRedditAlien,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiRoblox, SiSoundcloud, SiSteam } from "react-icons/si";

export type LinkIconKey =
  | "github"
  | "youtube"
  | "discord"
  | "tiktok"
  | "instagram"
  | "guns"
  | "reddit"
  | "spotify"
  | "x"
  | "twitch"
  | "soundcloud"
  | "steam"
  | "roblox"
  | "website"
  | "custom";

export const LINK_ICON_OPTIONS: Array<{
  key: LinkIconKey;
  label: string;
  placeholder: string;
}> = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/ghxsty" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@ghxsty" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/example" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@ghxsty" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/ghxsty" },
  { key: "reddit", label: "Reddit", placeholder: "https://reddit.com/u/ghxsty" },
  { key: "guns", label: "Guns.lol", placeholder: "https://guns.lol/ghxsty" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/user/..." },
  { key: "x", label: "X", placeholder: "https://x.com/ghxsty" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/ghxsty" },
  { key: "soundcloud", label: "SoundCloud", placeholder: "https://soundcloud.com/..." },
  { key: "steam", label: "Steam", placeholder: "https://steamcommunity.com/id/..." },
  { key: "roblox", label: "Roblox", placeholder: "https://roblox.com/users/..." },
  { key: "website", label: "Website", placeholder: "https://example.com" },
  { key: "custom", label: "Özel", placeholder: "https://example.com" },
];

const GunsIcon: IconType = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="none"
    {...props}
  >
    <path
      d="M12 2.5 20.2 7v10L12 21.5 3.8 17V7L12 2.5Z"
      fill="currentColor"
      opacity="0.24"
    />
    <path
      d="M12 2.5 20.2 7v10L12 21.5 3.8 17V7L12 2.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M14.9 9.2a3.6 3.6 0 1 0 .4 5.1v-2.1h-3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    />
  </svg>
);

export const LINK_ICONS: Record<LinkIconKey, IconType> = {
  github: FaGithub,
  youtube: FaYoutube,
  discord: FaDiscord,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  reddit: FaRedditAlien,
  guns: GunsIcon,
  spotify: FaSpotify,
  x: FaXTwitter,
  twitch: FaTwitch,
  soundcloud: SiSoundcloud,
  steam: SiSteam,
  roblox: SiRoblox,
  website: FaGlobe,
  custom: FaLink,
};

export function getLinkIcon(icon?: string | null) {
  const key = (icon ?? "custom").toLowerCase() as LinkIconKey;
  return LINK_ICONS[key] ?? LINK_ICONS.custom;
}

export function getLinkIconLabel(icon?: string | null) {
  return (
    LINK_ICON_OPTIONS.find((option) => option.key === icon)?.label ?? "Özel"
  );
}
