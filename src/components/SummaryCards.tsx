import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalculationResult } from '../utils/compoundMath';

interface Props {
  result: CalculationResult;
  inflationRate: number;
  formatMoney: (val: number) => string;
}

export const SummaryCards: React.FC<Props> = ({ result, inflationRate, formatMoney }) => {
  return (
    <View style={styles.container}>
      {/* ADD JSX HERE */}
      <View style={styles.summaryCard}>
        {/* 1. Future Bank Balance (Fixed cash accumulated) */}
        <Text style={styles.label}>Estimated Future Corpus (Nominal)</Text>
        <Text style={styles.value}>{formatMoney(result.finalCorpus)}</Text>

        {/* 2. Today's Purchasing Power (Reacts directly to Inflation Slider) */}
        <View style={styles.inflationBadge}>
          <Text style={styles.badgeLabel}>
            Value in Today's Terms ({inflationRate}% Inflation)
          </Text>
          <Text style={styles.badgeValue}>
            {formatMoney(result.finalRealCorpusInflationAdjusted)}
          </Text>
        </View>
      </View>
      {/* END OF ADDED JSX */}

      {/* Invested vs Growth sub-metrics */}
      <View style={styles.row}>
        <View style={styles.halfCard}>
          <Text style={styles.subLabel}>Total Invested</Text>
          <Text style={styles.subValue}>{formatMoney(result.totalInvested)}</Text>
        </View>
        <View style={styles.halfCard}>
          <Text style={styles.subLabel}>Total Wealth Gain</Text>
          <Text style={styles.subValue}>{formatMoney(result.totalGrowth)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 6,
  },
  inflationBadge: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  subValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
});