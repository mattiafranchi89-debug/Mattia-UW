import React, { useState, useMemo } from 'react';
import { ExtractedData, Anagrafica, PropertyDetails, GeneralLiabilityDetails, ProductLiabilityDetails, WebNewsData, Sublimit, DettaglioEdifici } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { EmailModal } from './EmailModal';
import { PdfExportModal, PdfExportConfig } from './PdfExportModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// --- PROPS INTERFACE ---

interface EditableDataFormProps {
  data: ExtractedData;
  onUpdate: (updatedData: ExtractedData) => void;
  newsData: WebNewsData | null;
  isNewsLoading: boolean;
  newsError: string | null;
}

// --- HELPER COMPONENTS ---

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-opacity-75"
                aria-expanded={isOpen}
                aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
            >
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                id={`section-content-${title.replace(/\s+/g, '-')}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}
            >
                <div className="px-6 pb-6 pt-0">
                   {/* This separator is only visible when the content area is open */}
                   <div className="border-t border-gray-200 mb-6"></div>
                   {children}
                </div>
            </div>
        </div>
    );
};


const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">{children}</div>
);

// FIX: Define a props interface and use React.FC to correctly type the component, resolving issues with special props like `key`.
interface DataInputProps {
    label: string;
    value: any;
    onChange: (val: any) => void;
    type?: string;
    suggestions?: string[];
    status?: string | null;
    tooltip?: string;
    isMissing?: boolean;
}

const DataInput: React.FC<DataInputProps> = ({ label, value, onChange, type = 'text', suggestions = [], status = null, tooltip = '', isMissing = false }) => {
    if (suggestions.length > 0) {
        return <AutocompleteInput label={label} value={value ?? ''} onChange={onChange} suggestions={suggestions} status={status} tooltip={tooltip} isMissing={isMissing} />;
    }
    
    return (
        <div>
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
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : parseFloat(e.target.value)) : e.target.value)}
                className={`block w-full text-sm border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black ${isMissing ? 'border-red-500' : 'border-gray-300'}`}
            />
        </div>
    );
};

const TextareaInput: React.FC<{ label: string; value: string | null; onChange: (val: string) => void; rows?: number; fullWidth?: boolean; isMissing?: boolean; }> = ({ label, value, onChange, rows = 4, fullWidth = false, isMissing = false }) => (
    <div className={fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            rows={rows}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`block w-full text-sm border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black ${isMissing ? 'border-red-500' : 'border-gray-300'}`}
        />
    </div>
);


// --- FIELD CONFIGURATIONS ---

type FieldConfig<T> = {
    key: keyof T;
    label: string;
    type?: 'text' | 'number' | 'date';
    suggestions?: string[];
    tooltip?: string;
};

const anagraficaFields: FieldConfig<Anagrafica>[] = [
    { key: 'entityName', label: 'Entity Name' },
    { key: 'altNames', label: 'Alternative Names' },
    { key: 'type', label: 'Type', suggestions: ['Policyholder', 'Insured', 'Owner'] },
    { key: 'industry', label: 'Industry' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'address', label: 'Address' },
    { key: 'topLocation', label: 'Top Location' },
    { key: 'vat', label: 'VAT Number' },
    { key: 'taxCode', label: 'Tax Code' },
    { key: 'website', label: 'Website' },
    { key: 'brokerName', label: 'Broker Name' },
    { key: 'brokerCompany', label: 'Broker Company' },
    { key: 'periodFrom', label: 'Period From', type: 'date' },
    { key: 'periodTo', label: 'Period To', type: 'date' },
    { key: 'riskTypes', label: 'Risk Types' },
    { key: 'territorialScope', label: 'Territorial Scope' },
    { key: 'lossHistory5y', label: 'Loss History (5y)' },
    { key: 'annualRevenueAmount', label: 'Annual Revenue', type: 'number' },
    { key: 'annualRevenueYear', label: 'Revenue Year', type: 'number' },
    { key: 'payrollAmount', label: 'Payroll Amount', type: 'number' },
    { key: 'payrollYear', label: 'Payroll Year', type: 'number' },
    { key: 'headcount', label: 'Headcount', type: 'number' },
];

const propertyDetailsFields: FieldConfig<PropertyDetails>[] = [
    { key: 'tivPdTotalEur', label: 'TIV PD Total (EUR)', type: 'number', tooltip: 'Total Insured Value for Property Damage is a key metric for assessing the maximum potential loss from a single event.' },
    { key: 'tivBiSumInsEur', label: 'TIV BI Sum (EUR)', type: 'number', tooltip: 'Business Interruption value helps quantify the financial impact of a shutdown and is critical for coverage adequacy.' },
    { key: 'ratePerMille', label: 'Rate per Mille', type: 'number', tooltip: 'The rate is used to calculate the premium based on the total insured value; it reflects the assessed risk level.' },
    { key: 'catIncluded', label: 'CAT Included', tooltip: 'Clarifies if catastrophic events like earthquakes or floods are covered, which significantly impacts the risk profile.' },
    { key: 'buildingsEur', label: 'Buildings (EUR)', type: 'number', tooltip: 'The value of buildings is a primary component of the total property exposure.' },
    { key: 'machineryEur', label: 'Machinery (EUR)', type: 'number', tooltip: 'The value of machinery is essential for industries where equipment is critical to operations.' },
    { key: 'stockEur', label: 'Stock (EUR)', type: 'number', tooltip: 'Stock value helps assess exposure related to inventory, which can be highly susceptible to damage.' },
    { key: 'marginContributionEur', label: 'Margin Contribution (EUR)', type: 'number', tooltip: 'The contribution margin is a key input for calculating Business Interruption coverage needs.' },
    { key: 'fireProtectionSummary', label: 'Fire Protection Summary', tooltip: 'Details on fire protection systems (sprinklers, alarms) are crucial for evaluating fire risk mitigation.' },
    { key: 'natHazardNotes', label: 'Natural Hazard Notes', tooltip: 'Information on natural hazard exposure (e.g., flood zones, seismic activity) is vital for CAT risk assessment.' },
    { key: 'biPeriodMonths', label: 'BI Period (Months)', type: 'number', tooltip: 'The Business Interruption indemnity period determines how long the policy will cover losses after an event.' },
    { key: 'biNotes', label: 'BI Notes', tooltip: 'Specific notes on Business Interruption can highlight unique dependencies or vulnerabilities.' },
];

const generalLiabilityFields: FieldConfig<GeneralLiabilityDetails>[] = [
    { key: 'rctLimitEur', label: 'RCT Limit (EUR)', type: 'number', tooltip: 'The General Liability Limit defines the maximum payout for third-party bodily injury or property damage claims.' },
    { key: 'aggregateLimitEur', label: 'Aggregate Limit (EUR)', type: 'number', tooltip: 'The annual aggregate limit is the total amount the policy will pay for all claims within a policy period.' },
    { key: 'formRctRco', label: 'Form RCT/RCO', suggestions: ['Loss Occurrence', 'Claims Made'], tooltip: "The policy form (e.g., Claims Made) determines when a claim must be reported to be covered." },
    { key: 'usaCanCovered', label: 'USA/Canada Covered', suggestions: ['Yes', 'No'], tooltip: "Coverage for USA/Canada is a major factor as it represents a significantly different legal and risk environment." },
    { key: 'dedRct', label: 'Deductible RCT', type: 'number', tooltip: "The deductible is the amount the insured must pay out-of-pocket before the policy responds to a General Liability claim." },
    { key: 'extensions', label: 'Extensions', tooltip: "Understanding coverage extensions is key to defining the full scope of the policy." },
    { key: 'exclusions', label: 'Exclusions', tooltip: "Identifying main exclusions is critical to understanding what is not covered by the policy." },
    { key: 'waivers', label: 'Waivers', tooltip: "Waivers of recourse affect the insurer's ability to recover losses from third parties." },
    { key: 'retroUltrattivita', label: 'Retroactivity', tooltip: "Retroactive date is crucial for 'Claims Made' policies, defining the starting point for covered events." },
];

const productLiabilityFields: FieldConfig<ProductLiabilityDetails>[] = [
    { key: 'rcpLimitEur', label: 'RCP Limit (EUR)', type: 'number', tooltip: 'Product Liability Limit is essential for businesses that manufacture or sell products, covering claims of product-related harm.' },
    { key: 'formRcp', label: 'Form RCP', suggestions: ['Claims Made'], tooltip: "The policy form for products is critical, especially for risks with a long tail." },
    { key: 'recallSublimitEur', label: 'Recall Sublimit (EUR)', type: 'number', tooltip: 'Product recall coverage is important for mitigating the high costs associated with recalling a faulty product.' },
    { key: 'pollutionAccSublimitEur', label: 'Pollution Sublimit (EUR)', type: 'number', tooltip: 'Pollution liability is a critical coverage, especially for industrial or manufacturing risks.' },
    { key: 'interruptionThirdPartySublimitEur', label: '3rd Party Interruption (EUR)', type: 'number', tooltip: 'This covers losses when a key supplier or customer experiences an interruption, affecting the insured.' },
    { key: 'dedRcp', label: 'Deductible RCP', type: 'number', tooltip: "The product liability deductible impacts the insured's retained risk for product-related claims." },
];

const sublimitFields: FieldConfig<Sublimit>[] = [
    { key: 'riskType', label: 'Risk Type' },
    { key: 'coverage', label: 'Coverage' },
    { key: 'sublimitType', label: 'Sublimit Type' },
    { key: 'amountEurPercent', label: 'Amount (EUR/%)' },
];

const dettaglioEdificiFields: FieldConfig<DettaglioEdifici>[] = [
    { key: 'buildingId', label: 'Building ID' },
    { key: 'buildingName', label: 'Building Name' },
    { key: 'address', label: 'Address' },
    { key: 'occupancy', label: 'Occupancy' },
    { key: 'floorAreaSm', label: 'Floor Area (sqm)', type: 'number' },
    { key: 'buildingRcvEur', label: 'Building RCV (EUR)', type: 'number' },
    { key: 'contentsRcvEur', label: 'Contents RCV (EUR)', type: 'number' },
    { key: 'totalRcvEur', label: 'Total RCV (EUR)', type: 'number' },
    { key: 'yearBuilt', label: 'Year Built', type: 'number' },
    { key: 'manualFireAlarmPercent', label: '% Manual Fire Alarm', type: 'number' },
    { key: 'automaticFireAlarmPercent', label: '% Automatic Fire Alarm', type: 'number' },
    { key: 'sprinklersPercent', label: '% Sprinklers', type: 'number' },
    { key: 'roofMaterial', label: 'Roof Material' },
];

// --- MAIN COMPONENT ---

export const EditableDataForm: React.FC<EditableDataFormProps> = ({ data, onUpdate, newsData, isNewsLoading, newsError }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [expandedBuildingIndex, setExpandedBuildingIndex] = useState<number | null>(null);

    /**
     * Handles updates to any field in the form data.
     * @param section - The top-level key in the ExtractedData object (e.g., 'anagrafica').
     * @param field - The specific field key within the section object.
     * @param value - The new value for the field.
     */
    const handleChange = <T,>(section: keyof ExtractedData, field: keyof T, value: any) => {
        const newData = {
            ...data,
            [section]: {
                ...(data[section] as object),
                [field]: value,
            },
        };
        onUpdate(newData);
    };

    const handleArrayChange = <T,>(section: 'dettaglioEdifici' | 'sublimits', index: number, field: keyof T, value: any) => {
        const newArray = [...data[section]];
        newArray[index] = {
            ...newArray[index],
            [field]: value
        };
        const newData = {
            ...data,
            [section]: newArray
        };
        onUpdate(newData);
    };


    /**
     * Scans the form data for missing values and generates a formatted email draft
     * grouped by section to request the information from the broker.
     */
    const generateEmailForMissingData = () => {
        const missingFieldsBySection: Record<string, string[]> = {};

        const sectionsToScan = [
            { key: 'anagrafica' as const, title: 'General Information', fields: anagraficaFields },
            { key: 'propertyDetails' as const, title: 'Property Details', fields: propertyDetailsFields },
            { key: 'generalLiabilityDetails' as const, title: 'General Liability Details', fields: generalLiabilityFields },
            { key: 'productLiabilityDetails' as const, title: 'Product Liability Details', fields: productLiabilityFields }
        ];

        sectionsToScan.forEach(section => {
            const sectionData = data[section.key];
            if (sectionData) {
                const missingInSection: string[] = [];
                section.fields.forEach(fieldConfig => {
                    const value = sectionData[fieldConfig.key as keyof typeof sectionData];
                    // Check for null, undefined, empty string, or 0
                    if (value === null || value === undefined || value === '' || value === 0) {
                        missingInSection.push(`- ${fieldConfig.label}`);
                    }
                });
                
                if (missingInSection.length > 0) {
                    missingFieldsBySection[section.title] = missingInSection;
                }
            }
        });

        const subject = `Request for Information: Policy for ${data.anagrafica.entityName || 'N/A'}`;
        const sectionTitles = Object.keys(missingFieldsBySection);

        const body = sectionTitles.length > 0
            ? `Dear Broker,\n\nThank you for sending over the documentation. To proceed with the underwriting process for ${data.anagrafica.entityName || 'your client'}, we kindly request the following missing or zero-value information:\n\n` +
              sectionTitles.map(title => 
                `${title}:\n${missingFieldsBySection[title].join('\n')}`
              ).join('\n\n') +
              `\n\nPlease provide these details at your earliest convenience.\n\nBest regards,\nYour Underwriting Team`
            : `Dear Broker,\n\nThank you for sending over the documentation for ${data.anagrafica.entityName || 'your client'}. All primary data fields appear to be complete based on our initial review.\n\nIf you have any additional information to provide, please let us know.\n\nBest regards,\nYour Underwriting Team`;
        
        setEmailSubject(subject);
        setEmailBody(body);
        setIsEmailModalOpen(true);
    };
    
    const isValueMissing = (value: any) => {
        return value === null || value === undefined || value === '' || value === 0;
    };

    /**
     * Renders a grid of DataInput components based on a field configuration array.
     */
    const renderFields = <T extends object>(sectionName: keyof ExtractedData, fields: FieldConfig<T>[], sectionData: T) => {
        return fields.map(field => {
            const value = sectionData[field.key];
            const isMissing = isValueMissing(value);
            return (
                <DataInput
                    key={field.key as string}
                    label={field.label}
                    value={value}
                    onChange={(v) => handleChange<T>(sectionName, field.key, v)}
                    type={field.type}
                    suggestions={field.suggestions || []}
                    isMissing={isMissing}
                    tooltip={isMissing ? field.tooltip : ''}
                />
            );
        });
    };

    const handleExportCsv = () => {
        const { riskSummary, anagrafica, propertyDetails, generalLiabilityDetails, productLiabilityDetails, sublimits, dettaglioEdifici } = data;

        const escapeCsvCell = (cellData: any): string => {
            if (cellData === null || cellData === undefined) {
                return '""';
            }
            const stringData = String(cellData);
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return `"${stringData}"`;
        };

        const rows: string[][] = [];

        rows.push(['Risk Summary']);
        rows.push([escapeCsvCell(riskSummary.riskSummary)]);
        rows.push([]); 

        rows.push(['General Information (Anagrafica)']);
        rows.push(['Field', 'Value']);
        anagraficaFields.forEach(field => {
            rows.push([field.label, escapeCsvCell(anagrafica[field.key])]);
        });
        rows.push(['Data Status', escapeCsvCell(anagrafica.dataStatus)]);
        rows.push([]);

        rows.push(['Property Details']);
        rows.push(['Field', 'Value']);
        propertyDetailsFields.forEach(field => {
            rows.push([field.label, escapeCsvCell(propertyDetails[field.key])]);
        });
        rows.push(['Property Notes', escapeCsvCell(propertyDetails.propertyNotes)]);
        rows.push(['Data Status', escapeCsvCell(propertyDetails.dataStatus)]);
        rows.push([]);

        rows.push(['General Liability Details']);
        rows.push(['Field', 'Value']);
        generalLiabilityFields.forEach(field => {
            rows.push([field.label, escapeCsvCell(generalLiabilityDetails[field.key])]);
        });
        rows.push(['General Liability Notes', escapeCsvCell(generalLiabilityDetails.generalLiabilityNotes)]);
        rows.push(['Data Status', escapeCsvCell(generalLiabilityDetails.dataStatus)]);
        rows.push([]);

        rows.push(['Product Liability Details']);
        rows.push(['Field', 'Value']);
        productLiabilityFields.forEach(field => {
            rows.push([field.label, escapeCsvCell(productLiabilityDetails[field.key])]);
        });
        rows.push(['Product Liability Notes', escapeCsvCell(productLiabilityDetails.productLiabilityNotes)]);
        rows.push(['Data Status', escapeCsvCell(productLiabilityDetails.dataStatus)]);
        rows.push([]);

        if (sublimits && sublimits.length > 0) {
            rows.push(['Sublimits']);
            const sublimitHeaders = sublimitFields.map(f => f.label);
            rows.push(sublimitHeaders);
            sublimits.forEach(sublimit => {
                rows.push(sublimitFields.map(field => escapeCsvCell(sublimit[field.key])));
            });
            rows.push([]);
        }

        if (dettaglioEdifici && dettaglioEdifici.length > 0) {
            rows.push(['Building Details (Dettaglio Edifici)']);
            const buildingHeaders = dettaglioEdificiFields.map(f => f.label).concat(['Building Notes']);
            rows.push(buildingHeaders);
            dettaglioEdifici.forEach(building => {
                 const buildingRow = dettaglioEdificiFields.map(field => escapeCsvCell(building[field.key]));
                 buildingRow.push(escapeCsvCell(building.buildingNotes));
                 rows.push(buildingRow);
            });
            rows.push([]);
        }

        const csvContent = rows.map(e => e.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = anagrafica.entityName ? `${anagrafica.entityName.replace(/\s+/g, '_')}_Underwriting_Data.csv` : 'underwriting_data.csv';

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const generatePdfReport = (config: PdfExportConfig) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const { anagrafica, riskSummary, propertyDetails, generalLiabilityDetails, productLiabilityDetails, sublimits, dettaglioEdifici } = data;
    
        // --- 1. UTILITY FUNCTIONS ---
    
        const sanitize = (value: any): string => {
            if (value === null || value === undefined) return "N/A";
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value);
            }
            return "N/A";
        };
    
        const FONT_SIZES = {
            H1: 24, H2: 18, H3: 14, BODY: 11, SMALL: 9, FOOTER: 8,
        };
    
        const COLORS = {
            PRIMARY: '#D2192F', TEXT_DARK: '#2D3748', TEXT_LIGHT: '#4A5568', LINK: '#2B6CB0',
        };
    
        const PAGE_MARGIN = 40;
        let yPos = PAGE_MARGIN;
        let sectionCounter = 1;
    
        const checkPageBreak = (spaceNeeded: number) => {
            const pageSize = doc.internal.pageSize;
            const effectivePageHeight = pageSize.height;
            if (yPos + spaceNeeded > effectivePageHeight - PAGE_MARGIN) {
                doc.addPage();
                yPos = PAGE_MARGIN;
            }
        };
    
        const addFooters = () => {
            const pageCount = doc.internal.getNumberOfPages();
            const entityName = sanitize(anagrafica?.entityName) !== 'N/A' ? sanitize(anagrafica.entityName) : 'Risk Report';
    
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                const pageSize = doc.internal.pageSize;
                const width = pageSize.width;
                const height = pageSize.height;
    
                doc.setFontSize(FONT_SIZES.FOOTER);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, width - PAGE_MARGIN, height - 20, { align: 'right' });
                doc.text(entityName, PAGE_MARGIN, height - 20, { align: 'left' });
            }
        };
    
        // --- 2. COVER PAGE ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(FONT_SIZES.H1 + 4);
        doc.setTextColor(COLORS.TEXT_DARK);
        doc.text("Risk Assessment Report", pageWidth / 2, 150, { align: 'center' });
    
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(FONT_SIZES.H2 - 2);
        doc.setTextColor(COLORS.TEXT_LIGHT);
        doc.text(`Prepared for: ${sanitize(anagrafica?.entityName)}`, pageWidth / 2, 200, { align: 'center' });
        
        let coverMetaY = 250;
        if (config.useCustomCoverPage) {
            doc.setFontSize(FONT_SIZES.BODY);
            if (config.policyNumber) {
                doc.text(`Policy Number: ${sanitize(config.policyNumber)}`, pageWidth / 2, coverMetaY, { align: 'center' });
                coverMetaY += 20;
            }
            if (config.underwriterName) {
                doc.text(`Underwriter: ${sanitize(config.underwriterName)}`, pageWidth / 2, coverMetaY, { align: 'center' });
                coverMetaY += 20;
            }
        }
    
        doc.setFontSize(FONT_SIZES.BODY);
        doc.setTextColor(150);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 100, { align: 'center' });
    
        // --- 3. CONTENT SECTIONS ---
    
        doc.addPage();
        yPos = PAGE_MARGIN;
    
        const renderSectionTitle = (title: string) => {
            checkPageBreak(40);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(FONT_SIZES.H2);
            doc.setTextColor(COLORS.PRIMARY);
            doc.text(`${sectionCounter}. ${title}`, PAGE_MARGIN, yPos);
            yPos += FONT_SIZES.H2 + 10;
            sectionCounter++;
        };
    
        const renderParagraph = (text: string | null) => {
            const sanitizedText = sanitize(text);
            if (sanitizedText === 'N/A' || !sanitizedText.trim()) return;
    
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(FONT_SIZES.BODY);
            doc.setTextColor(COLORS.TEXT_DARK);
            const lines = doc.splitTextToSize(sanitizedText, doc.internal.pageSize.getWidth() - (PAGE_MARGIN * 2));
            checkPageBreak(lines.length * (FONT_SIZES.BODY * 1.15));
            doc.text(lines, PAGE_MARGIN, yPos);
            yPos += lines.length * (FONT_SIZES.BODY * 1.15) + 20;
        };
    
        const renderKeyValueSection = <T extends object>(title: string, fields: FieldConfig<T>[], data: T, notes?: {label: string, value: string | null}) => {
            renderSectionTitle(title);
            const col1X = PAGE_MARGIN;
            const col2X = PAGE_MARGIN + 180;
            const valueWidth = doc.internal.pageSize.getWidth() - col2X - PAGE_MARGIN;
    
            fields.forEach(field => {
                const value = sanitize(data[field.key as keyof T]);
                const valueLines = doc.splitTextToSize(value, valueWidth);
                const spaceNeeded = valueLines.length * (FONT_SIZES.BODY * 1.15) + 5;
                checkPageBreak(spaceNeeded);
    
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(FONT_SIZES.BODY);
                doc.setTextColor(COLORS.TEXT_DARK);
                doc.text(`${field.label}:`, col1X, yPos);
    
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(COLORS.TEXT_LIGHT);
                doc.text(valueLines, col2X, yPos);
                yPos += spaceNeeded;
            });
            
            if (notes) {
                const value = sanitize(notes.value);
                if (value !== 'N/A' && value.trim()) {
                    const valueLines = doc.splitTextToSize(value, valueWidth);
                    const spaceNeeded = valueLines.length * (FONT_SIZES.BODY * 1.15) + 5;
                    checkPageBreak(spaceNeeded);
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(COLORS.TEXT_DARK);
                    doc.text(`${notes.label}:`, col1X, yPos);
    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(COLORS.TEXT_LIGHT);
                    doc.text(valueLines, col2X, yPos);
                    yPos += spaceNeeded;
                }
            }
            yPos += 20;
        };
    
        // --- SECTION RENDERING FLOW ---
    
        if (config.includeRiskSummary) {
            renderSectionTitle("Risk Summary");
            renderParagraph(riskSummary?.riskSummary);
        }
        
        if (config.includeLatestNews && newsData) {
            renderSectionTitle("Latest News");
            
            if (sanitize(newsData.summary) !== 'N/A' && sanitize(newsData.summary).trim()) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(FONT_SIZES.H3);
                doc.setTextColor(COLORS.TEXT_DARK);
                checkPageBreak(30);
                doc.text("Web Summary", PAGE_MARGIN, yPos);
                yPos += FONT_SIZES.H3 + 5;
                renderParagraph(newsData.summary);
            }
            
            const sources = newsData.sources?.groundingChunks;
            if (sources && sources.length > 0) {
                checkPageBreak(30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(FONT_SIZES.H3);
                doc.setTextColor(COLORS.TEXT_DARK);
                doc.text("Recent Mentions", PAGE_MARGIN, yPos);
                yPos += FONT_SIZES.H3 + 10;
                
                sources.filter(chunk => chunk?.web).forEach(chunk => {
                    const title = sanitize(chunk.web.title);
                    const uri = sanitize(chunk.web.uri);
    
                    checkPageBreak(40);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(FONT_SIZES.BODY);
                    doc.setTextColor(COLORS.TEXT_DARK);
                    const titleLines = doc.splitTextToSize(title, doc.internal.pageSize.getWidth() - (PAGE_MARGIN * 2));
                    doc.text(titleLines, PAGE_MARGIN, yPos);
                    yPos += titleLines.length * (FONT_SIZES.BODY * 1.15) + 2;
                    
                    if (uri !== 'N/A' && uri.trim()) {
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(FONT_SIZES.SMALL);
                        doc.setTextColor(COLORS.LINK);
                        doc.textWithLink(uri, PAGE_MARGIN, yPos, { url: uri });
                        yPos += FONT_SIZES.SMALL + 10;
                    }
                });
            }
            yPos += 10;
        }
        
        if (config.includeAnagrafica && anagrafica) {
            renderKeyValueSection("General Information", anagraficaFields, anagrafica);
        }
        if (config.includePropertyDetails && propertyDetails) {
            renderKeyValueSection("Property Details", propertyDetailsFields, propertyDetails, {label: "Property Notes", value: propertyDetails.propertyNotes});
        }
        if (config.includeGeneralLiabilityDetails && generalLiabilityDetails) {
            renderKeyValueSection("General Liability Details", generalLiabilityFields, generalLiabilityDetails, {label: "General Liability Notes", value: generalLiabilityDetails.generalLiabilityNotes});
        }
        if (config.includeProductLiabilityDetails && productLiabilityDetails) {
            renderKeyValueSection("Product Liability Details", productLiabilityFields, productLiabilityDetails, {label: "Product Liability Notes", value: productLiabilityDetails.productLiabilityNotes});
        }
        
        const tableHeadStyles = { fillColor: COLORS.PRIMARY, textColor: '#FFFFFF', fontStyle: 'bold' };
        
        if (config.includeSublimits && sublimits?.length > 0) {
            renderSectionTitle("Sublimits");
            autoTable(doc, {
                startY: yPos,
                head: [sublimitFields.map(f => f.label)],
                body: sublimits.map(row => sublimitFields.map(f => sanitize(row[f.key]))),
                theme: 'grid',
                headStyles: tableHeadStyles,
                didDrawPage: (d) => { yPos = d.cursor?.y ? d.cursor.y + 15 : PAGE_MARGIN; }
            });
            yPos = (doc as any).lastAutoTable.finalY + 20;
        }
        
        if (config.includeBuildingDetails && dettaglioEdifici?.length > 0) {
            doc.addPage(undefined, 'landscape');
            yPos = PAGE_MARGIN;
            renderSectionTitle("Building Details");
            
            const buildingHeaders = dettaglioEdificiFields.map(f => f.label).concat(['Building Notes']);
            const buildingBody = dettaglioEdifici.map(b => {
                const row = dettaglioEdificiFields.map(f => sanitize(b[f.key]));
                row.push(sanitize(b.buildingNotes));
                return row;
            });
            
            autoTable(doc, {
                startY: yPos,
                head: [buildingHeaders],
                body: buildingBody,
                theme: 'grid',
                headStyles: tableHeadStyles,
            });
        }
    
        // --- 4. FINALIZE ---
        addFooters();
        const filename = `${sanitize(anagrafica?.entityName).replace(/\s+/g, '_')}_Risk_Report.pdf`;
        doc.save(filename);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Extracted Data</h1>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={generateEmailForMissingData}
                        className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Generate Email
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                     <button
                        onClick={() => setIsPdfModalOpen(true)}
                        className="flex items-center bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4z" />
                           <path d="M9.5 13a.5.5 0 01-1 0V9.5a.5.5 0 011 0V13z" />
                           <path d="M10 7.5a1 1 0 100-2 1 1 0 000 2z" />
                           <path d="M11.5 13a.5.5 0 01-1 0V9.5a.5.5 0 011 0V13z" />
                        </svg>
                        Export PDF
                    </button>
                </div>
            </div>

            <Section title="Risk Summary" defaultOpen={true}>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.riskSummary.riskSummary}</p>
            </Section>

            <Section title="Latest News" defaultOpen={true}>
                {isNewsLoading ? (
                    <div className="flex items-center text-gray-500 text-sm">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching for latest news about {data.anagrafica.entityName}...</span>
                    </div>
                ) : newsError ? (
                    <div className="flex items-start text-red-700 bg-red-50 p-4 rounded-lg border border-red-200" role="alert">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-bold">Failed to load news</p>
                            <p>{newsError}</p>
                        </div>
                    </div>
                ) : newsData && (newsData.summary || (newsData.sources && newsData.sources.groundingChunks.length > 0)) ? (
                    <div className="space-y-4">
                        {newsData.summary && (
                            <div>
                                <h3 className="text-md font-semibold text-gray-700 mb-2">Web Summary</h3>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{newsData.summary}</p>
                            </div>
                        )}
                        {newsData.sources && newsData.sources.groundingChunks.length > 0 && (
                             <div>
                                <h3 className="text-md font-semibold text-gray-700 mb-2 mt-4">Recent Mentions</h3>
                                <ul className="space-y-3">
                                    {/* FIX: Handle potentially missing uri or title in grounding chunks. */}
                                    {newsData.sources.groundingChunks.filter(chunk => chunk.web?.uri).map((chunk, index) => (
                                      <li key={index} className="flex items-start">
                                        <svg className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <div className="truncate">
                                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline truncate" title={chunk.web.uri}>
                                            {chunk.web.title || chunk.web.uri}
                                          </a>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No summary or recent news could be generated for "{data.anagrafica.entityName}".</p>
                )}
            </Section>

            <Section title="General Information (Anagrafica)" defaultOpen={false}>
                <Grid>
                    {renderFields('anagrafica', anagraficaFields, data.anagrafica)}
                    <DataInput 
                        label="Data Status" 
                        value={data.anagrafica.dataStatus} 
                        onChange={(v) => handleChange<Anagrafica>('anagrafica', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.anagrafica.dataStatus}
                        isMissing={isValueMissing(data.anagrafica.dataStatus)}
                    />
                </Grid>
            </Section>

            <Section title="Property Details" defaultOpen={false}>
                <Grid>
                    {renderFields('propertyDetails', propertyDetailsFields, data.propertyDetails)}
                    <TextareaInput
                        label="Property Notes"
                        value={data.propertyDetails.propertyNotes}
                        onChange={(v) => handleChange<PropertyDetails>('propertyDetails', 'propertyNotes', v)}
                        fullWidth={true}
                        isMissing={isValueMissing(data.propertyDetails.propertyNotes)}
                    />
                    <DataInput 
                        label="Data Status" 
                        value={data.propertyDetails.dataStatus} 
                        onChange={(v) => handleChange<PropertyDetails>('propertyDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.propertyDetails.dataStatus} 
                        isMissing={isValueMissing(data.propertyDetails.dataStatus)}
                    />
                </Grid>
            </Section>

             <Section title="General Liability Details" defaultOpen={false}>
                <Grid>
                    {renderFields('generalLiabilityDetails', generalLiabilityFields, data.generalLiabilityDetails)}
                    <TextareaInput
                        label="General Liability Notes"
                        value={data.generalLiabilityDetails.generalLiabilityNotes}
                        onChange={(v) => handleChange<GeneralLiabilityDetails>('generalLiabilityDetails', 'generalLiabilityNotes', v)}
                        fullWidth={true}
                        isMissing={isValueMissing(data.generalLiabilityDetails.generalLiabilityNotes)}
                    />
                    <DataInput 
                        label="Data Status" 
                        value={data.generalLiabilityDetails.dataStatus} 
                        onChange={(v) => handleChange<GeneralLiabilityDetails>('generalLiabilityDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.generalLiabilityDetails.dataStatus} 
                        isMissing={isValueMissing(data.generalLiabilityDetails.dataStatus)}
                    />
                </Grid>
            </Section>

            <Section title="Product Liability Details" defaultOpen={false}>
                <Grid>
                    {renderFields('productLiabilityDetails', productLiabilityFields, data.productLiabilityDetails)}
                    <TextareaInput
                        label="Product Liability Notes"
                        value={data.productLiabilityDetails.productLiabilityNotes}
                        onChange={(v) => handleChange<ProductLiabilityDetails>('productLiabilityDetails', 'productLiabilityNotes', v)}
                        fullWidth={true}
                        isMissing={isValueMissing(data.productLiabilityDetails.productLiabilityNotes)}
                    />
                    <DataInput 
                        label="Data Status" 
                        value={data.productLiabilityDetails.dataStatus} 
                        onChange={(v) => handleChange<ProductLiabilityDetails>('productLiabilityDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.productLiabilityDetails.dataStatus} 
                        isMissing={isValueMissing(data.productLiabilityDetails.dataStatus)}
                    />
                </Grid>
            </Section>

            {data.sublimits && data.sublimits.length > 0 && (
                <Section title="Sublimits" defaultOpen={false}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sublimit Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (EUR/%)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.sublimits.map((sublimit, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sublimit.riskType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sublimit.coverage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sublimit.sublimitType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sublimit.amountEurPercent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            )}

            {data.dettaglioEdifici && data.dettaglioEdifici.length > 0 && (
                 <Section title="Building Details (Dettaglio Edifici)" defaultOpen={false}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="w-12 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Built</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total RCV (EUR)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.dettaglioEdifici.map((building, index) => (
                                    <React.Fragment key={index}>
                                        <tr onClick={() => setExpandedBuildingIndex(expandedBuildingIndex === index ? null : index)} className="cursor-pointer hover:bg-gray-50">
                                            <td className="px-4 py-4 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${expandedBuildingIndex === index ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{building.buildingName || building.buildingId}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{building.address}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{building.occupancy}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{building.yearBuilt}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{building.totalRcvEur?.toLocaleString('de-DE')}</td>
                                        </tr>
                                        {expandedBuildingIndex === index && (
                                            <tr>
                                                <td colSpan={6} className="p-4 bg-gray-50 border-b border-gray-200">
                                                    <h4 className="text-md font-semibold text-gray-800 mb-4">Edit Building: {building.buildingName || building.buildingId}</h4>
                                                    <Grid>
                                                        {dettaglioEdificiFields.map(field => (
                                                            <DataInput
                                                                key={field.key as string}
                                                                label={field.label}
                                                                value={building[field.key]}
                                                                onChange={(v) => handleArrayChange('dettaglioEdifici', index, field.key, v)}
                                                                type={field.type}
                                                            />
                                                        ))}
                                                        <TextareaInput
                                                            label="Building Notes"
                                                            value={building.buildingNotes}
                                                            onChange={(v) => handleArrayChange('dettaglioEdifici', index, 'buildingNotes', v)}
                                                            fullWidth={true}
                                                        />
                                                    </Grid>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            )}

            <PdfExportModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                onGenerate={generatePdfReport}
            />

            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                subject={emailSubject}
                initialBody={emailBody}
            />
        </>
    );
};