import React, { useState, useMemo } from 'react';
import { ExtractedData, Anagrafica, PropertyDetails, LiabilityDetails, WebNewsData, Sublimit, DettaglioEdifici } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { EmailModal } from './EmailModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// --- PROPS INTERFACE ---

interface EditableDataFormProps {
  data: ExtractedData;
  onUpdate: (updatedData: ExtractedData) => void;
  newsData: WebNewsData | null;
  isNewsLoading: boolean;
}

// --- HELPER COMPONENTS ---

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
}

const DataInput: React.FC<DataInputProps> = ({ label, value, onChange, type = 'text', suggestions = [], status = null, tooltip = '' }) => {
    if (suggestions.length > 0) {
        return <AutocompleteInput label={label} value={value ?? ''} onChange={onChange} suggestions={suggestions} status={status} tooltip={tooltip} />;
    }
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : parseFloat(e.target.value)) : e.target.value)}
                className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black"
            />
        </div>
    );
};

const TextareaInput: React.FC<{ label: string; value: string | null; onChange: (val: string) => void; rows?: number; fullWidth?: boolean }> = ({ label, value, onChange, rows = 4, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            rows={rows}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white text-black"
        />
    </div>
);


// --- FIELD CONFIGURATIONS ---

type FieldConfig<T> = {
    key: keyof T;
    label: string;
    type?: 'text' | 'number' | 'date';
    suggestions?: string[];
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
    { key: 'tivPdTotalEur', label: 'TIV PD Total (EUR)', type: 'number' },
    { key: 'tivBiSumInsEur', label: 'TIV BI Sum (EUR)', type: 'number' },
    { key: 'ratePerMille', label: 'Rate per Mille', type: 'number' },
    { key: 'catIncluded', label: 'CAT Included' },
    { key: 'buildingsEur', label: 'Buildings (EUR)', type: 'number' },
    { key: 'machineryEur', label: 'Machinery (EUR)', type: 'number' },
    { key: 'stockEur', label: 'Stock (EUR)', type: 'number' },
    { key: 'marginContributionEur', label: 'Margin Contribution (EUR)', type: 'number' },
    { key: 'fireProtectionSummary', label: 'Fire Protection Summary' },
    { key: 'natHazardNotes', label: 'Natural Hazard Notes' },
    { key: 'biPeriodMonths', label: 'BI Period (Months)', type: 'number' },
    { key: 'biNotes', label: 'BI Notes' },
];

const liabilityDetailsFields: FieldConfig<LiabilityDetails>[] = [
    { key: 'rctLimitEur', label: 'RCT Limit (EUR)', type: 'number' },
    { key: 'rcpLimitEur', label: 'RCP Limit (EUR)', type: 'number' },
    { key: 'aggregateLimitEur', label: 'Aggregate Limit (EUR)', type: 'number' },
    { key: 'formRctRco', label: 'Form RCT/RCO', suggestions: ['Loss Occurrence', 'Claims Made'] },
    { key: 'formRcp', label: 'Form RCP', suggestions: ['Claims Made'] },
    { key: 'usaCanCovered', label: 'USA/Canada Covered', suggestions: ['Yes', 'No'] },
    { key: 'recallSublimitEur', label: 'Recall Sublimit (EUR)', type: 'number' },
    { key: 'pollutionAccSublimitEur', label: 'Pollution Sublimit (EUR)', type: 'number' },
    { key: 'interruptionThirdPartySublimitEur', label: '3rd Party Interruption (EUR)', type: 'number' },
    { key: 'dedRct', label: 'Deductible RCT', type: 'number' },
    { key: 'dedRcp', label: 'Deductible RCP', type: 'number' },
    { key: 'extensions', label: 'Extensions' },
    { key: 'exclusions', label: 'Exclusions' },
    { key: 'waivers', label: 'Waivers' },
    { key: 'retroUltrattivita', label: 'Retroactivity' },
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

export const EditableDataForm: React.FC<EditableDataFormProps> = ({ data, onUpdate, newsData, isNewsLoading }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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
            { key: 'liabilityDetails' as const, title: 'Liability Details', fields: liabilityDetailsFields }
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
    
    /**
     * Renders a grid of DataInput components based on a field configuration array.
     */
    const renderFields = <T extends object>(sectionName: keyof ExtractedData, fields: FieldConfig<T>[], sectionData: T) => {
        return fields.map(field => (
             <DataInput
                key={field.key as string}
                label={field.label}
                value={sectionData[field.key]}
                onChange={(v) => handleChange<T>(sectionName, field.key, v)}
                type={field.type}
                // FIX: Ensure `suggestions` is always an array to prevent type errors.
                suggestions={field.suggestions || []}
            />
        ));
    };

    const handleExportCsv = () => {
        const { riskSummary, anagrafica, propertyDetails, liabilityDetails, sublimits, dettaglioEdifici } = data;

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

        rows.push(['Liability Details']);
        rows.push(['Field', 'Value']);
        liabilityDetailsFields.forEach(field => {
            rows.push([field.label, escapeCsvCell(liabilityDetails[field.key])]);
        });
        rows.push(['Liability Notes', escapeCsvCell(liabilityDetails.liabilityNotes)]);
        rows.push(['Data Status', escapeCsvCell(liabilityDetails.dataStatus)]);
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
    
    const handleExportPdf = () => {
        const doc = new jsPDF();
        const { anagrafica, riskSummary, propertyDetails, liabilityDetails, sublimits, dettaglioEdifici } = data;
        
        // FIX: Robustly handle entityName to ensure it's a valid string for PDF generation.
        const entityName = (typeof anagrafica.entityName === 'string' && anagrafica.entityName.trim()) 
            ? anagrafica.entityName 
            : "N/A";
    
        const margin = 15;
        let y = margin;
    
        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                const pageInfo = (doc.internal as any).pages[i];
                if (!pageInfo) continue;

                const pageWidth = pageInfo.width;
                const pageHeight = pageInfo.height;

                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth - margin,
                    pageHeight - 10,
                    { align: 'right' }
                );
                doc.text(
                    `Risk Report for ${entityName}`,
                    margin,
                    pageHeight - 10
                );
            }
        };
    
        const checkPageBreak = (spaceNeeded: number) => {
            const currentPageHeight = doc.internal.pageSize.height;
            if (y + spaceNeeded > currentPageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };
        
        // --- Title Page ---
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text("Risk Assessment Report", doc.internal.pageSize.width / 2, 80, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text(`Prepared for: ${entityName}`, doc.internal.pageSize.width / 2, 100, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, 110, { align: 'center' });
    
        doc.addPage();
        y = margin;
    
        // --- Risk Summary Section ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);
        doc.text("1. Risk Summary", margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        // FIX: Ensure summary is a valid string before passing to jsPDF to prevent errors from non-string truthy values (e.g., {}).
        const summaryText = (typeof riskSummary.riskSummary === 'string' && riskSummary.riskSummary.trim())
            ? riskSummary.riskSummary
            : 'No summary available.';
        const summaryLines = doc.splitTextToSize(summaryText, doc.internal.pageSize.width - margin * 2);
        checkPageBreak(summaryLines.length * 5 + 10);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 10;

        // --- Latest News Section ---
        if (newsData && (newsData.summary || (newsData.sources && newsData.sources.groundingChunks.length > 0))) {
            checkPageBreak(20);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text("2. Latest News", margin, y);
            y += 10;
        
            if (newsData.summary && typeof newsData.summary === 'string' && newsData.summary.trim()) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(60);
                doc.text("Web Summary", margin, y);
                y += 7;
        
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80);
                const newsSummaryLines = doc.splitTextToSize(newsData.summary, doc.internal.pageSize.width - margin * 2);
                checkPageBreak(newsSummaryLines.length * 5 + 10);
                doc.text(newsSummaryLines, margin, y);
                y += newsSummaryLines.length * 5 + 10;
            }
        
            if (newsData.sources && newsData.sources.groundingChunks.length > 0) {
                checkPageBreak(17);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(60);
                doc.text("Recent Mentions", margin, y);
                y += 7;
        
                newsData.sources.groundingChunks.forEach(chunk => {
                    // FIX: Ensure title is a valid string to prevent errors from non-string truthy values.
                    const rawTitle = chunk.web?.title;
                    const title = (typeof rawTitle === 'string' && rawTitle.trim()) ? rawTitle : 'No title provided';
                    const uri = chunk.web?.uri;
                    
                    const titleLines = doc.splitTextToSize(title, doc.internal.pageSize.width - margin * 2);
                    checkPageBreak(titleLines.length * 5 + (uri ? 8 : 2)); 

                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40);
                    doc.text(titleLines, margin, y);
                    y += titleLines.length * 5;

                    if (uri) {
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'italic');
                        doc.setTextColor(0, 102, 204);
                        doc.textWithLink(uri, margin, y, { url: uri });
                        y += 7;
                    } else {
                        y += 2; // Smaller padding if no URI
                    }
                });
            }
            y += 5; // Extra padding after section
        }
    
        // --- Helper for Key-Value Sections ---
        const addKeyValueSection = <T extends object>(title: string, fields: FieldConfig<T>[], sectionData: T, notes?: {label: string, value: string | null}) => {
            checkPageBreak(20);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text(title, margin, y);
            y += 10;
    
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80);
    
            const col1X = margin;
            const col2X = margin + 70;
    
            fields.forEach(field => {
                const value = sectionData[field.key as keyof T];
                const displayValue = (value === null || value === undefined) ? 'N/A' : String(value);
                const valueLines = doc.splitTextToSize(displayValue, doc.internal.pageSize.width - col2X - margin);
    
                const spaceNeeded = valueLines.length * 5;
                checkPageBreak(spaceNeeded);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${field.label}:`, col1X, y);
                
                doc.setFont('helvetica', 'normal');
                doc.text(valueLines, col2X, y);
    
                y += spaceNeeded + 2; // Add a little padding
            });
    
            // FIX: Ensure notes value is a valid string before processing.
            if (notes && typeof notes.value === 'string' && notes.value.trim()) {
                const notesLines = doc.splitTextToSize(notes.value, doc.internal.pageSize.width - col2X - margin);
                const spaceNeeded = notesLines.length * 5;
                checkPageBreak(spaceNeeded);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${notes.label}:`, col1X, y);
                
                doc.setFont('helvetica', 'normal');
                doc.text(notesLines, col2X, y);
    
                y += spaceNeeded + 2;
            }
    
            y += 10; // Extra padding after section
        };
        
        // --- Add Sections using the helper ---
        addKeyValueSection('3. General Information', anagraficaFields, anagrafica);
        addKeyValueSection('4. Property Details', propertyDetailsFields, propertyDetails, {label: 'Property Notes', value: propertyDetails.propertyNotes});
        addKeyValueSection('5. Liability Details', liabilityDetailsFields, liabilityDetails, {label: 'Liability Notes', value: liabilityDetails.liabilityNotes});
    
        // --- Tables ---
        const tableTheme = 'grid';
        const tableHeadStyles = { fillColor: [210, 25, 47] }; // Red color from theme

        if (sublimits && sublimits.length > 0) {
            checkPageBreak(30);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text("6. Sublimits", margin, y);
            y += 10;
            
            autoTable(doc, {
                startY: y,
                head: [sublimitFields.map(f => f.label)],
                body: sublimits.map(row => sublimitFields.map(f => (row[f.key] === null || row[f.key] === undefined) ? 'N/A' : String(row[f.key]))),
                theme: tableTheme,
                headStyles: tableHeadStyles,
            });
            y = (doc as any).lastAutoTable.finalY + 15;
        }
        
        if (dettaglioEdifici && dettaglioEdifici.length > 0) {
            doc.addPage(undefined, 'landscape');
            y = margin;

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text("7. Building Details", margin, y);
            y += 10;
    
            const buildingHeaders = dettaglioEdificiFields.map(f => f.label).concat(['Building Notes']);
            const buildingBody = dettaglioEdifici.map(building => {
                const row = dettaglioEdificiFields.map(field => (building[field.key] === null || building[field.key] === undefined) ? 'N/A' : String(building[field.key]));
                const notesValue = building.buildingNotes;
                // FIX: Robustly handle non-string values for notes to prevent PDF generation errors.
                const notesDisplay = (typeof notesValue === 'string' && notesValue.trim()) ? notesValue : 'N/A';
                row.push(notesDisplay);
                return row;
            });
            
            autoTable(doc, {
                startY: y,
                head: [buildingHeaders],
                body: buildingBody,
                theme: tableTheme,
                headStyles: tableHeadStyles,
            });
        }
    
        // --- Finalize ---
        addFooter();
        doc.save(`${entityName.replace(/\s+/g, '_')}_Risk_Report.pdf`);
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
                        onClick={handleExportPdf}
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
                                    {newsData.sources.groundingChunks.map((chunk, index) => (
                                      <li key={index} className="flex items-start">
                                        <svg className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <div>
                                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline">
                                            {chunk.web.title}
                                          </a>
                                           <p className="text-xs text-gray-500 truncate">{chunk.web.uri}</p>
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
                    />
                    <DataInput 
                        label="Data Status" 
                        value={data.propertyDetails.dataStatus} 
                        onChange={(v) => handleChange<PropertyDetails>('propertyDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.propertyDetails.dataStatus} 
                    />
                </Grid>
            </Section>

             <Section title="Liability Details" defaultOpen={false}>
                <Grid>
                    {renderFields('liabilityDetails', liabilityDetailsFields, data.liabilityDetails)}
                    <TextareaInput
                        label="Liability Notes"
                        value={data.liabilityDetails.liabilityNotes}
                        onChange={(v) => handleChange<LiabilityDetails>('liabilityDetails', 'liabilityNotes', v)}
                        fullWidth={true}
                    />
                    <DataInput 
                        label="Data Status" 
                        value={data.liabilityDetails.dataStatus} 
                        onChange={(v) => handleChange<LiabilityDetails>('liabilityDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.liabilityDetails.dataStatus} 
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

            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                subject={emailSubject}
                initialBody={emailBody}
            />
        </>
    );
};