"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Parsed RSS item structure from the parseRssFeed action.
 */
interface ParsedRssItem {
  title: string;
  content: string;
  publishedAt: number;
  substackUrl: string;
  excerpt?: string;
  alreadyImported: boolean;
}

/**
 * RssImporter provides a UI for importing articles from Substack RSS feeds.
 *
 * Features:
 * - URL input with validation
 * - Fetch button to parse RSS feed
 * - Preview list of articles with checkboxes
 * - Author dropdown for assignment
 * - Tags multi-select (optional)
 * - Import button with success/error feedback
 */
export function RssImporter() {
  // Form state
  const [rssUrl, setRssUrl] = useState("");
  const [authorId, setAuthorId] = useState<Id<"profiles"> | "">("");
  const [selectedTags, setSelectedTags] = useState<Id<"tags">[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // UI state
  const [urlError, setUrlError] = useState<string | null>(null);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedRssItem[] | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  // Fetch data for dropdowns
  const profiles = useQuery(api.profiles.list);
  const tags = useQuery(api.tags.list);

  // Actions and mutations
  // Note: parseRssFeed is in articlesRss.ts because it requires Node.js runtime
  const parseRssFeed = useAction(api.articlesRss.parseRssFeed);
  const importFromRss = useMutation(api.articles.importFromRss);

  // Filter to only published profiles for author dropdown
  const publishedProfiles = profiles?.filter(
    (p) => p.profileStatus === "published"
  );

  /**
   * Validate URL format.
   */
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("URL is required");
      return false;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setUrlError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
    setUrlError(null);
    return true;
  };

  /**
   * Handle fetch button click - parse RSS feed.
   */
  const handleFetch = async () => {
    setFetchError(null);
    setImportResult(null);

    if (!validateUrl(rssUrl)) {
      return;
    }

    setIsFetching(true);

    try {
      const items = await parseRssFeed({ rssUrl });
      setParsedItems(items);
      // Reset selection
      setSelectedItems(new Set());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch RSS feed";
      setFetchError(message);
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Toggle item selection.
   */
  const handleItemToggle = (index: number) => {
    const item = parsedItems?.[index];
    if (!item || item.alreadyImported) return;

    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  /**
   * Toggle tag selection.
   */
  const handleTagToggle = (tagId: Id<"tags">) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  /**
   * Handle import button click.
   */
  const handleImport = async () => {
    setImportError(null);
    setAuthorError(null);

    // Validate author selection
    if (!authorId) {
      setAuthorError("Author is required. Please select an author.");
      return;
    }

    // Get selected items
    const itemsToImport = parsedItems?.filter(
      (_, index) => selectedItems.has(index) && !parsedItems[index].alreadyImported
    );

    if (!itemsToImport || itemsToImport.length === 0) {
      setImportError("Please select at least one article to import");
      return;
    }

    setIsImporting(true);

    try {
      const result = await importFromRss({
        items: itemsToImport.map((item) => ({
          title: item.title,
          content: item.content,
          publishedAt: item.publishedAt,
          substackUrl: item.substackUrl,
          excerpt: item.excerpt,
        })),
        authorId: authorId as Id<"profiles">,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      setImportResult(result);

      // Update parsed items to mark imported ones
      if (parsedItems) {
        const updatedItems = parsedItems.map((item, index) => {
          if (selectedItems.has(index)) {
            return { ...item, alreadyImported: true };
          }
          return item;
        });
        setParsedItems(updatedItems);
        setSelectedItems(new Set());
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Import failed";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Format date for display.
   */
  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="rssUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            RSS Feed URL
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="url"
              id="rssUrl"
              value={rssUrl}
              onChange={(e) => {
                setRssUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://yoursubstack.substack.com/feed"
              className={`flex-1 rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                urlError
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={isFetching}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isFetching ? "Fetching..." : "Fetch"}
            </button>
          </div>
          {urlError && (
            <p className="mt-1 text-sm text-red-600">{urlError}</p>
          )}
        </div>
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          Error: {fetchError}
        </div>
      )}

      {/* Loading State */}
      {isFetching && (
        <div className="text-center py-8 text-gray-500">
          Fetching and parsing RSS feed...
        </div>
      )}

      {/* Parsed Items List */}
      {parsedItems && parsedItems.length > 0 && (
        <div className="space-y-6">
          {/* Author Selection (Required) */}
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
              onChange={(e) => {
                setAuthorId(e.target.value as Id<"profiles">);
                setAuthorError(null);
              }}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                authorError
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
            {authorError && (
              <p className="mt-1 text-sm text-red-600">{authorError}</p>
            )}
          </div>

          {/* Tags Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (Optional)
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

          {/* Articles List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Articles Found ({parsedItems.length})
            </h3>
            <div className="space-y-3">
              {parsedItems.map((item, index) => (
                <div
                  key={item.substackUrl || index}
                  className={`border rounded-lg p-4 ${
                    item.alreadyImported
                      ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      : selectedItems.has(index)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => handleItemToggle(index)}
                      disabled={item.alreadyImported}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        {item.alreadyImported && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Already imported
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(item.publishedAt)}
                      </p>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || selectedItems.size === 0}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting
                ? "Importing..."
                : `Import Selected (${selectedItems.size})`}
            </button>
            {selectedItems.size === 0 && parsedItems.length > 0 && (
              <span className="text-sm text-gray-500">
                Select articles to import
              </span>
            )}
          </div>

          {/* Import Error */}
          {importError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
              Error: {importError}
            </div>
          )}

          {/* Import Success */}
          {importResult && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-800 dark:text-green-200">
              <p className="font-medium">Import Complete</p>
              <p className="text-sm mt-1">
                {importResult.imported} imported, {importResult.skipped} skipped
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Items Found */}
      {parsedItems && parsedItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No articles found in the RSS feed.
        </div>
      )}
    </div>
  );
}
