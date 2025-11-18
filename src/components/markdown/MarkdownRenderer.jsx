/**
 * Unified Markdown Renderer Component
 * Single source of truth for all Markdown rendering across the platform
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Component imports
import {
  Heading,
  Paragraph,
  Link,
  Image,
  Table,
  List,
  Callout,
  Tabs
} from './components';

/**
 * Unified Markdown Renderer Component
 * @param {Object} props
 * @param {string} props.content - Markdown content to render
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.components - Custom component overrides
 */
export default function MarkdownRenderer({
  content,
  className = '',
  components: customComponents = {}
}) {
  // Memoize parsed content
  const parsedContent = useMemo(() => {
    if (!content) return '';
    return content;
  }, [content]);

  // Define component mappings
  const components = useMemo(() => ({
    // Headings with automatic IDs
    h1: ({ children, ...props }) => (
      <Heading level={1} {...props}>{children}</Heading>
    ),
    h2: ({ children, ...props }) => (
      <Heading level={2} {...props}>{children}</Heading>
    ),
    h3: ({ children, ...props }) => (
      <Heading level={3} {...props}>{children}</Heading>
    ),
    h4: ({ children, ...props }) => (
      <Heading level={4} {...props}>{children}</Heading>
    ),
    h5: ({ children, ...props }) => (
      <Heading level={5} {...props}>{children}</Heading>
    ),
    h6: ({ children, ...props }) => (
      <Heading level={6} {...props}>{children}</Heading>
    ),

    // Paragraph
    p: ({ children, ...props }) => (
      <Paragraph {...props}>{children}</Paragraph>
    ),

    // Links with security
    a: ({ href, children, ...props }) => (
      <Link href={href} {...props}>{children}</Link>
    ),

    // Images with lazy loading
    img: ({ src, alt, ...props }) => (
      <Image src={src} alt={alt} {...props} />
    ),

    // Code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (!inline && language) {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            className="rounded-lg my-4"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      return (
        <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },

    // Tables
    table: ({ children, ...props }) => (
      <Table {...props}>{children}</Table>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <List type="ul" {...props}>{children}</List>
    ),
    ol: ({ children, ...props }) => (
      <List type="ol" {...props}>{children}</List>
    ),

    // Custom components
    Callout,
    Tabs,

    // Allow custom component overrides
    ...customComponents
  }), [customComponents]);

  return (
    <div className={`markdown-renderer prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {parsedContent}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Memoized export for performance
 */
export const MemoizedMarkdownRenderer = React.memo(MarkdownRenderer);
