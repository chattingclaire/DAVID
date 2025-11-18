/**
 * Image Component
 * Renders images with lazy loading and captions
 */

import React from 'react';

export function Image({ src, alt, ...props }) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="rounded-lg shadow-md w-full"
        {...props}
      />
      {alt && (
        <figcaption className="text-center text-sm text-gray-600 mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}
