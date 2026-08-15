// src/hooks/useWealthPlanner.ts
import { useCallback, useMemo, useState } from 'react';
import { calculateHybridWealth, calculateRequiredSIP, TopUpMode } from '../utils/compoundMath';
import { parseShorthandNumber } from '../utils/formatters';
import { exportWealthReport } from '../utils/pdfGenerator';

export type Currency = 'INR' | 'USD';
export type CalcMode = 'forward' | 'reverse';
export type ActiveTab = 'chart' | 'table';

export const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', label: 'INR (₹)' },
  USD: { symbol: '$', locale: 'en-US', label: 'USD ($)' },
};

// Helper function to process input values (string shorthand or raw number)
const parseValue = (val: string | number): number => {
  if (typeof val === 'string') {
    return parseShorthandNumber(val);
  }
  return isNaN(val) ? 0 : val;
};

export function useWealthPlanner() {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [mode, setMode] = useState<CalcMode>('forward');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [inflationRate, setInflationRateState] = useState<number>(6);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Financial inputs
  const [targetCorpus, setTargetCorpusState] = useState<number>(10000000);
  const [initialLumpsum, setInitialLumpsumState] = useState<number>(100000);
  const [monthlySIP, setMonthlySIPState] = useState<number>(10000);
  const [stepUp, setStepUpState] = useState<number>(10);
  const [returnRate, setReturnRateState] = useState<number>(12);
  const [years, setYearsState] = useState<number>(15);

  // Top-Up / Lump sum injection inputs
  const [topUpAmount, setTopUpAmountState] = useState<number>(50000);
  const [topUpYear, setTopUpYearState] = useState<number>(5);
  const [topUpMode, setTopUpMode] = useState<TopUpMode>('single');

  // --- Setter Handlers (Support both string shorthand & number) ---
  const setTargetCorpus = (val: string | number) => setTargetCorpusState(parseValue(val));
  const setInitialLumpsum = (val: string | number) => setInitialLumpsumState(parseValue(val));
  const setMonthlySIP = (val: string | number) => setMonthlySIPState(parseValue(val));
  const setStepUp = (val: string | number) => setStepUpState(parseValue(val));
  const setReturnRate = (val: string | number) => setReturnRateState(parseValue(val));
  const setYears = (val: string | number) => setYearsState(parseValue(val));
  const setInflationRate = (val: string | number) => setInflationRateState(parseValue(val));
  const setTopUpAmount = (val: string | number) => setTopUpAmountState(parseValue(val));
  const setTopUpYear = (val: string | number) => setTopUpYearState(parseValue(val));

  const activeSymbol = CURRENCY_CONFIG[currency].symbol;
  const activeLocale = CURRENCY_CONFIG[currency].locale;

  const formatMoney = useCallback(
    (amount: number) => {
      if (isNaN(amount)) return `${activeSymbol}0`;
      if (currency === 'INR') {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
      }
      return `${activeSymbol}${Math.round(amount).toLocaleString(activeLocale)}`;
    },
    [currency, activeSymbol, activeLocale]
  );

  const effectiveTargetCorpus =
    mode === 'reverse'
      ? targetCorpus * Math.pow(1 + inflationRate / 100, years)
      : targetCorpus;

  const requiredSIP = useMemo(() => {
    return calculateRequiredSIP({
      targetCorpus: effectiveTargetCorpus,
      initialLumpsum,
      annualStepUpPercent: stepUp,
      expectedReturnRate: returnRate,
      durationYears: years,
      inflationRate,
      topUpAmount,
      topUpYear,
      topUpMode,
    });
  }, [
    effectiveTargetCorpus,
    initialLumpsum,
    stepUp,
    returnRate,
    years,
    inflationRate,
    topUpAmount,
    topUpYear,
    topUpMode,
  ]);

  const activeMonthlySIP = mode === 'forward' ? monthlySIP : requiredSIP;

  const result = useMemo(() => {
    return calculateHybridWealth({
      initialLumpsum,
      monthlySIP: activeMonthlySIP,
      annualStepUpPercent: stepUp,
      expectedReturnRate: returnRate,
      durationYears: years,
      inflationRate,
      topUpAmount,
      topUpYear,
      topUpMode,
    });
  }, [
    initialLumpsum,
    activeMonthlySIP,
    stepUp,
    returnRate,
    years,
    inflationRate,
    topUpAmount,
    topUpYear,
    topUpMode,
  ]);

  const monthlyPassiveIncome = useMemo(() => {
    return Math.round((result.finalCorpus * 0.04) / 12);
  }, [result.finalCorpus]);

  const applyPreset = (presetType: 'fire' | 'house' | 'education') => {
    setMode('reverse');
    if (presetType === 'fire') {
      setTargetCorpus(currency === 'INR' ? 30000000 : 1000000);
      setYears(20);
      setReturnRate(12);
      setStepUp(10);
    } else if (presetType === 'house') {
      setTargetCorpus(currency === 'INR' ? 10000000 : 300000);
      setYears(7);
      setReturnRate(10);
      setStepUp(5);
    } else if (presetType === 'education') {
      setTargetCorpus(currency === 'INR' ? 15000000 : 500000);
      setYears(15);
      setReturnRate(12);
      setStepUp(8);
    }
  };

  const handleExportPDF = async () => {
    await exportWealthReport({
      result,
      currencySymbol: activeSymbol,
      formattedCorpus: formatMoney(result.finalCorpus),
      formattedInvested: formatMoney(result.totalInvested),
      formattedGrowth: formatMoney(result.totalGrowth),
      monthlyPassive: formatMoney(monthlyPassiveIncome),
      realValue: formatMoney(result.finalRealCorpusInflationAdjusted),
    });
  };

  return {
    state: {
      currency,
      mode,
      activeTab,
      inflationRate,
      showCurrencyModal,
      targetCorpus,
      initialLumpsum,
      monthlySIP,
      stepUp,
      returnRate,
      years,
      topUpAmount,
      topUpYear,
      topUpMode,
      activeSymbol,
      requiredSIP,
      result,
      monthlyPassiveIncome,
    },
    actions: {
      setCurrency,
      setMode,
      setActiveTab,
      setInflationRate,
      setShowCurrencyModal,
      setTargetCorpus,
      setInitialLumpsum,
      setMonthlySIP,
      setStepUp,
      setReturnRate,
      setYears,
      setTopUpAmount,
      setTopUpYear,
      setTopUpMode,
      formatMoney,
      applyPreset,
      handleExportPDF,
    },
  };
}