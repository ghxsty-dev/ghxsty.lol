import type { SupabaseClient, User } from "@supabase/supabase-js";
import { normalizeUsername } from "@/lib/utils";
import { RESERVED_USERNAMES, USERNAME_REGEX } from "@/lib/validation";
import type { Profile } from "@/types/database";

export function fallbackUsername(userId: string) {
  return `user_${userId.slice(0, 8)}`;
}

export function hasTemporaryUsername(profile: Pick<Profile, "user_id" | "username">) {
  return profile.username === fallbackUsername(profile.user_id);
}

function getRequestedUsername(user: User) {
  const metadataUsername =
    typeof user.user_metadata.username === "string"
      ? user.user_metadata.username
      : "";
  const normalized = normalizeUsername(metadataUsername);

  if (
    USERNAME_REGEX.test(normalized) &&
    !RESERVED_USERNAMES.includes(normalized)
  ) {
    return normalized;
  }

  return fallbackUsername(user.id);
}

function getUserMetadataString(user: User, key: string) {
  const value = user.user_metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getDiscordIdentityId(user: User) {
  const identity = user.identities?.find((item) => item.provider === "discord");
  return identity?.identity_data?.sub ?? identity?.id ?? null;
}

async function syncDiscordProfileFields(
  supabase: SupabaseClient,
  profile: Profile,
  user: User,
) {
  const discordId = getDiscordIdentityId(user);
  if (!discordId) {
    return profile;
  }

  const discordUsername =
    getUserMetadataString(user, "preferred_username") ??
    getUserMetadataString(user, "user_name") ??
    getUserMetadataString(user, "name");
  const discordGlobalName =
    getUserMetadataString(user, "full_name") ??
    getUserMetadataString(user, "global_name") ??
    discordUsername;
  const avatarUrl = getUserMetadataString(user, "avatar_url");

  const { data } = await supabase
    .from("profiles")
    .update({
      discord_id: profile.discord_id ?? discordId,
      discord_username: profile.discord_username ?? discordUsername,
      discord_global_name: profile.discord_global_name ?? discordGlobalName,
      discord_avatar_url: profile.discord_avatar_url ?? avatarUrl,
      discord_show_presence: profile.discord_show_presence ?? true,
      discord_connected_at: profile.discord_connected_at ?? new Date().toISOString(),
      display_name:
        profile.display_name && profile.display_name !== profile.username
          ? profile.display_name
          : discordGlobalName ?? profile.display_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)
    .select("*")
    .single();

  return (data as Profile | null) ?? profile;
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return syncDiscordProfileFields(supabase, existingProfile as Profile, user);
  }

  let username = getRequestedUsername(user);
  const { data: usernameOwner } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (usernameOwner) {
    username = fallbackUsername(user.id);
  }

  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      username,
      display_name: username,
      theme: "dark",
    })
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return syncDiscordProfileFields(supabase, createdProfile as Profile, user);
}
