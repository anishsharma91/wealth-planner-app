import { MonthlySWPResult, SWPInput, SWPSimulationReport, UnitLot } from '../types/swpTypes';

export function runPostTaxSWPSimulation(input: SWPInput): SWPSimulationReport {
  const totalMonths = input.swpDurationYears * 12;
  const monthlyReturnRate = Math.pow(1 + input.expectedAnnualReturn, 1 / 12) - 1;
  const monthlyInflationRate = Math.pow(1 + input.expectedAnnualInflation, 1 / 12) - 1;

  let currentNAV = input.initialUnitNAV;
  let remainingUnits = input.initialCorpus / currentNAV;
  
  // Track cost basis via FIFO Lot queue
  let unitLots: UnitLot[] = [
    {
      purchaseDateMonth: 0,
      units: remainingUnits,
      costPerUnit: currentNAV,
    },
  ];

  const monthlyLogs: MonthlySWPResult[] = [];
  let totalGrossWithdrawn = 0;
  let totalTaxPaid = 0;
  let totalNetWithdrawn = 0;
  let exhaustionMonth: number | null = null;
  
  let accumulatedLTCGGainInYear = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // Reset annual tax allowance at start of each year (Month 1, 13, 25, etc.)
    if ((m - 1) % 12 === 0) {
      accumulatedLTCGGainInYear = 0;
    }

    // Grow NAV for current month
    currentNAV *= (1 + monthlyReturnRate);

    // Calculate inflation-adjusted target gross withdrawal
    const currentMonthlyWithdrawalTarget = input.initialMonthlyWithdrawal * Math.pow(1 + monthlyInflationRate, m - 1);

    const totalCorpusValueBeforeWithdrawal = remainingUnits * currentNAV;

    // Check for corpus exhaustion
    if (totalCorpusValueBeforeWithdrawal <= 0 || remainingUnits <= 0) {
      if (exhaustionMonth === null) exhaustionMonth = m - 1;
      monthlyLogs.push({
        month: m,
        grossWithdrawal: 0,
        taxPaid: 0,
        netWithdrawal: 0,
        endingCorpusValue: 0,
        remainingUnits: 0,
        currentNAV,
        isCorpusExhausted: true,
      });
      continue;
    }

    const unitsToRedeemTarget = currentMonthlyWithdrawalTarget / currentNAV;
    const unitsToRedeem = Math.min(unitsToRedeemTarget, remainingUnits);
    const actualGrossWithdrawal = unitsToRedeem * currentNAV;

    // FIFO Unit Redemption & Tax Calculation
    let unitsLeftToRedeem = unitsToRedeem;
    let monthLTCGGain = 0;
    let monthSTCGGain = 0;

    while (unitsLeftToRedeem > 0 && unitLots.length > 0) {
      const currentLot = unitLots[0];
      const unitsFromLot = Math.min(unitsLeftToRedeem, currentLot.units);
      const holdingPeriodMonths = m - currentLot.purchaseDateMonth;

      const gainPerUnit = currentNAV - currentLot.costPerUnit;
      const totalGainFromLot = unitsFromLot * gainPerUnit;

      if (holdingPeriodMonths >= 12) {
        monthLTCGGain += Math.max(0, totalGainFromLot);
      } else {
        monthSTCGGain += Math.max(0, totalGainFromLot);
      }

      currentLot.units -= unitsFromLot;
      unitsLeftToRedeem -= unitsFromLot;

      if (currentLot.units <= 0) {
        unitLots.shift(); // Remove depleted lot
      }
    }

    // Calculate Tax Liability
    let taxableLTCG = 0;
    if (monthLTCGGain > 0) {
      const remainingExemption = Math.max(0, input.annualLTCGExemption - accumulatedLTCGGainInYear);
      taxableLTCG = Math.max(0, monthLTCGGain - remainingExemption);
      accumulatedLTCGGainInYear += monthLTCGGain;
    }

    const ltcgTax = taxableLTCG * input.ltcgTaxRate;
    const stcgTax = monthSTCGGain * input.stcgTaxRate;
    const totalMonthTax = ltcgTax + stcgTax;

    const netWithdrawal = actualGrossWithdrawal - totalMonthTax;
    remainingUnits -= unitsToRedeem;
    const endingCorpusValue = remainingUnits * currentNAV;

    totalGrossWithdrawn += actualGrossWithdrawal;
    totalTaxPaid += totalMonthTax;
    totalNetWithdrawn += netWithdrawal;

    monthlyLogs.push({
      month: m,
      grossWithdrawal: actualGrossWithdrawal,
      taxPaid: totalMonthTax,
      netWithdrawal,
      endingCorpusValue,
      remainingUnits,
      currentNAV,
      isCorpusExhausted: false,
    });
  }

  return {
    monthlyLogs,
    totalGrossWithdrawn,
    totalTaxPaid,
    totalNetWithdrawn,
    finalCorpusValue: monthlyLogs[monthlyLogs.length - 1]?.endingCorpusValue || 0,
    exhaustionMonth,
  };
}