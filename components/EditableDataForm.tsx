import React, { useState, useMemo } from 'react';
import { ExtractedData, Anagrafica, PropertyDetails, LiabilityDetails, WebNewsData, Sublimit, DettaglioEdifici } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { EmailModal } from './EmailModal';

// --- PROPS INTERFACE ---

interface EditableDataFormProps {
  data: ExtractedData;
  onUpdate: (updatedData: ExtractedData) => void;
  newsData: WebNewsData | null;
  isNewsLoading: boolean;
}

// --- HELPER COMPONENTS ---

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h2>
        {children}
    </div>
);

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


// --- MAIN COMPONENT ---

export const EditableDataForm: React.FC<EditableDataFormProps> = ({ data, onUpdate, newsData, isNewsLoading }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

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

    /**
     * Scans the form data for null or empty values and generates a formatted email draft
     * to request the missing information from the broker.
     */
    const generateEmailForMissingData = () => {
        const missingFields: string[] = [];
        const sections: (keyof ExtractedData)[] = ['anagrafica', 'propertyDetails', 'liabilityDetails'];

        sections.forEach(sectionKey => {
            const sectionData = data[sectionKey as 'anagrafica' | 'propertyDetails' | 'liabilityDetails'];
            if(sectionData) {
                 Object.entries(sectionData).forEach(([key, value]) => {
                    if (value === null || value === '') {
                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        missingFields.push(`- ${formattedKey} (${sectionKey})`);
                    }
                });
            }
        });

        const subject = `Request for Information: Policy for ${data.anagrafica.entityName || 'N/A'}`;
        const body = `Dear Broker,\n\nThank you for sending over the documentation. To proceed with the underwriting process for ${data.anagrafica.entityName || 'your client'}, we kindly request the following missing information:\n\n${missingFields.join('\n')}\n\nPlease provide these details at your earliest convenience.\n\nBest regards,\nYour Underwriting Team`;
        
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

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Extracted Data</h1>
                 <button 
                    onClick={generateEmailForMissingData}
                    className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Email for Missing Data
                </button>
            </div>

            <Section title="Risk Summary">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.riskSummary.riskSummary}</p>
            </Section>

            <Section title="Latest News">
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

            <Section title="General Information (Anagrafica)">
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

            <Section title="Property Details">
                <Grid>
                    {renderFields('propertyDetails', propertyDetailsFields, data.propertyDetails)}
                    <DataInput 
                        label="Data Status" 
                        value={data.propertyDetails.dataStatus} 
                        onChange={(v) => handleChange<PropertyDetails>('propertyDetails', 'dataStatus', v)} 
                        suggestions={['ok', 'partial', 'ambiguous']} 
                        status={data.propertyDetails.dataStatus} 
                    />
                </Grid>
            </Section>

             <Section title="Liability Details">
                <Grid>
                    {renderFields('liabilityDetails', liabilityDetailsFields, data.liabilityDetails)}
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
                <Section title="Sublimits">
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
                 <Section title="Building Details (Dettaglio Edifici)">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Built</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total RCV (EUR)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.dettaglioEdifici.map((building, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{building.buildingName || building.buildingId}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{building.address}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{building.occupancy}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{building.yearBuilt}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{building.totalRcvEur?.toLocaleString('de-DE')}</td>
                                    </tr>
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