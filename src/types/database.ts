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
  is_admin: boolean | null;
  view_count: number | null;
  avatar_decoration_id: string | null;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  discord_id: string | null;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  discord_banner_url: string | null;
  discord_accent_color: number | null;
  discord_show_presence: boolean | null;
  discord_connected_at: string | null;
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
  panel_radius: number | null;
  button_radius: number | null;
  background_style: string | null;
  button_style: string | null;
  font_style: string | null;
  display_name_effect: string | null;
  theme: ProfileTheme;
  created_at: string;
  updated_at: string;
};

export type AvatarDecoration = {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean | null;
  created_by_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityThemeStatus = "pending" | "approved" | "rejected";

export type CommunityTheme = {
  id: string;
  author_profile_id: string;
  name: string;
  description: string | null;
  status: CommunityThemeStatus;
  banner_url: string | null;
  music_url: string | null;
  music_title: string | null;
  music_show_volume: boolean | null;
  music_volume_position: string | null;
  theme: ProfileTheme;
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
  panel_radius: number | null;
  button_radius: number | null;
  background_style: string | null;
  button_style: string | null;
  font_style: string | null;
  display_name_effect: string | null;
  approved_by_profile_id: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityThemeWithAuthor = CommunityTheme & {
  author?: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
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
  avatar_decoration?: AvatarDecoration | null;
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
      avatar_decorations: {
        Row: AvatarDecoration;
        Insert: Omit<AvatarDecoration, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AvatarDecoration, "id" | "created_at">>;
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
      community_themes: {
        Row: CommunityTheme;
        Insert: Omit<CommunityTheme, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CommunityTheme, "id" | "created_at">>;
      };
    };
    Views: {
      profile_vote_scores: {
        Row: ProfileVoteScore;
      };
    };
    Functions: {
      increment_profile_view: {
        Args: { target_profile_id: string };
        Returns: number;
      };
    };
  };
};
