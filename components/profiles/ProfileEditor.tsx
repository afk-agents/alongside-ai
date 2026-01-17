"use client";

import { useState, FormEvent, useRef, ChangeEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ProfilePhoto } from "./ProfilePhoto";

type Profile = {
  _id: Id<"profiles">;
  _creationTime: number;
  userId: Id<"users">;
  role: "admin" | "member" | "guest";
  profileStatus: "locked" | "unlocked" | "published";
  displayName?: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  workingOnNow?: string;
  skills?: string[];
  location?: string;
  slug?: string;
  photoStorageId?: Id<"_storage">;
};

interface ProfileEditorProps {
  profile: Profile;
}

/**
 * Generates a URL-friendly slug from a display name.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const update = useMutation(api.profiles.update);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [slug, setSlug] = useState(profile.slug ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [workingOnNow, setWorkingOnNow] = useState(profile.workingOnNow ?? "");
  const [skillsInput, setSkillsInput] = useState(
    profile.skills?.join(", ") ?? ""
  );
  const [profileStatus, setProfileStatus] = useState<
    "locked" | "unlocked" | "published"
  >(profile.profileStatus);

  // Social links
  const [linkedin, setLinkedin] = useState(profile.socialLinks?.linkedin ?? "");
  const [twitter, setTwitter] = useState(profile.socialLinks?.twitter ?? "");
  const [github, setGithub] = useState(profile.socialLinks?.github ?? "");
  const [website, setWebsite] = useState(profile.socialLinks?.website ?? "");

  // Photo upload state
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | undefined>(
    profile.photoStorageId
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSlugGenerate = () => {
    if (displayName) {
      setSlug(generateSlug(displayName));
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();
      setPhotoStorageId(storageId);
      setMessage({ type: "success", text: "Photo uploaded successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload photo" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Parse skills from comma-separated input
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Build social links object
      const socialLinks = {
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        github: github || undefined,
        website: website || undefined,
      };

      await update({
        id: profile._id,
        displayName: displayName || undefined,
        bio: bio || undefined,
        slug: slug || undefined,
        location: location || undefined,
        workingOnNow: workingOnNow || undefined,
        skills: skills.length > 0 ? skills : undefined,
        profileStatus,
        socialLinks,
      });

      // If we have a new photo storage ID, update it separately
      if (photoStorageId && photoStorageId !== profile.photoStorageId) {
        await update({
          id: profile._id,
        });
      }

      setMessage({ type: "success", text: "Profile saved successfully" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save profile";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status message */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Photo Upload Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <ProfilePhoto
            displayName={displayName}
            photoStorageId={photoStorageId}
            photoUrl={profile.photoUrl}
            size="xl"
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700"
            >
              Slug
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-name"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSlugGenerate}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="profileStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Status
            </label>
            <select
              id="profileStatus"
              value={profileStatus}
              onChange={(e) =>
                setProfileStatus(
                  e.target.value as "locked" | "unlocked" | "published"
                )
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="locked">Locked</option>
              <option value="unlocked">Unlocked</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Work</h2>

        <div>
          <label
            htmlFor="workingOnNow"
            className="block text-sm font-medium text-gray-700"
          >
            Currently Working On
          </label>
          <textarea
            id="workingOnNow"
            rows={3}
            value={workingOnNow}
            onChange={(e) => setWorkingOnNow(e.target.value)}
            placeholder="What are you currently working on?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700"
          >
            Skills
          </label>
          <input
            type="text"
            id="skills"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="TypeScript, React, Machine Learning (comma-separated)"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate skills with commas
          </p>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Social Links</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium text-gray-700"
            >
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="twitter"
              className="block text-sm font-medium text-gray-700"
            >
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/username"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700"
            >
              GitHub
            </label>
            <input
              type="url"
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-gray-700"
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
