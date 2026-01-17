"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MarkdownPreview } from "./MarkdownPreview";
import { generateSlug } from "@/convex/articles";

interface Article {
  _id: Id<"articles">;
  title: string;
  slug: string;
  content: string;
  authorId: Id<"profiles">;
  publishedAt: number;
  excerpt?: string;
  tags?: Id<"tags">[];
  substackUrl?: string;
  isFeatured?: boolean;
}

interface ArticleEditorProps {
  article?: Article;
  onSuccess: () => void;
}

/**
 * ArticleEditor provides a form for creating and editing articles.
 *
 * Features:
 * - Form state for all article fields
 * - Auto-generated slug from title
 * - Author dropdown from profiles
 * - Multi-select tags
 * - Live markdown preview
 * - Split layout on desktop, collapsible on mobile
 */
export function ArticleEditor({ article, onSuccess }: ArticleEditorProps) {
  const isEditing = !!article;

  // Form state
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [content, setContent] = useState(article?.content ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [authorId, setAuthorId] = useState<Id<"profiles"> | "">(
    article?.authorId ?? ""
  );
  const [selectedTags, setSelectedTags] = useState<Id<"tags">[]>(
    article?.tags ?? []
  );
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt
      ? new Date(article.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [substackUrl, setSubstackUrl] = useState(article?.substackUrl ?? "");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Fetch data for dropdowns
  const profiles = useQuery(api.profiles.list);
  const tags = useQuery(api.tags.list);

  // Mutations
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);

  // Auto-generate slug from title (only if slug hasn't been manually edited)
  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugEdited]);

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugEdited(true);
  };

  const handleTagToggle = (tagId: Id<"tags">) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug =
        "Slug must be lowercase alphanumeric with hyphens between words";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!authorId) {
      newErrors.authorId = "Author is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    if (!authorId) return;

    setIsSubmitting(true);

    try {
      const publishedAtTimestamp = new Date(publishedAt).getTime();

      if (isEditing && article) {
        await updateArticle({
          id: article._id,
          title,
          slug,
          content,
          excerpt: excerpt || undefined,
          authorId,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          publishedAt: publishedAtTimestamp,
          isFeatured,
          substackUrl: substackUrl || undefined,
        });
      } else {
        await createArticle({
          title,
          slug,
          content,
          excerpt: excerpt || undefined,
          authorId,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          publishedAt: publishedAtTimestamp,
          isFeatured,
          substackUrl: substackUrl || undefined,
        });
      }

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter to only published profiles for author dropdown
  const publishedProfiles = profiles?.filter(
    (p) => p.profileStatus === "published"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error banner */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Form fields */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 text-gray-500 dark:text-gray-400 text-sm">
                /blog/
              </span>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`block w-full rounded-r-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Author <span className="text-red-500">*</span>
            </label>
            <select
              id="author"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value as Id<"profiles">)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.authorId
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            >
              <option value="">Select an author...</option>
              {publishedProfiles?.map((profile) => (
                <option key={profile._id} value={profile._id}>
                  {profile.displayName || profile.slug || "Unnamed"}
                </option>
              ))}
            </select>
            {errors.authorId && (
              <p className="mt-1 text-sm text-red-600">{errors.authorId}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Brief summary (auto-generated from content if empty)"
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleTagToggle(tag._id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag._id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Published Date */}
          <div>
            <label
              htmlFor="publishedAt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Published Date
            </label>
            <input
              type="datetime-local"
              id="publishedAt"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isFeatured"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Featured article
            </label>
          </div>

          {/* Substack URL */}
          <div>
            <label
              htmlFor="substackUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Substack URL
            </label>
            <input
              type="url"
              id="substackUrl"
              value={substackUrl}
              onChange={(e) => setSubstackUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Right column: Content and Preview */}
        <div className="space-y-4">
          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              placeholder="Write your article in Markdown..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.content
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Preview toggle (mobile) */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden w-full py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          {/* Preview */}
          {showPreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="rounded-lg border border-gray-300 dark:border-gray-600 p-4 max-h-96 overflow-y-auto bg-white dark:bg-gray-800">
                <MarkdownPreview content={content} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Article"
              : "Create Article"}
        </button>
      </div>
    </form>
  );
}
