/**
 * List Component
 * Handles ordered and unordered lists
 */

import React from 'react';

export function List({ type, children, ...props }) {
  const Tag = type === 'ol' ? 'ol' : 'ul';
  const className = type === 'ol'
    ? 'list-decimal list-inside mb-4 space-y-2'
    : 'list-disc list-inside mb-4 space-y-2';

  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
