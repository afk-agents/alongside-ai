import { ProfilePhoto } from "./ProfilePhoto";
import { SocialLinks } from "./SocialLinks";
import type { Id } from "@/convex/_generated/dataModel";

interface ProfilePageProps {
  profile: {
    _id: Id<"profiles">;
    _creationTime: number;
    userId: Id<"users">;
    role: "admin" | "member" | "guest";
    profileStatus: "locked" | "unlocked" | "published";
    displayName?: string;
    bio?: string;
    slug?: string;
    photoUrl?: string;
    location?: string;
    skills?: string[];
    workingOnNow?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
}

export function ProfilePage({ profile }: ProfilePageProps) {
  const {
    displayName,
    bio,
    photoUrl,
    location,
    skills,
    workingOnNow,
    socialLinks,
  } = profile;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Header with photo, name, location */}
      <header className="flex flex-col items-center text-center mb-8">
        <ProfilePhoto
          photoUrl={photoUrl}
          displayName={displayName}
          size="xl"
        />

        {displayName && (
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {displayName}
          </h1>
        )}

        {location && (
          <p
            data-testid="profile-location"
            className="mt-2 text-gray-600 dark:text-gray-400 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {location}
          </p>
        )}

        {socialLinks && (
          <div className="mt-4">
            <SocialLinks links={socialLinks} />
          </div>
        )}
      </header>

      {/* Bio */}
      {bio && (
        <section data-testid="profile-bio" className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            About
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {bio}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section data-testid="profile-skills" className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Working On Now */}
      {workingOnNow && (
        <section data-testid="profile-working-on" className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Currently Working On
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {workingOnNow}
          </p>
        </section>
      )}
    </article>
  );
}
