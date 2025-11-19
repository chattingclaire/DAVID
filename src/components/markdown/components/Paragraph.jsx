/**
 * Paragraph Component
 */

import React from 'react';

export function Paragraph({ children, ...props }) {
  return (
    <p className="mb-4 leading-7" {...props}>
      {children}
    </p>
  );
}
