import Link from "next/link";
import { ProfilePhoto } from "./ProfilePhoto";
import { SocialLinks } from "./SocialLinks";
import type { Id } from "@/convex/_generated/dataModel";

interface ProfileCardProps {
  profile: {
    _id: Id<"profiles">;
    displayName?: string;
    bio?: string;
    slug?: string;
    photoUrl?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
  showViewProfile?: boolean;
}

export function ProfileCard({
  profile,
  showViewProfile = false,
}: ProfileCardProps) {
  const { displayName, bio, slug, photoUrl, socialLinks } = profile;
  const profileUrl = slug ? `/profiles/${slug}` : undefined;

  return (
    <div
      data-testid="profile-card"
      className="w-full rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-col items-center text-center">
        <ProfilePhoto
          photoUrl={photoUrl}
          displayName={displayName}
          size="lg"
        />

        {displayName && profileUrl ? (
          <Link
            href={profileUrl}
            className="mt-4 text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
          >
            {displayName}
          </Link>
        ) : displayName ? (
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {displayName}
          </h3>
        ) : null}

        {bio && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {bio}
          </p>
        )}

        {socialLinks && (
          <div className="mt-4">
            <SocialLinks links={socialLinks} />
          </div>
        )}

        {showViewProfile && profileUrl && (
          <Link
            href={profileUrl}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  );
}
