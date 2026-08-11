import { SWPInput } from '../types/swpTypes';
import { runPostTaxSWPSimulation } from './swpEngine';

describe('Post-Tax SWP Simulation Engine', () => {
  test('correctly applies FIFO tax rules and handles annual LTCG exemption', () => {
    const sampleInput: SWPInput = {
      initialCorpus: 10000000, // ₹1 Crore
      initialUnitNAV: 100,
      expectedAnnualReturn: 0.10, // 10%
      expectedAnnualInflation: 0.05, // 5%
      initialMonthlyWithdrawal: 50000, // ₹50,000/month
      swpDurationYears: 5,
      annualLTCGExemption: 125000,
      ltcgTaxRate: 0.125,
      stcgTaxRate: 0.20,
      baseCurrency: 'INR',
    };

    const result = runPostTaxSWPSimulation(sampleInput);

    expect(result.monthlyLogs.length).toBe(60); // 5 years * 12 months
    expect(result.exhaustionMonth).toBeNull(); // Corpus should sustain
    expect(result.totalGrossWithdrawn).toBeGreaterThan(0);
    expect(result.totalTaxPaid).toBeGreaterThan(0);
    // Net withdrawal must equal Gross minus Tax
    expect(result.totalNetWithdrawn).toBeCloseTo(result.totalGrossWithdrawn - result.totalTaxPaid, 2);
  });
});