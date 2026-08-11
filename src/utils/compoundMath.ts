export type TopUpMode = 'single' | 'first_n' | 'last_n' | 'every_n';

export interface CompoundInputs {
  initialLumpsum: number;
  monthlySIP: number;
  annualStepUpPercent: number;
  expectedReturnRate: number;
  durationYears: number;
  inflationRate?: number;
  topUpAmount?: number;
  topUpYear?: number;
  topUpMode?: TopUpMode;
}

export type CalculationInput = CompoundInputs;

export interface GoalSeekInput extends Omit<CompoundInputs, 'monthlySIP'> {
  targetCorpus: number;
}

export interface YearlyBreakdown {
  year: number;
  investedCapital: number;
  wealthGenerated: number;
  totalCorpus: number;
  realCorpusInflationAdjusted: number;
  hasTopUp: boolean;
}

export interface CalculationResult {
  finalCorpus: number;
  totalInvested: number;
  totalGrowth: number;
  finalRealCorpusInflationAdjusted: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export function calculateHybridWealth(inputs: CompoundInputs): CalculationResult {
  const {
    initialLumpsum,
    monthlySIP,
    annualStepUpPercent,
    expectedReturnRate,
    durationYears,
    inflationRate = 0,
    topUpAmount = 0,
    topUpYear = 0,
    topUpMode = 'single',
  } = inputs;

  let currentCorpus = initialLumpsum;
  let totalInvested = initialLumpsum;
  let currentMonthlySIP = monthlySIP;

  const monthlyRate = expectedReturnRate / 12 / 100;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  for (let y = 1; y <= durationYears; y++) {
    let hasTopUp = false;

    if (topUpAmount > 0) {
      if (topUpMode === 'single' && y === topUpYear) hasTopUp = true;
      else if (topUpMode === 'first_n' && y <= topUpYear) hasTopUp = true;
      else if (topUpMode === 'last_n' && y > durationYears - topUpYear) hasTopUp = true;
      else if (topUpMode === 'every_n' && y % topUpYear === 0) hasTopUp = true;
    }

    if (hasTopUp) {
      currentCorpus += topUpAmount;
      totalInvested += topUpAmount;
    }

    for (let m = 1; m <= 12; m++) {
      currentCorpus = (currentCorpus + currentMonthlySIP) * (1 + monthlyRate);
      totalInvested += currentMonthlySIP;
    }

    currentMonthlySIP *= 1 + annualStepUpPercent / 100;

    const inflationFactor = Math.pow(1 + inflationRate / 100, y);
    const realCorpusInflationAdjusted = currentCorpus / inflationFactor;

    yearlyBreakdown.push({
      year: y,
      investedCapital: Math.round(totalInvested),
      wealthGenerated: Math.round(Math.max(0, currentCorpus - totalInvested)),
      totalCorpus: Math.round(currentCorpus),
      realCorpusInflationAdjusted: Math.round(realCorpusInflationAdjusted),
      hasTopUp,
    });
  }

  const finalCorpus = Math.round(currentCorpus);
  const finalInvested = Math.round(totalInvested);
  const finalGrowth = Math.round(Math.max(0, finalCorpus - finalInvested));
  const finalInflationFactor = Math.pow(1 + inflationRate / 100, durationYears);
  const finalRealCorpusInflationAdjusted = Math.round(finalCorpus / finalInflationFactor);

  return {
    finalCorpus,
    totalInvested: finalInvested,
    totalGrowth: finalGrowth,
    finalRealCorpusInflationAdjusted,
    yearlyBreakdown,
  };
}

export function calculateRequiredSIP(inputs: GoalSeekInput): number {
  const zeroSipCheck = calculateHybridWealth({ ...inputs, monthlySIP: 0 });
  if (zeroSipCheck.finalCorpus >= inputs.targetCorpus) {
    return 0;
  }

  let low = 0;
  let high = inputs.targetCorpus;
  let optimalSIP = 0;

  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const res = calculateHybridWealth({ ...inputs, monthlySIP: mid });

    if (res.finalCorpus >= inputs.targetCorpus) {
      optimalSIP = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.round(optimalSIP);
}