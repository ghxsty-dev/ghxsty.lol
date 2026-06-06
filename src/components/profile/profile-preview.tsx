import { ProfileView } from "@/components/profile/profile-view";
import type { Profile, ProfileLink, PublicProfile } from "@/types/database";

export function ProfilePreview({
  profile,
  links,
}: {
  profile: Profile;
  links: ProfileLink[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="scale-[0.72] origin-top sm:scale-[0.82]">
        <div className="w-[576px]">
          <ProfileView
            profile={{ ...profile, profile_links: links } as PublicProfile}
          />
        </div>
      </div>
    </div>
  );
}
