/**
 * Link Component
 * Handles internal and external links with proper security
 */

import React from 'react';

export function Link({ href, children, ...props }) {
  const isExternal = href?.startsWith('http');
  const isInternal = href?.startsWith('/');

  return (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {isExternal && (
        <span className="ml-1 text-xs">↗</span>
      )}
    </a>
  );
}
