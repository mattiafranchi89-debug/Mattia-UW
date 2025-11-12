import React, { useState } from 'react';

// Define the shape of the configuration object
export interface PdfExportConfig {
  includeRiskSummary: boolean;
  includeLatestNews: boolean;
  includeAnagrafica: boolean;
  includePropertyDetails: boolean;
  includeGeneralLiabilityDetails: boolean;
  includeProductLiabilityDetails: boolean;
  includeSublimits: boolean;
  includeBuildingDetails: boolean;
  useCustomCoverPage: boolean;
  policyNumber: string;
  underwriterName: string;
}

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: PdfExportConfig) => void;
}

const Checkbox: React.FC<{label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

const TextInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
        />
    </div>
);


export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [config, setConfig] = useState<PdfExportConfig>({
    includeRiskSummary: true,
    includeLatestNews: true,
    includeAnagrafica: true,
    includePropertyDetails: true,
    includeGeneralLiabilityDetails: true,
    includeProductLiabilityDetails: true,
    includeSublimits: true,
    includeBuildingDetails: true,
    useCustomCoverPage: false,
    policyNumber: '',
    underwriterName: '',
  });

  if (!isOpen) {
    return null;
  }

  const handleCheckboxChange = (field: keyof PdfExportConfig) => {
    setConfig(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleInputChange = (field: 'policyNumber' | 'underwriterName', value: string) => {
      setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateClick = () => {
    onGenerate(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-3 mb-4">PDF Export Options</h3>
          
          <div className="space-y-4">
            <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2">Include Sections</h4>
                <div className="grid grid-cols-2 gap-3">
                    <Checkbox label="Risk Summary" checked={config.includeRiskSummary} onChange={() => handleCheckboxChange('includeRiskSummary')} />
                    <Checkbox label="Latest News" checked={config.includeLatestNews} onChange={() => handleCheckboxChange('includeLatestNews')} />
                    <Checkbox label="General Information" checked={config.includeAnagrafica} onChange={() => handleCheckboxChange('includeAnagrafica')} />
                    <Checkbox label="Property Details" checked={config.includePropertyDetails} onChange={() => handleCheckboxChange('includePropertyDetails')} />
                    <Checkbox label="General Liability" checked={config.includeGeneralLiabilityDetails} onChange={() => handleCheckboxChange('includeGeneralLiabilityDetails')} />
                    <Checkbox label="Product Liability" checked={config.includeProductLiabilityDetails} onChange={() => handleCheckboxChange('includeProductLiabilityDetails')} />
                    <Checkbox label="Sublimits" checked={config.includeSublimits} onChange={() => handleCheckboxChange('includeSublimits')} />
                    <Checkbox label="Building Details" checked={config.includeBuildingDetails} onChange={() => handleCheckboxChange('includeBuildingDetails')} />
                </div>
            </div>

            <div className="border-t pt-4">
                 <h4 className="text-md font-semibold text-gray-800 mb-2">Cover Page</h4>
                 <Checkbox label="Add Custom Cover Page" checked={config.useCustomCoverPage} onChange={() => handleCheckboxChange('useCustomCoverPage')} />
                 {config.useCustomCoverPage && (
                    <div className="mt-3 space-y-3 pl-7">
                        <TextInput label="Policy Number" value={config.policyNumber} onChange={(e) => handleInputChange('policyNumber', e.target.value)} />
                        <TextInput label="Underwriter Name" value={config.underwriterName} onChange={(e) => handleInputChange('underwriterName', e.target.value)} />
                    </div>
                 )}
            </div>
          </div>
          
          <div className="flex justify-end items-center mt-6 pt-4 border-t space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md w-auto border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateClick}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md w-auto hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};