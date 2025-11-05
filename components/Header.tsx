import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <svg className="h-8 w-auto text-red-600" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 921.6C282.5 921.6 90.4 729.5 90.4 512S282.5 90.4 512 90.4s421.6 192.1 421.6 421.6-192.1 409.6-421.6 409.6z" />
              <path d="M512 307.2c-112.6 0-204.8 92.2-204.8 204.8s92.2 204.8 204.8 204.8 204.8-92.2 204.8-204.8-92.2-204.8-204.8-204.8zm0 318.1c-62.8 0-113.3-50.5-113.3-113.3s50.5-113.3 113.3-113.3 113.3 50.5 113.3 113.3-50.5 113.3-113.3 113.3z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800 ml-3">Insurance Underwriting Workbench</h1>
          </div>
          <div className="text-sm text-gray-500">
            Powered by Gemini
          </div>
        </div>
      </div>
    </header>
  );
};
