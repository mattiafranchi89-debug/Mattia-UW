import React, { useState, useEffect } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  initialBody: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, subject, initialBody }) => {
  const [body, setBody] = useState(initialBody);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBody(initialBody); // Reset body when modal is re-opened with new content
  }, [initialBody]);

  if (!isOpen) {
    return null;
  }

  const handleCopy = () => {
    const fullEmailText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmailText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-3 mb-4">Email Draft for Broker</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              readOnly
              value={subject}
              className="block w-full text-sm bg-gray-100 border-gray-300 rounded-md shadow-sm cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black"
            />
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md w-auto hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md w-auto border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};