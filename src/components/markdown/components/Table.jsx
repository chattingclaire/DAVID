/**
 * Table Component
 * Responsive table with scrolling
 */

import React from 'react';

export function Table({ children, ...props }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-gray-300 rounded-lg" {...props}>
        {children}
      </table>
    </div>
  );
}
