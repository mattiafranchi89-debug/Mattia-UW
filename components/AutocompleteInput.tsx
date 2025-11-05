import React, { useState, useEffect, useRef } from 'react';

// Icon Components for Data Status
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);

const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

const statusMap = {
    ok: { Icon: CheckCircleIcon, color: 'text-green-500', label: 'Data Quality: OK' },
    partial: { Icon: ExclamationTriangleIcon, color: 'text-yellow-500', label: 'Data Quality: Partial' },
    ambiguous: { Icon: QuestionMarkCircleIcon, color: 'text-orange-500', label: 'Data Quality: Ambiguous' }
};

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  status?: string | null;
  tooltip?: string;
  isMissing?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ label, value, onChange, suggestions, status, tooltip, isMissing = false }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value;
    const newFilteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    onChange(userInput);
    setFilteredSuggestions(newFilteredSuggestions);
    setShowSuggestions(true);
    setActiveSuggestionIndex(0);
  };

  const handleClick = (suggestion: string) => {
    onChange(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleClick(filteredSuggestions[activeSuggestionIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeSuggestionIndex === 0) return;
        setActiveSuggestionIndex(activeSuggestionIndex - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeSuggestionIndex === filteredSuggestions.length - 1) return;
        setActiveSuggestionIndex(activeSuggestionIndex + 1);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const SuggestionsListComponent = () => {
    return filteredSuggestions.length && showSuggestions && value ? (
      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
        {filteredSuggestions.map((suggestion, index) => {
          let className = "px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-red-50";
          if (index === activeSuggestionIndex) {
            className += " bg-red-100";
          }
          return (
            <li className={className} key={suggestion} onClick={() => handleClick(suggestion)}>
              {suggestion}
            </li>
          );
        })}
      </ul>
    ) : null;
  };

  const statusDetails = status ? statusMap[status.toLowerCase() as keyof typeof statusMap] : null;

  const StatusIndicator = () => {
    if (!statusDetails) return null;
    const { Icon, color, label } = statusDetails;
    return (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="relative group/tooltip">
                <Icon className={`h-5 w-5 ${color}`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10">
                    {label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div ref={componentRef}>
        <div className="flex items-center space-x-1 mb-1">
            <label className="block text-sm font-medium text-gray-600">{label}</label>
            {tooltip && (
                <div className="relative group/tooltip">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 z-10">
                        {tooltip}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                    </div>
                </div>
            )}
        </div>
        <div className="relative group">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`block w-full text-sm border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black pr-8 ${isMissing ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="off"
            />
            <StatusIndicator />
            <SuggestionsListComponent />
        </div>
    </div>
  );
};