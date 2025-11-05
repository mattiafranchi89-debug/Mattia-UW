import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-8" role="alert">
        <div className="flex">
            <div className="py-1">
                 <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-11a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0V7zm1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
            </div>
            <div>
                <p className="font-bold">Error</p>
                <p>{message}</p>
            </div>
        </div>
    </div>
  );
};