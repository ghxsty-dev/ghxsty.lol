import type { Profile } from "@/types/database";

export type EventStatus = "draft" | "scheduled" | "live" | "ended" | "deleted";
export type EventCommandType =
  | "play"
  | "pause"
  | "seek"
  | "end"
  | "announcement"
  | "poll_created"
  | "poll_closed";

export type WatchEvent = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_storage_key: string | null;
  thumbnail_url: string | null;
  status: EventStatus;
  is_playing: boolean;
  playback_position: number;
  playback_updated_at: string;
  starts_at: string | null;
  ended_at: string | null;
  delete_after: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventCommand = {
  id: string;
  event_id: string;
  type: EventCommandType;
  position: number | null;
  payload: Record<string, unknown> | null;
  created_by: string | null;
  sent_at: string;
};

export type EventMessageProfile = Pick<
  Profile,
  | "user_id"
  | "username"
  | "display_name"
  | "avatar_url"
  | "avatar_decoration_url"
  | "name_effect"
  | "role"
>;

export type EventMessage = {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  message_type?: "text" | "gif";
  gif_url?: string | null;
  created_at: string;
  deleted_at: string | null;
  profile?: EventMessageProfile | null;
};

export type EventAnnouncement = {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

export type EventPoll = {
  id: string;
  event_id: string;
  question: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
  options?: EventPollOption[];
};

export type EventPollOption = {
  id: string;
  poll_id: string;
  option_text: string;
  position: number;
  votes?: number;
};

export type EventPollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
};
