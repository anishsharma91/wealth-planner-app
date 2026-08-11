// # Total Corpus, Invested, Earned, FIRE & Real Power

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalcMode } from '../hooks/useWealthPlanner';

interface Props {
  mode: CalcMode;
  targetCorpus: number;
  requiredSIP: number;
  years: number;
  inflationRate: number;
  result: any;
  monthlyPassiveIncome: number;
  formatMoney: (val: number) => string;
}

export const ResultsCard: React.FC<Props> = ({
  mode, targetCorpus, requiredSIP, years, inflationRate, result, monthlyPassiveIncome, formatMoney,
}) => (
  <View>
    {mode === 'reverse' && (
      <View style={styles.targetBanner}>
        <Text style={styles.targetBannerLabel}>REQUIRED MONTHLY STARTING SIP</Text>
        <Text style={styles.targetBannerValue}>{formatMoney(requiredSIP)}/mo</Text>
        <Text style={styles.targetBannerSub}>To achieve {formatMoney(targetCorpus)} target in {years} years.</Text>
      </View>
    )}
    <View style={styles.mainCard}>
      <Text style={styles.cardHeaderLabel}>{mode === 'forward' ? 'ESTIMATED TARGET CORPUS' : 'PROJECTED GOAL CORPUS'}</Text>
      <Text style={styles.corpusValue}>{formatMoney(result.finalCorpus)}</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Total Invested</Text>
          <Text style={styles.metricValue}>{formatMoney(result.totalInvested)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Wealth Earned</Text>
          <Text style={[styles.metricValue, { color: '#34D399' }]}>+{formatMoney(result.totalGrowth)}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.fireGrid}>
        <View style={styles.fireItem}>
          <Text style={styles.fireLabel}>Est. Monthly Passive Income (4% Rule)</Text>
          <Text style={styles.fireValue}>{formatMoney(monthlyPassiveIncome)}/mo</Text>
        </View>
        <View style={styles.fireItem}>
          <Text style={styles.fireLabel}>Real Value ({inflationRate}% Inflation)</Text>
          <Text style={styles.fireValue}>{formatMoney(result.finalRealCorpusInflationAdjusted)}</Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  targetBanner: { backgroundColor: '#2563EB', borderRadius: 16, padding: 16, marginBottom: 14 },
  targetBannerLabel: { color: '#BFDBFE', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  targetBannerValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginVertical: 2 },
  targetBannerSub: { color: '#DBEAFE', fontSize: 12 },
  mainCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardHeaderLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  corpusValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginVertical: 6, letterSpacing: -0.5 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metricItem: { flex: 1 },
  metricLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '500' },
  metricValue: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  fireGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  fireItem: { flex: 1 },
  fireLabel: { color: '#94A3B8', fontSize: 10 },
  fireValue: { color: '#38BDF8', fontSize: 13, fontWeight: '700', marginTop: 2 },
});