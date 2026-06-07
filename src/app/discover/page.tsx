import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { AvatarFrame } from "@/components/profile/avatar-frame";
import type { AvatarDecoration, Profile, ProfileVoteScore } from "@/types/database";

type DiscoverProfile = Profile & {
  avatar_decoration?: AvatarDecoration | null;
  score: number;
  upvotes: number;
  downvotes: number;
};

export const metadata: Metadata = {
  title: "Keşfet",
  description: "En çok tik alan ghxsty.lol profillerini keşfet.",
};

export default async function DiscoverPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: scores }] = await Promise.all([
    supabase.from("profiles").select("*, avatar_decoration:avatar_decorations(*)").limit(100),
    supabase.from("profile_vote_scores").select("*"),
  ]);

  const scoreMap = new Map(
    ((scores as ProfileVoteScore[] | null) ?? []).map((score) => [
      score.profile_id,
      score,
    ]),
  );
  const rankedProfiles = ((profiles as Profile[] | null) ?? [])
    .map((profile) => {
      const voteScore = scoreMap.get(profile.id);
      return {
        ...profile,
        score: voteScore?.score ?? 0,
        upvotes: voteScore?.upvotes ?? 0,
        downvotes: voteScore?.downvotes ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.upvotes - a.upvotes;
    }) as DiscoverProfile[];

  return (
    <main className="min-h-screen bg-[#050507] px-4 py-6 text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-normal">
          <Image src="/glitch-logo.png" alt="ghxsty.lol" width={28} height={28} className="rounded-md" />
          ghxsty.lol
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Dashboard
        </Link>
      </nav>

      <section className="mx-auto w-full max-w-6xl py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
              <Trophy className="h-4 w-4" />
              Keşfet
            </p>
            <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">
              En çok tik alan profiller
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Topluluğun en çok beğendiği arayüzler üstte görünür. Down oylar skoru düşürür.
            </p>
          </div>
        </div>

        {rankedProfiles.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rankedProfiles.map((profile, index) => {
              const displayName = profile.display_name || profile.username;
              return (
                <Link key={profile.id} href={`/${profile.username}`}>
                  <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-zinc-300">
                          #{index + 1}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="flex items-center gap-4">
                        <AvatarFrame
                          src={profile.avatar_url}
                          fallback={displayName}
                          alt={displayName}
                          decoration={profile.avatar_decoration}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">{displayName}</h2>
                          <p className="truncate text-sm text-zinc-400">@{profile.username}</p>
                        </div>
                      </div>
                      {profile.bio ? (
                        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">
                          {profile.bio}
                        </p>
                      ) : (
                        <p className="min-h-10 text-sm leading-5 text-zinc-500">
                          Henüz bio eklenmemiş.
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-2">
                          <p className="font-semibold">{profile.score}</p>
                          <p className="text-xs text-zinc-500">Skor</p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-2">
                          <p className="flex items-center justify-center gap-1 font-semibold text-emerald-100">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {profile.upvotes}
                          </p>
                          <p className="text-xs text-zinc-500">Tik</p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-2">
                          <p className="flex items-center justify-center gap-1 font-semibold text-red-100">
                            <ThumbsDown className="h-3.5 w-3.5" />
                            {profile.downvotes}
                          </p>
                          <p className="text-xs text-zinc-500">Down</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-400">
            Henüz keşfedilecek profil yok.
          </div>
        )}
      </section>
    </main>
  );
}
