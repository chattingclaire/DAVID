/**
 * Tabs Component
 * Interactive tab component for organizing content
 */

import React, { useState } from 'react';

export function Tabs({ children, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Parse children to extract tab data
  // This is a simplified version - real implementation would be more robust
  const tabs = React.Children.toArray(children);

  return (
    <div className="my-6">
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 font-medium ${
              activeTab === index
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(index)}
          >
            Tab {index + 1}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs[activeTab]}
      </div>
    </div>
  );
}
