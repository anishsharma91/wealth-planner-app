import {
  calculateHybridWealth,
  calculateRequiredSIP,
  CalculationInput,
  GoalSeekInput,
} from './compoundMath';

describe('calculateHybridWealth', () => {
  test('handles zero returns and basic SIP contributions accurately', () => {
    const input: CalculationInput = {
      initialLumpsum: 10000,
      monthlySIP: 1000,
      annualStepUpPercent: 0,
      expectedReturnRate: 0,
      durationYears: 1,
      inflationRate: 0,
    };

    const result = calculateHybridWealth(input);

    expect(result.totalInvested).toBe(22000);
    expect(result.finalCorpus).toBe(22000);
    expect(result.totalGrowth).toBe(0);
    expect(result.yearlyBreakdown).toHaveLength(1);
    expect(result.yearlyBreakdown[0].hasTopUp).toBe(false);
  });

  test('applies monthly compound growth correctly', () => {
    const input: CalculationInput = {
      initialLumpsum: 0,
      monthlySIP: 1000,
      annualStepUpPercent: 0,
      expectedReturnRate: 12,
      durationYears: 1,
      inflationRate: 0,
    };

    const result = calculateHybridWealth(input);

    expect(result.totalInvested).toBe(12000);
    expect(result.finalCorpus).toBeGreaterThan(12000);
    expect(result.totalGrowth).toBe(result.finalCorpus - result.totalInvested);
  });

  test('applies annual step-up to monthly SIP from year 2 onwards', () => {
    const input: CalculationInput = {
      initialLumpsum: 0,
      monthlySIP: 1000,
      annualStepUpPercent: 10,
      expectedReturnRate: 0,
      durationYears: 2,
      inflationRate: 0,
    };

    const result = calculateHybridWealth(input);

    expect(result.totalInvested).toBe(25200);
    expect(result.finalCorpus).toBe(25200);
    expect(result.yearlyBreakdown[0].investedCapital).toBe(12000);
    expect(result.yearlyBreakdown[1].investedCapital).toBe(25200);
  });

  describe('Top-Up Modes', () => {
    test('single top-up applies only on the specified year', () => {
      const input: CalculationInput = {
        initialLumpsum: 0,
        monthlySIP: 0,
        annualStepUpPercent: 0,
        expectedReturnRate: 0,
        durationYears: 3,
        topUpAmount: 5000,
        topUpYear: 2,
        topUpMode: 'single',
        inflationRate: 0,
      };

      const result = calculateHybridWealth(input);

      expect(result.yearlyBreakdown[0].hasTopUp).toBe(false);
      expect(result.yearlyBreakdown[1].hasTopUp).toBe(true);
      expect(result.yearlyBreakdown[2].hasTopUp).toBe(false);
      expect(result.totalInvested).toBe(5000);
    });

    test('every_n top-up applies periodically', () => {
      const input: CalculationInput = {
        initialLumpsum: 0,
        monthlySIP: 0,
        annualStepUpPercent: 0,
        expectedReturnRate: 0,
        durationYears: 4,
        topUpAmount: 2000,
        topUpYear: 2,
        topUpMode: 'every_n',
        inflationRate: 0,
      };

      const result = calculateHybridWealth(input);

      expect(result.yearlyBreakdown[0].hasTopUp).toBe(false);
      expect(result.yearlyBreakdown[1].hasTopUp).toBe(true);
      expect(result.yearlyBreakdown[2].hasTopUp).toBe(false);
      expect(result.yearlyBreakdown[3].hasTopUp).toBe(true);
      expect(result.totalInvested).toBe(4000);
    });
  });
});

describe('calculateRequiredSIP', () => {
  test('returns 0 if initial lump sum already meets or exceeds target', () => {
    const input: GoalSeekInput = {
      targetCorpus: 50000,
      initialLumpsum: 60000,
      annualStepUpPercent: 0,
      expectedReturnRate: 10,
      durationYears: 5,
      inflationRate: 0,
    };

    expect(calculateRequiredSIP(input)).toBe(0);
  });

  test('calculates correct starting SIP to hit target corpus within tolerance', () => {
    const targetCorpus = 1000000;
    const input: GoalSeekInput = {
      targetCorpus,
      initialLumpsum: 50000,
      annualStepUpPercent: 10,
      expectedReturnRate: 12,
      durationYears: 10,
      inflationRate: 0,
    };

    const requiredSIP = calculateRequiredSIP(input);

    const simulationResult = calculateHybridWealth({
      ...input,
      monthlySIP: requiredSIP,
    });

    expect(Math.abs(simulationResult.finalCorpus - targetCorpus)).toBeLessThan(1000);
  });
});

describe('Inflation Adjustment', () => {
  test('correctly calculates real corpus after discounting for inflation', () => {
    const input: CalculationInput = {
      initialLumpsum: 100000,
      monthlySIP: 0,
      annualStepUpPercent: 0,
      expectedReturnRate: 10,
      durationYears: 1,
      inflationRate: 6,
    };

    const result = calculateHybridWealth(input);

    expect(result.finalCorpus).toBe(110471);
    expect(result.finalRealCorpusInflationAdjusted).toBe(104218);
  });
});