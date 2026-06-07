export type ProfileTheme =
  | "dark"
  | "light"
  | "midnight"
  | "cyberpunk"
  | "anime"
  | "glass";

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  music_url: string | null;
  music_title: string | null;
  music_show_volume: boolean | null;
  music_volume_position: string | null;
  accent_color: string | null;
  page_background_color: string | null;
  panel_background_color: string | null;
  text_color: string | null;
  muted_text_color: string | null;
  button_background_color: string | null;
  button_text_color: string | null;
  header_enabled: boolean | null;
  header_background_style: string | null;
  header_color: string | null;
  header_color_to: string | null;
  panel_visible: boolean | null;
  links_icon_only: boolean | null;
  background_blur: number | null;
  panel_opacity: number | null;
  button_opacity: number | null;
  background_style: string | null;
  button_style: string | null;
  font_style: string | null;
  theme: ProfileTheme;
  created_at: string;
  updated_at: string;
};

export type ProfileLink = {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
};

export type ProfileVote = {
  id: string;
  profile_id: string;
  user_id: string;
  value: 1 | -1;
  created_at: string;
  updated_at: string;
};

export type ProfileVoteScore = {
  profile_id: string;
  upvotes: number;
  downvotes: number;
  score: number;
};

export type PublicProfile = Profile & {
  profile_links: ProfileLink[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & {
          user_id: string;
          username: string;
        };
        Update: Partial<Omit<Profile, "id" | "user_id" | "created_at">>;
      };
      profile_links: {
        Row: ProfileLink;
        Insert: Omit<ProfileLink, "id"> & { id?: string };
        Update: Partial<Omit<ProfileLink, "id" | "profile_id">>;
      };
      profile_votes: {
        Row: ProfileVote;
        Insert: Omit<ProfileVote, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileVote, "id" | "profile_id" | "user_id" | "created_at">>;
      };
    };
    Views: {
      profile_vote_scores: {
        Row: ProfileVoteScore;
      };
    };
  };
};
