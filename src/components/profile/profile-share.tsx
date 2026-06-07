"use client";

import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { Check, Copy, MessageCircle, Send, Share2, X } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { AvatarFrame } from "@/components/profile/avatar-frame";
import { cn } from "@/lib/utils";
import type { AvatarDecoration } from "@/types/database";

type ShareTarget = {
  label: string;
  href: string;
  Icon: IconType | typeof MessageCircle;
  className: string;
};

export function ProfileShare({
  username,
  displayName,
  avatarUrl,
  avatarDecoration,
  accentColor,
}: {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarDecoration?: AvatarDecoration | null;
  accentColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const profileUrl =
    typeof window === "undefined"
      ? `https://ghxsty.lol/${username}`
      : `${window.location.origin}/${username}`;
  const encodedUrl = encodeURIComponent(profileUrl);
  const encodedText = encodeURIComponent(`${displayName} - ghxsty.lol`);
  const shareTargets = useMemo<ShareTarget[]>(
    () => [
      {
        label: "X",
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
        Icon: FaXTwitter,
        className: "bg-black text-white",
      },
      {
        label: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        Icon: FaFacebookF,
        className: "bg-[#1877f2] text-white",
      },
      {
        label: "WhatsApp",
        href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        Icon: MessageCircle,
        className: "bg-[#25d366] text-white",
      },
      {
        label: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        Icon: FaLinkedinIn,
        className: "bg-[#0a66c2] text-white",
      },
      {
        label: "Messenger",
        href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&redirect_uri=${encodedUrl}`,
        Icon: Send,
        className: "bg-[#a855f7] text-white",
      },
    ],
    [encodedText, encodedUrl],
  );

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${displayName} - ghxsty.lol`,
        url: profileUrl,
      });
      return;
    }

    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void nativeShare()}
        className="fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:scale-105 hover:bg-white/10"
        aria-label="Profili paylaş"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-xl border border-white/15 bg-zinc-950 text-white shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold">Profili paylaş</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Paylaşım penceresini kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div
                className="flex min-h-56 flex-col items-center justify-center rounded-lg px-6 py-7 text-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}55, rgba(255,255,255,.08))`,
                }}
              >
                <AvatarFrame
                  src={avatarUrl}
                  fallback={displayName}
                  alt={displayName}
                  decoration={avatarDecoration}
                  size="lg"
                />
                <h3 className="mt-5 text-2xl font-bold tracking-normal">{displayName}</h3>
                <p className="text-sm text-white/80">/{username}</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex min-w-20 flex-col items-center gap-2 text-center text-xs text-zinc-200"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-950">
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </span>
                  {copied ? "Kopyalandı" : "Linki kopyala"}
                </button>

                {shareTargets.map(({ label, href, Icon, className }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-20 flex-col items-center gap-2 text-center text-xs text-zinc-200"
                  >
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-full", className)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    {label}
                  </a>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <h3 className="font-semibold">ghxsty.lol profilini paylaş</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Profil linkini arkadaşlarına gönder veya sosyal platformlarda paylaş.
                </p>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  {copied ? "Kopyalandı" : "Linki kopyala"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
