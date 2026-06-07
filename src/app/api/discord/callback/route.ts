import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getDiscordAvatarUrl,
  getDiscordBannerUrl,
  getDiscordRedirectUri,
  type DiscordUser,
} from "@/lib/discord";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("discord_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/dashboard?discord=invalid-state", origin));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard?discord=missing-env", origin));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/dashboard", origin));
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: getDiscordRedirectUri(origin),
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/dashboard?discord=token-error", origin));
  }

  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) {
    return NextResponse.redirect(new URL("/dashboard?discord=token-error", origin));
  }

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.redirect(new URL("/dashboard?discord=user-error", origin));
  }

  const discordUser = (await userResponse.json()) as DiscordUser;
  const { error } = await supabase
    .from("profiles")
    .update({
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_global_name: discordUser.global_name ?? null,
      discord_avatar_url: getDiscordAvatarUrl(discordUser),
      discord_banner_url: getDiscordBannerUrl(discordUser),
      discord_accent_color: discordUser.accent_color ?? null,
      discord_show_presence: true,
      discord_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  const response = NextResponse.redirect(
    new URL(error ? "/dashboard?discord=save-error" : "/dashboard?discord=connected", origin),
  );
  response.cookies.delete("discord_oauth_state");

  return response;
}
