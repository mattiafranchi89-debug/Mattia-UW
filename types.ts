// types.ts

export interface Anagrafica {
  entityName: string | null;
  altNames: string | null;
  type: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  topLocation: string | null;
  vat: string | null;
  taxCode: string | null;
  website: string | null;
  brokerName: string | null;
  brokerCompany: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  riskTypes: string | null;
  territorialScope: string | null;
  lossHistory5y: string | null;
  annualRevenueAmount: number | null;
  annualRevenueYear: number | null;
  payrollAmount: number | null;
  payrollYear: number | null;
  headcount: number | null;
  dataStatus: string | null;
}

export interface PropertyDetails {
  entityName: string | null;
  topLocation: string | null;
  tivPdTotalEur: number | null;
  tivBiSumInsEur: number | null;
  ratePerMille: number | null;
  catIncluded: string | null;
  buildingsEur: number | null;
  machineryEur: number | null;
  stockEur: number | null;
  marginContributionEur: number | null;
  fireProtectionSummary: string | null;
  natHazardNotes: string | null;
  biPeriodMonths: number | null;
  biNotes: string | null;
  propertyNotes: string | null;
  dataStatus: string | null;
}

export interface LiabilityDetails {
  rctLimitEur: number | null;
  rcpLimitEur: number | null;
  aggregateLimitEur: number | null;
  formRctRco: string | null;
  formRcp: string | null;
  usaCanCovered: string | null;
  recallSublimitEur: number | null;
  pollutionAccSublimitEur: number | null;
  interruptionThirdPartySublimitEur: number | null;
  dedRct: number | null;
  dedRcp: number | null;
  extensions: string | null;
  exclusions: string | null;
  waivers: string | null;
  retroUltrattivita: string | null;
  liabilityNotes: string | null;
  dataStatus: string | null;
}

export interface Sublimit {
  riskType: string | null;
  coverage: string | null;
  sublimitType: string | null;
  amountEurPercent: string | null;
}

export interface DettaglioEdifici {
  entityName: string | null;
  buildingId: string | null;
  buildingName: string | null;
  address: string | null;
  occupancy: string | null;
  floorAreaSm: number | null;
  buildingRcvEur: number | null;
  contentsRcvEur: number | null;
  totalRcvEur: number | null;
  yearBuilt: number | null;
  manualFireAlarmPercent: number | null;
  automaticFireAlarmPercent: number | null;
  sprinklersPercent: number | null;
  roofMaterial: string | null;
  buildingNotes: string | null;
}

export interface RiskSummary {
  riskSummary: string | null;
}

export interface WebGrounding {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebGrounding;
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface WebNewsData {
  summary: string | null;
  sources: GroundingMetadata | null;
}

export interface ExtractedData {
  riskSummary: RiskSummary;
  anagrafica: Anagrafica;
  propertyDetails: PropertyDetails;
  liabilityDetails: LiabilityDetails;
  sublimits: Sublimit[];
  dettaglioEdifici: DettaglioEdifici[];
}