export interface EcoAnalysis {
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: string;
  carbonScore: number;
  carbonExplanation: string;
  waterUsage: string;
  waterScore: number;
  waterExplanation: string;
  packagingScore: number;
  packagingExplanation: string;
  repairabilityLabel: string;
  repairabilityScore: number;
  repairabilityExplanation: string;
  recyclabilityLabel: string;
  recyclabilityScore: number;
  recyclabilityExplanation: string;
  energyUseLabel: string;
  energyScore: number;
  energyExplanation: string;
  concerns: string[];
  funFact: string;
  alternatives: {
    name: string;
    reason: string;
    ecoScore: number;
    url?: string;
    carbonScore: number;
    waterScore: number;
    packagingScore: number;
    repairabilityScore: number;
    recyclabilityScore: number;
    energyScore: number;
  }[];
  citations: {
    title: string;
    url: string;
  }[];
  verdict: string;
  isProduct?: boolean;
  rejectionReason?: string;
}

export interface Product {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
}

export interface AppStats {
  productsChecked: number;
  co2Saved: number;
  productsHistory: {
    name: string;
    brand: string;
    grade: string;
    ecoScore: number;
    timestamp: number;
    analysis?: EcoAnalysis;
    product?: Product;
  }[];
}
