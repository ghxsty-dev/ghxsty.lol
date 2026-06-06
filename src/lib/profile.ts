import type { SupabaseClient, User } from "@supabase/supabase-js";
import { normalizeUsername } from "@/lib/utils";
import { RESERVED_USERNAMES, USERNAME_REGEX } from "@/lib/validation";
import type { Profile } from "@/types/database";

function fallbackUsername(userId: string) {
  return `user_${userId.slice(0, 8)}`;
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
    return existingProfile as Profile;
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

  return createdProfile as Profile;
}
