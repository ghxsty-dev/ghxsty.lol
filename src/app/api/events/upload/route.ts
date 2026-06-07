import { NextResponse } from "next/server";
import { createR2PresignedUploadUrl } from "@/lib/r2";
import { requireModeratorOrAdmin } from "@/lib/permissions";

const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  await requireModeratorOrAdmin("/dashboard");

  const body = (await request.json()) as {
    eventId?: string;
    kind?: "video" | "thumbnail";
    fileName?: string;
    contentType?: string;
    size?: number;
  };

  const eventId = body.eventId?.trim();
  const kind = body.kind;
  const extension = body.fileName?.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    body.contentType?.trim() ||
    (extension === "mp4"
      ? "video/mp4"
      : extension === "webm"
        ? "video/webm"
        : extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : extension === "gif"
                ? "image/gif"
                : "");
  const size = Number(body.size ?? 0);

  if (!eventId || (kind !== "video" && kind !== "thumbnail")) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (kind === "video" && (!VIDEO_TYPES.includes(contentType) || size > MAX_VIDEO_SIZE)) {
    return NextResponse.json({ error: "Video mp4/webm olmalı ve 1 GB sınırını aşmamalı." }, { status: 400 });
  }

  if (kind === "thumbnail" && (!THUMBNAIL_TYPES.includes(contentType) || size > MAX_THUMBNAIL_SIZE)) {
    return NextResponse.json({ error: "Thumbnail jpg/png/webp/gif olmalı ve 10 MB sınırını aşmamalı." }, { status: 400 });
  }

  const resolvedExtension =
    extension || (kind === "video" ? (contentType === "video/webm" ? "webm" : "mp4") : "png");
  const key =
    kind === "video"
      ? `watch-party/events/${eventId}/video.${resolvedExtension}`
      : `watch-party/events/${eventId}/thumbnail.${resolvedExtension}`;

  const signed = await createR2PresignedUploadUrl({ key, contentType });
  return NextResponse.json({ ...signed, contentType });
}
