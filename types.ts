
export interface SubOccupancy {
  id: string;
  name: string;
  sanctionFeeRate: number; // Rate per sqm
  requiresDwellingUnits: boolean;
  eligibleForSecurityDeposit: boolean;
}

export interface Occupancy {
  id: string;
  name:string;
  subOccupancies: SubOccupancy[];
}

export interface CalculatedFees {
  landDevelopment: number;
  buildingOperation: number;
  scrutinySubtotal: number;
  sanction: number;
  cwwc: number;
  shelter: number;
  temporaryRetention: number;
  securityDeposit: number;
  purchasableFAR: number;
  eidp: number;
  permitSubtotal: number;
  total: number;
}