"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function voteProfileAction({
  profileId,
  username,
  value,
}: {
  profileId: string;
  username: string;
  value: 1 | -1;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/${username}`);
  }

  const { data: existingVote } = await supabase
    .from("profile_votes")
    .select("id, value")
    .eq("profile_id", profileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVote?.value === value) {
    await supabase
      .from("profile_votes")
      .delete()
      .eq("id", existingVote.id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("profile_votes").upsert(
      {
        profile_id: profileId,
        user_id: user.id,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,user_id" },
    );
  }

  revalidatePath(`/${username}`);
  revalidatePath("/discover");
}
