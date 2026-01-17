"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

// Import highlight.js theme CSS
import "highlight.js/styles/github-dark.css";

interface ArticleContentProps {
  content: string;
}

/**
 * Generate a URL-friendly slug from text.
 * Used for heading anchor links.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if a URL is external (different domain).
 */
function isExternalLink(href: string): boolean {
  if (!href) return false;
  return href.startsWith("http://") || href.startsWith("https://");
}

/**
 * Custom component mappings for ReactMarkdown.
 */
const components: Components = {
  // Headings with slugified id for anchor links
  h1: ({ children, ...props }) => (
    <h1 id={slugify(String(children))} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 id={slugify(String(children))} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={slugify(String(children))} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 id={slugify(String(children))} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 id={slugify(String(children))} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 id={slugify(String(children))} {...props}>
      {children}
    </h6>
  ),

  // Links with external detection and target/rel
  a: ({ href, children, ...props }) => {
    const isExternal = isExternalLink(href ?? "");

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline"
        {...props}
      >
        {children}
      </a>
    );
  },

  // Code with syntax highlighting styling
  code: ({ className, children, ...props }) => {
    const isInline = !className;

    if (isInline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Pre blocks for code blocks with styling
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm"
      {...props}
    >
      {children}
    </pre>
  ),

  // Images with responsive container
  // Note: Using <img> instead of next/image because:
  // 1. External image URLs from markdown content may not be in next.config.js domains
  // 2. Image dimensions are unknown from markdown content
  // 3. Markdown rendering requires dynamic src handling
  img: ({ src, alt, ...props }) => (
    <span className="block my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        className="max-w-full h-auto rounded-lg"
        loading="lazy"
        {...props}
      />
    </span>
  ),

  // Blockquotes with styling
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Tables with styling
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border border-gray-300 dark:border-gray-600 px-4 py-2"
      {...props}
    >
      {children}
    </td>
  ),
};

/**
 * ArticleContent renders Markdown content with proper formatting.
 *
 * Features:
 * - GitHub-flavored markdown (tables, strikethrough, task lists)
 * - Syntax highlighting for code blocks
 * - XSS protection via sanitization
 * - External links open in new tab
 * - Responsive images
 * - Anchor links for headings
 */
export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
