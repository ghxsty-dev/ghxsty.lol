"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteR2ObjectByKey, deleteR2ObjectByUrl } from "@/lib/r2";
import { requireModeratorOrAdmin, requireUser } from "@/lib/permissions";
import type { EventCommandType, EventStatus } from "@/types/events";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

function parsePosition(value: FormDataEntryValue | null) {
  const position = Number(value ?? 0);
  return Number.isFinite(position) && position >= 0 ? position : 0;
}

async function insertCommand({
  eventId,
  type,
  position,
  payload,
}: {
  eventId: string;
  type: EventCommandType;
  position?: number | null;
  payload?: Record<string, unknown> | null;
}) {
  const { supabase, user } = await requireModeratorOrAdmin("/dashboard");
  await supabase.from("event_commands").insert({
    event_id: eventId,
    type,
    position: position ?? null,
    payload: payload ?? null,
    created_by: user.id,
  });
}

export async function createEventAction(formData: FormData) {
  const { supabase, user } = await requireModeratorOrAdmin("/dashboard");
  const title = cleanText(formData.get("title"), 120);
  const description = cleanText(formData.get("description"), 1000);
  const startsAt = cleanText(formData.get("starts_at"), 80);

  if (title.length < 3) {
    return;
  }

  const { data } = await supabase
    .from("events")
    .insert({
      title,
      description: description || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      status: startsAt ? "scheduled" : "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  revalidatePath("/dashboard/events");
  if (data?.id) {
    redirect(`/dashboard/events/${data.id}`);
  }
}

export async function updateEventAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const title = cleanText(formData.get("title"), 120);
  const description = cleanText(formData.get("description"), 1000);
  const startsAt = cleanText(formData.get("starts_at"), 80);
  const status = cleanText(formData.get("status"), 20) as EventStatus;
  const allowedStatuses: EventStatus[] = ["draft", "scheduled", "live", "ended", "deleted"];

  if (!eventId || title.length < 3 || !allowedStatuses.includes(status)) {
    return;
  }

  await supabase
    .from("events")
    .update({
      title,
      description: description || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function finalizeEventUploadAction({
  eventId,
  kind,
  publicUrl,
  key,
}: {
  eventId: string;
  kind: "video" | "thumbnail";
  publicUrl: string;
  key: string;
}) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");

  if (kind === "video") {
    const { data: event } = await supabase
      .from("events")
      .select("video_storage_key")
      .eq("id", eventId)
      .maybeSingle();

    await supabase
      .from("events")
      .update({
        video_url: publicUrl,
        video_storage_key: key,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (event?.video_storage_key && event.video_storage_key !== key) {
      await deleteR2ObjectByKey(event.video_storage_key);
    }
  } else {
    await supabase
      .from("events")
      .update({ thumbnail_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", eventId);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function playbackAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const command = cleanText(formData.get("command"), 20) as EventCommandType | "restart";
  const position = command === "restart" ? 0 : parsePosition(formData.get("position"));
  const now = new Date().toISOString();

  if (!eventId) {
    return;
  }

  if (command === "play" || command === "restart") {
    await supabase
      .from("events")
      .update({
        status: "live",
        is_playing: true,
        playback_position: position,
        playback_updated_at: now,
      })
      .eq("id", eventId);
    await insertCommand({ eventId, type: "play", position });
  }

  if (command === "pause") {
    await supabase
      .from("events")
      .update({
        is_playing: false,
        playback_position: position,
        playback_updated_at: now,
      })
      .eq("id", eventId);
    await insertCommand({ eventId, type: "pause", position });
  }

  if (command === "seek") {
    await supabase
      .from("events")
      .update({
        playback_position: position,
        playback_updated_at: now,
      })
      .eq("id", eventId);
    await insertCommand({ eventId, type: "seek", position });
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function endEventAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const now = new Date();

  if (!eventId) {
    return;
  }

  await supabase
    .from("events")
    .update({
      status: "ended",
      is_playing: false,
      ended_at: now.toISOString(),
      delete_after: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      playback_updated_at: now.toISOString(),
    })
    .eq("id", eventId);

  await insertCommand({ eventId, type: "end" });
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function deleteEventVideoAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const { data: event } = await supabase
    .from("events")
    .select("video_storage_key")
    .eq("id", eventId)
    .maybeSingle();

  await deleteR2ObjectByKey(event?.video_storage_key);
  await supabase
    .from("events")
    .update({
      video_url: null,
      video_storage_key: null,
      is_playing: false,
      playback_position: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function deleteEventAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);

  if (!eventId) {
    return;
  }

  const { data: event } = await supabase
    .from("events")
    .select("video_storage_key, thumbnail_url")
    .eq("id", eventId)
    .maybeSingle();

  await Promise.all([
    deleteR2ObjectByKey(event?.video_storage_key),
    deleteR2ObjectByUrl(event?.thumbnail_url),
  ]);

  await supabase.from("events").delete().eq("id", eventId);

  revalidatePath("/events");
  revalidatePath("/dashboard/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}`);
  redirect("/dashboard/events");
}

export async function createAnnouncementAction(formData: FormData) {
  const { supabase, user } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const title = cleanText(formData.get("title"), 120);
  const content = cleanText(formData.get("content"), 1000);

  if (!eventId || !title || !content) {
    return;
  }

  await supabase.from("event_announcements").insert({
    event_id: eventId,
    title,
    content,
    created_by: user.id,
  });
  await insertCommand({ eventId, type: "announcement", payload: { title, content } });

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function createPollAction(formData: FormData) {
  const { supabase, user } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const question = cleanText(formData.get("question"), 200);
  const options = ["option_1", "option_2", "option_3", "option_4"]
    .map((key) => cleanText(formData.get(key), 120))
    .filter(Boolean);

  if (!eventId || question.length < 3 || options.length < 2) {
    return;
  }

  const { data: poll } = await supabase
    .from("event_polls")
    .insert({ event_id: eventId, question, created_by: user.id })
    .select("id")
    .single();

  if (poll?.id) {
    await supabase.from("event_poll_options").insert(
      options.map((option, position) => ({
        poll_id: poll.id,
        option_text: option,
        position,
      })),
    );
    await insertCommand({ eventId, type: "poll_created", payload: { poll_id: poll.id } });
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function closePollAction(formData: FormData) {
  const { supabase } = await requireModeratorOrAdmin("/dashboard");
  const eventId = cleanText(formData.get("event_id"), 80);
  const pollId = cleanText(formData.get("poll_id"), 80);

  await supabase
    .from("event_polls")
    .update({ is_active: false, closed_at: new Date().toISOString() })
    .eq("id", pollId);
  await insertCommand({ eventId, type: "poll_closed", payload: { poll_id: pollId } });

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function votePollAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const eventId = cleanText(formData.get("event_id"), 80);
  const pollId = cleanText(formData.get("poll_id"), 80);
  const optionId = cleanText(formData.get("option_id"), 80);

  await supabase.from("event_poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  revalidatePath(`/events/${eventId}`);
}

export async function deleteMessageAction(formData: FormData) {
  const { supabase } = await requireUser();
  const eventId = cleanText(formData.get("event_id"), 80);
  const messageId = cleanText(formData.get("message_id"), 80);

  await supabase
    .from("event_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
}
