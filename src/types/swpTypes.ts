export interface UnitLot {
  purchaseDateMonth: number; // Month index when bought (0 = start)
  units: number;
  costPerUnit: number;
}

export interface SWPInput {
  initialCorpus: number;
  initialUnitNAV: number;
  expectedAnnualReturn: number; // e.g., 0.10 for 10%
  expectedAnnualInflation: number; // e.g., 0.06 for 6%
  initialMonthlyWithdrawal: number; // In today's terms
  swpDurationYears: number;
  
  // Tax Parameters
  annualLTCGExemption: number; // Default 125000 (INR)
  ltcgTaxRate: number; // Default 0.125 (12.5%)
  stcgTaxRate: number; // Default 0.20 (20%)
  
  // Currency settings
  baseCurrency: string; // e.g., 'INR'
  targetExpenseCurrency?: string; // e.g., 'HKD'
  exchangeRateBaseToTarget?: number; // e.g., 1 HKD = 10.8 INR
}

export interface MonthlySWPResult {
  month: number;
  grossWithdrawal: number;
  taxPaid: number;
  netWithdrawal: number;
  endingCorpusValue: number;
  remainingUnits: number;
  currentNAV: number;
  isCorpusExhausted: boolean;
}

export interface SWPSimulationReport {
  monthlyLogs: MonthlySWPResult[];
  totalGrossWithdrawn: number;
  totalTaxPaid: number;
  totalNetWithdrawn: number;
  finalCorpusValue: number;
  exhaustionMonth: number | null; // null if corpus lasts full duration
}