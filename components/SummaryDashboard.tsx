import React from 'react';
import { ExtractedData } from '../types';

interface SummaryDashboardProps {
  data: ExtractedData;
}

// Icon components for the dashboard
const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.75M12 21V3.75m3.75 18V3.75M3 3.75h18M3 8.25h18M3 12.75h18M3 17.25h18" />
    </svg>
);

const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" />
    </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h18" />
    </svg>
);

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    note?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, note }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
        <div className="flex-shrink-0 bg-red-100 text-red-500 rounded-full p-3">
            {icon}
        </div>
        <div>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
            {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
        </div>
    </div>
);


const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
        // Attempt to create a date, works for YYYY-MM-DD
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            // If not, return the original string, it might be in a different format
            return dateString;
        }
        return new Intl.DateTimeFormat('en-GB').format(date);
    } catch (e) {
        return dateString; // Return original if parsing fails
    }
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ data }) => {
    const { anagrafica, propertyDetails, generalLiabilityDetails, productLiabilityDetails } = data;

    // --- Metric Calculations ---
    const totalInsuredValue = (propertyDetails?.tivPdTotalEur ?? 0) + (propertyDetails?.tivBiSumInsEur ?? 0);
    const keyLiabilityLimit = Math.max(generalLiabilityDetails?.rctLimitEur ?? 0, productLiabilityDetails?.rcpLimitEur ?? 0);
    const policyPeriod = `${formatDate(anagrafica?.periodFrom)} - ${formatDate(anagrafica?.periodTo)}`;

    // --- Data Completeness Calculation ---
    const completenessCheck = [
        anagrafica?.entityName,
        anagrafica?.address,
        anagrafica?.industry,
        anagrafica?.annualRevenueAmount,
        anagrafica?.periodFrom,
        anagrafica?.periodTo,
        propertyDetails?.tivPdTotalEur,
        propertyDetails?.tivBiSumInsEur,
        generalLiabilityDetails?.rctLimitEur,
    ];

    const filledFields = completenessCheck.filter(val => val !== null && val !== undefined && val !== '' && val !== 0).length;
    const completenessScore = Math.round((filledFields / completenessCheck.length) * 100);

    const circumference = 2 * Math.PI * 20; // 2 * pi * radius
    const strokeDashoffset = circumference - (completenessScore / 100) * circumference;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Snapshot</h2>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Insured Value (TIV)"
                    value={formatCurrency(totalInsuredValue)}
                    note="Property Damage + Business Interruption"
                    icon={<BuildingOfficeIcon className="h-6 w-6" />}
                />
                <StatCard 
                    title="Key Liability Limit"
                    value={formatCurrency(keyLiabilityLimit)}
                    note="Max of General & Product Liability"
                    icon={<ShieldCheckIcon className="h-6 w-6" />}
                />
                <StatCard 
                    title="Policy Period"
                    value={policyPeriod}
                    note={anagrafica?.riskTypes || 'Risk types'}
                    icon={<CalendarDaysIcon className="h-6 w-6" />}
                />
                {/* Data Completeness Card */}
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                         <svg className="h-14 w-14 transform -rotate-90">
                            <circle className="text-gray-200" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="28" cy="28" />
                            <circle 
                                className="text-red-500" 
                                strokeWidth="4" 
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="20" 
                                cx="28" 
                                cy="28" 
                                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-red-600">
                            {completenessScore}%
                        </span>
                    </div>
                     <div>
                        <dt className="text-sm font-medium text-gray-500 truncate">Data Completeness</dt>
                        <dd className="mt-1 text-base text-gray-900">Key fields populated</dd>
                    </div>
                </div>
            </dl>
        </div>
    );
};
