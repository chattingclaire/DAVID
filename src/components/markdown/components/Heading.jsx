/**
 * Heading Component
 * Renders headings with automatic anchor IDs
 */

import React from 'react';

export function Heading({ level, children, ...props }) {
  const Tag = `h${level}`;

  // Generate ID from text content
  const id = typeof children === 'string'
    ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : undefined;

  const styles = {
    1: 'text-4xl font-bold mt-8 mb-4',
    2: 'text-3xl font-bold mt-6 mb-3',
    3: 'text-2xl font-semibold mt-5 mb-2',
    4: 'text-xl font-semibold mt-4 mb-2',
    5: 'text-lg font-semibold mt-3 mb-2',
    6: 'text-base font-semibold mt-2 mb-1'
  };

  return (
    <Tag id={id} className={styles[level]} {...props}>
      {children}
      {id && (
        <a href={`#${id}`} className="ml-2 text-gray-400 hover:text-gray-600 no-underline">
          #
        </a>
      )}
    </Tag>
  );
}
