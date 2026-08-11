import { useCallback, useMemo, useState } from 'react';
import { calculateHybridWealth, calculateRequiredSIP, TopUpMode } from '../utils/compoundMath';
import { exportWealthReport } from '../utils/pdfGenerator';

export type Currency = 'INR' | 'USD';
export type CalcMode = 'forward' | 'reverse';
export type ActiveTab = 'chart' | 'table';

export const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', label: 'INR (₹)' },
  USD: { symbol: '$', locale: 'en-US', label: 'USD ($)' },
};

export function useWealthPlanner() {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [mode, setMode] = useState<CalcMode>('forward');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [inflationRate, setInflationRate] = useState(6);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [targetCorpus, setTargetCorpus] = useState(10000000);
  const [initialLumpsum, setInitialLumpsum] = useState(100000);
  const [monthlySIP, setMonthlySIP] = useState(10000);
  const [stepUp, setStepUp] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(15);

  const [topUpAmount, setTopUpAmount] = useState(50000);
  const [topUpYear, setTopUpYear] = useState(5);
  const [topUpMode, setTopUpMode] = useState<TopUpMode>('single');

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