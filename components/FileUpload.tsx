
import React, { useRef } from 'react';

interface FileUploadProps {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onClearFiles: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesAdd, onFileRemove, onClearFiles, onSubmit, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length > 0) {
      onFilesAdd(newFiles);
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-grow w-full">
            {files.length === 0 ? (
                <button
                    onClick={handleButtonClick}
                    className="w-full border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-red-500 hover:bg-red-50 transition-colors duration-300"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.eml,.msg"
                        multiple
                    />
                    <div className="flex flex-col items-center text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="font-medium">Click to upload or drag and drop files</span>
                        <span className="text-sm">PDF, DOCX, EML, MSG</span>
                    </div>
                </button>
            ) : (
                 <div className="w-full space-y-2">
                    {files.map((file, index) => (
                         <div key={index} className="flex items-center justify-between w-full bg-gray-100 p-2 rounded-md border border-gray-200">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium text-sm text-gray-700 truncate" title={file.name}>{file.name}</span>
                            </div>
                            <button onClick={() => onFileRemove(index)} className="text-gray-500 hover:text-red-500 p-1 rounded-full transition-colors flex-shrink-0">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                        <button onClick={handleButtonClick} className="text-sm text-red-500 hover:text-red-700 font-semibold">
                            Add more files...
                        </button>
                        <button onClick={onClearFiles} className="text-sm text-gray-500 hover:text-gray-700 font-semibold">
                            Clear all
                        </button>
                    </div>
                </div>
            )}
        </div>
        <button
          onClick={onSubmit}
          disabled={files.length === 0 || isLoading}
          className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Extract Data'
          )}
        </button>
      </div>
    </div>
  );
};
