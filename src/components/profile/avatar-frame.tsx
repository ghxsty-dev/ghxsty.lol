import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AvatarDecoration } from "@/types/database";

export function AvatarFrame({
  src,
  fallback,
  alt,
  decoration,
  size = "lg",
}: {
  src?: string | null;
  fallback: string;
  alt: string;
  decoration?: AvatarDecoration | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: {
      wrapper: "h-16 w-16",
      image: 64,
      text: "text-xl",
      decoration: "-inset-[15%] h-[130%] w-[130%]",
    },
    md: {
      wrapper: "h-20 w-20",
      image: 80,
      text: "text-2xl",
      decoration: "-inset-[15%] h-[130%] w-[130%]",
    },
    lg: {
      wrapper: "h-28 w-28",
      image: 112,
      text: "text-4xl",
      decoration: "-inset-[16%] h-[132%] w-[132%]",
    },
  }[size];

  return (
    <div className={cn("relative mx-auto", sizes.wrapper)}>
      <div className="h-full w-full overflow-hidden rounded-full border-4 border-white/20 bg-zinc-900 shadow-xl">
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={sizes.image}
            height={sizes.image}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center font-bold", sizes.text)}>
            {fallback.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      {decoration ? (
        // Decorations are authored as 400x400 transparent images and scaled around the avatar circle.
        <Image
          src={decoration.image_url}
          alt=""
          aria-hidden="true"
          width={400}
          height={400}
          unoptimized
          className={cn("pointer-events-none absolute z-10 max-w-none select-none object-contain", sizes.decoration)}
        />
      ) : null}
    </div>
  );
}
