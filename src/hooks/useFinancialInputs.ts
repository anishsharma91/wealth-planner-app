// src/hooks/useFinancialInputs.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface FinancialInputs {
  currentAge: number;
  targetRetirementAge: number;
  currentCorpus: number;
  monthlySIP: number;
  expectedReturnRate: number;
  swpAmount: number;
}

const STORAGE_KEY = '@fire_wealth_inputs_v1';

const DEFAULT_INPUTS: FinancialInputs = {
  currentAge: 30,
  targetRetirementAge: 50,
  currentCorpus: 50000,
  monthlySIP: 2000,
  expectedReturnRate: 12,
  swpAmount: 5000,
};

export function useFinancialInputs() {
  const [inputs, setInputs] = useState<FinancialInputs>(DEFAULT_INPUTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInputs() {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue !== null && isMounted) {
          const parsed = JSON.parse(jsonValue);
          setInputs({ ...DEFAULT_INPUTS, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load financial inputs from storage:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInputs();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateInputs = async (newInputs: Partial<FinancialInputs>) => {
    try {
      const updated = { ...inputs, ...newInputs };
      setInputs(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save financial inputs to storage:', error);
    }
  };

  const resetInputs = async () => {
    try {
      setInputs(DEFAULT_INPUTS);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset financial inputs:', error);
    }
  };

  return {
    inputs,
    isLoading,
    updateInputs,
    resetInputs,
  };
}