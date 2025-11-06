import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, WebNewsData, GroundingMetadata } from '../types';

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

export const extractDataFromDocument = async (base64Data: string, mimeType: string): Promise<ExtractedData> => {
  const ai = getAiClient();
  
  const filePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `You are an expert AI assistant for an insurance underwriting workbench. 
    Your task is to meticulously extract all relevant information from the provided document and structure it into a single, complete JSON object based on the provided schema.
    The document could be a PDF, a Word document, or an email related to an insurance policy.
    
    IMPORTANT: You must differentiate between the insurer (the company providing the insurance, e.g., Generali) and the insured (the client seeking coverage). The 'anagrafica' (General Information) section MUST exclusively contain information about the insured client. Do NOT populate it with details about the insurer.

    - The 'riskSummary' should be a concise overview of the document, highlighting the main insured party, primary risks, and significant limits.
    - All other sections ('anagrafica', 'propertyDetails', etc.) must be populated with the corresponding extracted data.
    
    The liability information is split into two sections: 'generalLiabilityDetails' and 'productLiabilityDetails'. Extract information into the appropriate section. If the document only covers one type of liability (e.g., only General Liability), populate that section and leave the fields in the other section as 'null'.
    For the \`propertyDetails\`, \`generalLiabilityDetails\`, \`productLiabilityDetails\`, and \`dettaglioEdifici\` sections, use the respective "Notes" fields (e.g., \`propertyNotes\`, \`generalLiabilityNotes\`) to summarize any important information that does not fit into the other predefined structured fields.
    If a specific piece of information is not found in the document, you MUST use 'null' as the value for that field. Do not invent information or use placeholders like 0, "N/A", or "Not Found". It is crucial to leave the field as 'null'.
    For fields that are arrays (like 'dettaglioEdifici' or 'sublimits'), return an empty array [] if no items are found.
    Return only the JSON object.`
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [filePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2,
    },
  });
  
  const responseText = response.text;
  
  try {
      const parsed = JSON.parse(responseText);
      
      // FIX: Ensure all top-level objects and arrays exist to prevent runtime errors.
      // This prevents crashes if the model fails to return a complete structure.
      parsed.riskSummary = parsed.riskSummary || { riskSummary: null };
      parsed.anagrafica = parsed.anagrafica || {};
      parsed.propertyDetails = parsed.propertyDetails || {};
      parsed.generalLiabilityDetails = parsed.generalLiabilityDetails || {};
      parsed.productLiabilityDetails = parsed.productLiabilityDetails || {};
      parsed.dettaglioEdifici = Array.isArray(parsed.dettaglioEdifici) ? parsed.dettaglioEdifici : [];
      parsed.sublimits = Array.isArray(parsed.sublimits) ? parsed.sublimits : [];

      return parsed as ExtractedData;
    } catch (e) {
      console.error("Failed to parse extracted JSON:", responseText);
      throw new Error("The AI model returned an invalid data format.");
    }
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