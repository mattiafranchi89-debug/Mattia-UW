
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, WebNewsData, GroundingMetadata, RiskSummary, Anagrafica, PropertyDetails, GeneralLiabilityDetails, ProductLiabilityDetails, Sublimit, DettaglioEdifici } from '../types';

// Fix: Define type-safe default empty objects to prevent type errors during data assembly.
const emptyAnagrafica: Anagrafica = {
  entityName: null, altNames: null, type: null, industry: null, country: null, city: null, address: null,
  topLocation: null, vat: null, taxCode: null, website: null, brokerName: null, brokerCompany: null,
  periodFrom: null, periodTo: null, riskTypes: null, territorialScope: null, lossHistory5y: null,
  annualRevenueAmount: null, annualRevenueYear: null, payrollAmount: null, payrollYear: null, headcount: null, dataStatus: null
};
const emptyPropertyDetails: PropertyDetails = {
    entityName: null, topLocation: null, tivPdTotalEur: null, tivBiSumInsEur: null, ratePerMille: null, catIncluded: null,
    buildingsEur: null, machineryEur: null, stockEur: null, marginContributionEur: null, fireProtectionSummary: null,
    natHazardNotes: null, biPeriodMonths: null, biNotes: null, propertyNotes: null, dataStatus: null
};
const emptyGeneralLiabilityDetails: GeneralLiabilityDetails = {
    rctLimitEur: null, aggregateLimitEur: null, formRctRco: null, usaCanCovered: null, dedRct: null,
    extensions: null, exclusions: null, waivers: null, retroUltrattivita: null, generalLiabilityNotes: null, dataStatus: null
};
const emptyProductLiabilityDetails: ProductLiabilityDetails = {
    rcpLimitEur: null, formRcp: null, recallSublimitEur: null, pollutionAccSublimitEur: null,
    interruptionThirdPartySublimitEur: null, dedRcp: null, productLiabilityNotes: null, dataStatus: null
};

/**
 * Creates and returns a GoogleGenAI client instance.
 * Throws an error if the API key is not available in the environment variables,
 * ensuring that the app can handle the error gracefully instead of crashing.
 */
const getAiClient = (): GoogleGenAI => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Please ensure it is set up in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    riskSummary: {
      type: Type.OBJECT,
      properties: {
        riskSummary: { type: Type.STRING, description: "A concise summary of the key risks, coverages, and insured entity from the document." }
      },
    },
    anagrafica: {
      type: Type.OBJECT,
      properties: {
        entityName: { type: Type.STRING, description: "Entity's legal name." },
        altNames: { type: Type.STRING, description: "Alternative or former names." },
        type: { type: Type.STRING, description: "Role (e.g., Policyholder, Insured, Owner)." },
        industry: { type: Type.STRING, description: "Business Activity / Industry Sector." },
        country: { type: Type.STRING, description: "Country." },
        city: { type: Type.STRING, description: "City." },
        address: { type: Type.STRING, description: "Full address." },
        topLocation: { type: Type.STRING, description: "Main risk location." },
        vat: { type: Type.STRING, description: "VAT number." },
        taxCode: { type: Type.STRING, description: "Tax Code." },
        website: { type: Type.STRING, description: "Website." },
        brokerName: { type: Type.STRING, description: "Broker name." },
        brokerCompany: { type: Type.STRING, description: "Brokerage company." },
        periodFrom: { type: Type.STRING, description: "Coverage start date (YYYY-MM-DD format)." },
        periodTo: { type: Type.STRING, description: "Coverage end date (YYYY-MM-DD format)." },
        riskTypes: { type: Type.STRING, description: "Risk types (Property, Liability, Cyber, etc.)." },
        territorialScope: { type: Type.STRING, description: "Territorial scope." },
        lossHistory5y: { type: Type.STRING, description: "Loss history for the last 5 years." },
        annualRevenueAmount: { type: Type.NUMBER, description: "Annual revenue amount." },
        annualRevenueYear: { type: Type.INTEGER, description: "Year of revenue." },
        payrollAmount: { type: Type.NUMBER, description: "Payroll amount." },
        payrollYear: { type: Type.INTEGER, description: "Year of payroll." },
        headcount: { type: Type.INTEGER, description: "Number of employees." },
        dataStatus: { type: Type.STRING, description: "Data quality status (ok, partial, ambiguous)." },
      },
    },
    propertyDetails: {
      type: Type.OBJECT,
      properties: {
        entityName: { type: Type.STRING },
        topLocation: { type: Type.STRING },
        tivPdTotalEur: { type: Type.NUMBER, description: "Sum insured for Property Damage." },
        tivBiSumInsEur: { type: Type.NUMBER, description: "Sum insured for Business Interruption." },
        ratePerMille: { type: Type.NUMBER, description: "Gross rate requested." },
        catIncluded: { type: Type.STRING, description: "Catastrophic risks inclusion." },
        buildingsEur: { type: Type.NUMBER, description: "Buildings value in EUR." },
        machineryEur: { type: Type.NUMBER, description: "Machinery value in EUR." },
        stockEur: { type: Type.NUMBER, description: "Stock value in EUR." },
        marginContributionEur: { type: Type.NUMBER, description: "Contribution margin in EUR." },
        fireProtectionSummary: { type: Type.STRING, description: "Fire protection summary." },
        natHazardNotes: { type: Type.STRING, description: "Natural hazard notes." },
        biPeriodMonths: { type: Type.INTEGER, description: "BI indemnity period in months." },
        biNotes: { type: Type.STRING, description: "BI details." },
        propertyNotes: { type: Type.STRING, description: "A summary of any other relevant property details not captured in other fields." },
        dataStatus: { type: Type.STRING, description: "Data quality status." },
      },
    },
    generalLiabilityDetails: {
      type: Type.OBJECT,
      properties: {
        rctLimitEur: { type: Type.NUMBER, description: "General Liability Limit." },
        aggregateLimitEur: { type: Type.NUMBER, description: "Annual aggregate limit." },
        formRctRco: { type: Type.STRING, description: "Form (Loss Occurrence/Claims Made) for GL." },
        usaCanCovered: { type: Type.STRING, description: "USA/Canada Coverage (Yes/No)." },
        dedRct: { type: Type.NUMBER, description: "GL Deductible." },
        extensions: { type: Type.STRING, description: "Coverage extensions." },
        exclusions: { type: Type.STRING, description: "Main exclusions." },
        waivers: { type: Type.STRING, description: "Waivers of recourse." },
        retroUltrattivita: { type: Type.STRING, description: "Retroactivity / Extended Reporting." },
        generalLiabilityNotes: { type: Type.STRING, description: "A summary of any other relevant general liability details not captured in other fields." },
        dataStatus: { type: Type.STRING, description: "Data quality status." },
      },
    },
    productLiabilityDetails: {
      type: Type.OBJECT,
      properties: {
        rcpLimitEur: { type: Type.NUMBER, description: "Product Liability Limit." },
        formRcp: { type: Type.STRING, description: "Form (Claims Made) for PL." },
        recallSublimitEur: { type: Type.NUMBER, description: "Product Recall Sublimit." },
        pollutionAccSublimitEur: { type: Type.NUMBER, description: "Accidental Pollution Sublimit." },
        interruptionThirdPartySublimitEur: { type: Type.NUMBER, description: "Third-party interruption sublimit." },
        dedRcp: { type: Type.NUMBER, description: "PL Deductible." },
        productLiabilityNotes: { type: Type.STRING, description: "A summary of any other relevant product liability details not captured in other fields." },
        dataStatus: { type: Type.STRING, description: "Data quality status." },
      },
    },
    sublimits: {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
            riskType: { type: Type.STRING, description: "Risk Type (GL/RCO/PL/Property)." },
            coverage: { type: Type.STRING, description: "Coverage Type." },
            sublimitType: { type: Type.STRING, description: "Sublimit Type (amount/percent)." },
            amountEurPercent: { type: Type.STRING, description: "Amount EUR/%." },
        },
      }
    },
    dettaglioEdifici: {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
            entityName: { type: Type.STRING },
            buildingId: { type: Type.STRING, description: "Building ID." },
            buildingName: { type: Type.STRING, description: "Building Name." },
            address: { type: Type.STRING, description: "Building Address." },
            occupancy: { type: Type.STRING, description: "Occupancy (production, warehouse, offices)." },
            floorAreaSm: { type: Type.NUMBER, description: "Floor Area in sqm." },
            buildingRcvEur: { type: Type.NUMBER, description: "Building Replacement Cost Value." },
            contentsRcvEur: { type: Type.NUMBER, description: "Contents Replacement Cost Value." },
            totalRcvEur: { type: Type.NUMBER, description: "Total Replacement Cost Value." },
            yearBuilt: { type: Type.INTEGER, description: "Year Built." },
            manualFireAlarmPercent: { type: Type.NUMBER, description: "% presence of manual fire alarm." },
            automaticFireAlarmPercent: { type: Type.NUMBER, description: "% presence of automatic fire alarm." },
            sprinklersPercent: { type: Type.NUMBER, description: "% presence of sprinklers." },
            roofMaterial: { type: Type.STRING, description: "Roof Material." },
            buildingNotes: { type: Type.STRING, description: "A summary of any other relevant building details not captured in other fields." },
        },
      }
    },
  },
};

/**
 * A generic function to extract a specific section of data from documents.
 * It makes a single call to the AI model with a focused prompt and schema.
 * @param ai - The GoogleGenAI client instance.
 * @param fileParts - The document files to be processed.
 * @param sectionPrompt - The specific prompt for the section to be extracted.
 * @param schema - The JSON schema for the section.
 * @param defaultValue - A default value to return in case of an error.
 * @returns The extracted data for the section or the default value.
 */
async function extractSection<T>(
  ai: GoogleGenAI,
  fileParts: { inlineData: { data: string; mimeType: string; }; }[],
  sectionPrompt: string,
  schema: any,
  defaultValue: T
): Promise<T> {
  try {
    const textPart = { text: sectionPrompt };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...fileParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });
    const responseText = response.text;
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error(`Failed to extract section. Error: ${error instanceof Error ? error.message : String(error)}`);
    return defaultValue;
  }
}

export const extractDataFromDocument = async (files: { base64Data: string; mimeType: string }[]): Promise<ExtractedData> => {
    const ai = getAiClient();
    
    const fileParts = files.map(file => ({
        inlineData: {
        data: file.base64Data,
        mimeType: file.mimeType,
        },
    }));

    const basePrompt = `You are an expert AI assistant for an insurance underwriting workbench. 
    Your task is to meticulously extract and consolidate all relevant information from the provided documents.
    The documents could be a mix of PDFs, Word documents, or emails related to the same insurance policy or client.
    If information for the same field is present in multiple documents, prioritize the most recent or comprehensive data.
    If a specific piece of information is not found, you MUST use 'null' as the value for that field. Do not invent information.
    For fields that are arrays (like 'dettaglioEdifici' or 'sublimits'), return an empty array [] if no items are found.
    Return only the JSON object based on the provided schema.

    Now, focus ONLY on extracting the data for the following section:`;
    
    // Define specific prompts for each section
    const riskSummaryPrompt = `${basePrompt} Risk Summary. This should be a concise overview highlighting the main insured party, primary risks, and significant limits.`;
    const anagraficaPrompt = `${basePrompt} General Information (Anagrafica). IMPORTANT: This section MUST exclusively contain information about the insured client. Do NOT populate it with details about the insurer.`;
    const propertyDetailsPrompt = `${basePrompt} Property Details. Use the 'propertyNotes' field to summarize any important information that does not fit into the other predefined structured fields.`;
    const generalLiabilityPrompt = `${basePrompt} General Liability Details. Use the 'generalLiabilityNotes' field for relevant information not captured elsewhere.`;
    const productLiabilityPrompt = `${basePrompt} Product Liability Details. Use the 'productLiabilityNotes' field for relevant information not captured elsewhere.`;
    const sublimitsPrompt = `${basePrompt} Sublimits.`;
    const buildingDetailsPrompt = `${basePrompt} Building Details (Dettaglio Edifici). Use the 'buildingNotes' field for relevant details.`;

    // Define schemas for each section, wrapping them in their top-level key
    const schemas = {
        riskSummary: { type: Type.OBJECT, properties: { riskSummary: responseSchema.properties.riskSummary } },
        anagrafica: { type: Type.OBJECT, properties: { anagrafica: responseSchema.properties.anagrafica } },
        propertyDetails: { type: Type.OBJECT, properties: { propertyDetails: responseSchema.properties.propertyDetails } },
        generalLiabilityDetails: { type: Type.OBJECT, properties: { generalLiabilityDetails: responseSchema.properties.generalLiabilityDetails } },
        productLiabilityDetails: { type: Type.OBJECT, properties: { productLiabilityDetails: responseSchema.properties.productLiabilityDetails } },
        sublimits: { type: Type.OBJECT, properties: { sublimits: responseSchema.properties.sublimits } },
        dettaglioEdifici: { type: Type.OBJECT, properties: { dettaglioEdifici: responseSchema.properties.dettaglioEdifici } },
    };

    // Extract all sections in parallel
    const [
        riskSummaryResult,
        anagraficaResult,
        propertyDetailsResult,
        generalLiabilityDetailsResult,
        productLiabilityDetailsResult,
        sublimitsResult,
        dettaglioEdificiResult,
    ] = await Promise.all([
        extractSection<{ riskSummary: RiskSummary }>(ai, fileParts, riskSummaryPrompt, schemas.riskSummary, { riskSummary: { riskSummary: null } }),
        // Fix: Use type-safe empty objects as default values.
        extractSection<{ anagrafica: Anagrafica }>(ai, fileParts, anagraficaPrompt, schemas.anagrafica, { anagrafica: emptyAnagrafica }),
        extractSection<{ propertyDetails: PropertyDetails }>(ai, fileParts, propertyDetailsPrompt, schemas.propertyDetails, { propertyDetails: emptyPropertyDetails }),
        extractSection<{ generalLiabilityDetails: GeneralLiabilityDetails }>(ai, fileParts, generalLiabilityPrompt, schemas.generalLiabilityDetails, { generalLiabilityDetails: emptyGeneralLiabilityDetails }),
        extractSection<{ productLiabilityDetails: ProductLiabilityDetails }>(ai, fileParts, productLiabilityPrompt, schemas.productLiabilityDetails, { productLiabilityDetails: emptyProductLiabilityDetails }),
        extractSection<{ sublimits: Sublimit[] }>(ai, fileParts, sublimitsPrompt, schemas.sublimits, { sublimits: [] }),
        extractSection<{ dettaglioEdifici: DettaglioEdifici[] }>(ai, fileParts, buildingDetailsPrompt, schemas.dettaglioEdifici, { dettaglioEdifici: [] }),
    ]);

    // Assemble the final data object, ensuring all parts are defined
    const extractedData: ExtractedData = {
        riskSummary: riskSummaryResult.riskSummary || { riskSummary: null },
        // Fix: Use type-safe empty objects as fallbacks instead of `{}`.
        anagrafica: anagraficaResult.anagrafica || emptyAnagrafica,
        propertyDetails: propertyDetailsResult.propertyDetails || emptyPropertyDetails,
        generalLiabilityDetails: generalLiabilityDetailsResult.generalLiabilityDetails || emptyGeneralLiabilityDetails,
        productLiabilityDetails: productLiabilityDetailsResult.productLiabilityDetails || emptyProductLiabilityDetails,
        sublimits: sublimitsResult.sublimits || [],
        dettaglioEdifici: dettaglioEdificiResult.dettaglioEdifici || [],
    };
    
    return extractedData;
};

export const fetchWebNews = async (entityName: string): Promise<WebNewsData | null> => {
  if (!entityName) return null;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the latest news and relevant web information about "${entityName}".`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const summary = response.text ?? null;
    const sources: GroundingMetadata | null = response.candidates?.[0]?.groundingMetadata ?? null;

    // FIX: Defensively handle cases where `sources` exists but `groundingChunks` is not an array.
    if (sources && !Array.isArray(sources.groundingChunks)) {
      sources.groundingChunks = [];
    }
    
    const hasNoSources = !sources || sources.groundingChunks.length === 0;

    // If there's no summary and no sources, return null.
    if (!summary && hasNoSources) {
        return null;
    }

    return { summary, sources };
  } catch (error) {
    console.error(`Failed to fetch news for ${entityName}:`, error);
    throw error;
  }
};
