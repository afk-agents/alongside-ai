"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Size = "sm" | "md" | "lg" | "xl";

interface ProfilePhotoProps {
  photoUrl?: string;
  photoStorageId?: Id<"_storage">;
  displayName?: string;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const textSizeClasses: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

const imageSizes: Record<Size, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function ProfilePhoto({
  photoUrl,
  photoStorageId,
  displayName,
  size = "md",
}: ProfilePhotoProps) {
  const [imageError, setImageError] = useState(false);

  // Fetch URL from storage if photoStorageId is provided
  const storageUrl = useQuery(
    api.profiles.getPhotoUrl,
    photoStorageId ? { storageId: photoStorageId } : "skip"
  );

  // Prefer photoUrl over storageUrl
  const effectivePhotoUrl = photoUrl || (storageUrl ?? undefined);

  const showImage = effectivePhotoUrl && !imageError;
  const showInitials = !showImage && displayName;

  const baseClasses = `rounded-full overflow-hidden flex items-center justify-center ${sizeClasses[size]}`;

  if (showImage) {
    return (
      <div
        data-testid="profile-photo"
        className={`${baseClasses} relative bg-gray-200`}
        aria-label={displayName || "Profile photo"}
      >
        <Image
          src={effectivePhotoUrl}
          alt={displayName || "Profile photo"}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (showInitials) {
    const initials = getInitials(displayName);
    return (
      <div
        data-testid="profile-photo"
        className={`${baseClasses} bg-gray-200 text-gray-600 font-medium ${textSizeClasses[size]}`}
        aria-label={displayName}
      >
        {initials}
      </div>
    );
  }

  // Generic placeholder
  return (
    <div
      data-testid="profile-photo"
      className={`${baseClasses} bg-gray-200 text-gray-400`}
      aria-label="Profile photo"
    >
      <span data-testid="profile-photo-placeholder">
        <svg
          className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : size === "lg" ? "w-8 h-8" : "w-12 h-12"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
}
