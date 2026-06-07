"use client";

import { useOptimistic, useTransition } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { voteProfileAction } from "@/app/profile-vote-actions";
import { cn } from "@/lib/utils";

type VoteState = {
  score: number;
  upvotes: number;
  downvotes: number;
  currentVote: 1 | -1 | null;
};

function nextVoteState(state: VoteState, value: 1 | -1): VoteState {
  let { score, upvotes, downvotes, currentVote } = state;

  if (currentVote === value) {
    score -= value;
    if (value === 1) {
      upvotes -= 1;
    } else {
      downvotes -= 1;
    }
    currentVote = null;
  } else {
    if (currentVote === 1) {
      upvotes -= 1;
      score -= 1;
    }
    if (currentVote === -1) {
      downvotes -= 1;
      score += 1;
    }

    currentVote = value;
    score += value;
    if (value === 1) {
      upvotes += 1;
    } else {
      downvotes += 1;
    }
  }

  return { score, upvotes, downvotes, currentVote };
}

export function ProfileVote({
  profileId,
  username,
  initialScore,
  initialUpvotes,
  initialDownvotes,
  initialVote,
}: {
  profileId: string;
  username: string;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialVote: 1 | -1 | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [voteState, addOptimisticVote] = useOptimistic(
    {
      score: initialScore,
      upvotes: initialUpvotes,
      downvotes: initialDownvotes,
      currentVote: initialVote,
    },
    nextVoteState,
  );

  function submitVote(value: 1 | -1) {
    startTransition(async () => {
      addOptimisticVote(value);
      await voteProfileAction({ profileId, username, value });
    });
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 p-1 text-white shadow-lg shadow-black/20 backdrop-blur-xl">
      <button
        type="button"
        disabled={isPending}
        onClick={() => submitVote(1)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs transition hover:bg-white/10 disabled:opacity-60",
          voteState.currentVote === 1 && "border-emerald-300/50 bg-emerald-400/15 text-emerald-100",
        )}
        aria-label="Profile tik at"
      >
        <ThumbsUp className="h-4 w-4" />
        {voteState.upvotes}
      </button>
      <span className="min-w-8 rounded-full bg-white/10 px-2 py-1 text-center text-xs font-semibold text-white">
        {voteState.score}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => submitVote(-1)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs transition hover:bg-white/10 disabled:opacity-60",
          voteState.currentVote === -1 && "border-red-300/50 bg-red-400/15 text-red-100",
        )}
        aria-label="Profile down bırak"
      >
        <ThumbsDown className="h-4 w-4" />
        {voteState.downvotes}
      </button>
    </div>
  );
}
