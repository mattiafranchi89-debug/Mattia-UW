import React from 'react';
import { GroundingMetadata } from '../types';

interface WebNewsProps {
  metadata: GroundingMetadata;
}

export const WebNews: React.FC<WebNewsProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Web Grounding Sources</h2>
      <ul className="space-y-3">
        {metadata.groundingChunks.map((chunk, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <a
                href={chunk.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
              >
                {chunk.web.title}
              </a>
               <p className="text-xs text-gray-500 truncate">{chunk.web.uri}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
