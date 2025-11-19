/**
 * Callout Component
 * Styled callout boxes for info, warning, error, success
 */

import React from 'react';

export function Callout({ type = 'info', children }) {
  const styles = {
    info: 'bg-blue-50 border-blue-400 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-900',
    error: 'bg-red-50 border-red-400 text-red-900',
    success: 'bg-green-50 border-green-400 text-green-900'
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <div className={`border-l-4 p-4 my-4 rounded ${styles[type]}`}>
      <div className="flex items-start">
        <span className="mr-2 text-xl">{icons[type]}</span>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
