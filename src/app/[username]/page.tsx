import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import type { ProfileVoteScore, PublicProfile } from "@/types/database";

type PageProps = {
  params: Promise<{ username: string }>;
};

async function getProfile(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, profile_links(*)")
    .eq("username", username)
    .order("position", {
      referencedTable: "profile_links",
      ascending: true,
    })
    .single();

  return data as PublicProfile | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return {
      title: "Profil bulunamadı",
    };
  }

  const title = `${profile.username} - Profile`;
  const description =
    profile.bio ??
    `${profile.display_name ?? profile.username} sosyal link profili.`;
  const url = `${getSiteUrl()}/${profile.username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: score }, { data: currentVote }] = await Promise.all([
    supabase
      .from("profile_vote_scores")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle(),
    user
      ? supabase
          .from("profile_votes")
          .select("value")
          .eq("profile_id", profile.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <ProfileView
      profile={profile}
      voteScore={(score as ProfileVoteScore | null) ?? null}
      currentVote={(currentVote?.value as 1 | -1 | undefined) ?? null}
    />
  );
}
