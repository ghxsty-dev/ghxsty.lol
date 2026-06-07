import { getSiteUrl } from "@/lib/utils";

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  accent_color?: number | null;
};

export function getDiscordRedirectUri() {
  return (
    process.env.DISCORD_REDIRECT_URI ??
    `${getSiteUrl()}/api/discord/callback`
  );
}

export function getDiscordAvatarUrl(user: DiscordUser) {
  if (!user.avatar) {
    const fallbackIndex = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
  }

  const extension = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
}

export function getDiscordBannerUrl(user: DiscordUser) {
  if (!user.banner) {
    return null;
  }

  const extension = user.banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${extension}?size=1024`;
}
