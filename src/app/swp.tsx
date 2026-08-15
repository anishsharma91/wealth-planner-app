import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SWPInput } from '../types/swpTypes';
import { runPostTaxSWPSimulation } from '../utils/swpEngine';

// Parse shorthand text (1k -> 1000, 1L -> 100000, 1Cr -> 10000000)
const parseShorthandNumber = (text: string): number => {
  if (!text) return 0;
  const clean = text.trim().toLowerCase();

  if (clean.endsWith('cr')) {
    const val = parseFloat(clean.replace('cr', ''));
    return isNaN(val) ? 0 : val * 10000000;
  }
  if (clean.endsWith('l')) {
    const val = parseFloat(clean.replace('l', ''));
    return isNaN(val) ? 0 : val * 100000;
  }
  if (clean.endsWith('k')) {
    const val = parseFloat(clean.replace('k', ''));
    return isNaN(val) ? 0 : val * 1000;
  }

  const val = parseFloat(clean.replace(/[^0-9.]/g, ''));
  return isNaN(val) ? 0 : val;
};

// Standard number formatter matching main screen logic
const formatNumericString = (val: number): string => {
  if (!val || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('en-IN');
};

export default function SWPScreen() {
  const router = useRouter();

  const [inputs, setInputs] = useState<SWPInput>({
    initialCorpus: 10000000, // ₹1 Cr
    initialUnitNAV: 100,
    expectedAnnualReturn: 0.10, // 10%
    expectedAnnualInflation: 0.05, // 5%
    initialMonthlyWithdrawal: 50000, // ₹50k/mo
    swpDurationYears: 15,
    annualLTCGExemption: 125000,
    ltcgTaxRate: 0.125,
    stcgTaxRate: 0.20,
    baseCurrency: 'INR',
  });

  // Display strings formatted to actual numeric strings
  const [corpusText, setCorpusText] = useState('1,00,00,000');
  const [withdrawalText, setWithdrawalText] = useState('50,000');
  const [returnText, setReturnText] = useState('10');
  const [inflationText, setInflationText] = useState('5');
  const [durationText, setDurationText] = useState('15');

  const report = useMemo(() => {
    const safeInputs: SWPInput = {
      ...inputs,
      initialCorpus: Math.max(100000, inputs.initialCorpus || 0),
      initialMonthlyWithdrawal: Math.max(1000, inputs.initialMonthlyWithdrawal || 0),
      expectedAnnualReturn: Math.max(0, inputs.expectedAnnualReturn || 0),
      expectedAnnualInflation: Math.max(0, inputs.expectedAnnualInflation || 0),
      swpDurationYears: Math.max(1, inputs.swpDurationYears || 1),
    };
    return runPostTaxSWPSimulation(safeInputs);
  }, [inputs]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Helper to commit parsed text into fully expanded numeric text
  const handleCorpusCommit = (rawText: string) => {
    const parsed = parseShorthandNumber(rawText);
    if (parsed > 0) {
      setInputs((p) => ({ ...p, initialCorpus: parsed }));
      setCorpusText(formatNumericString(parsed));
    } else {
      setCorpusText(formatNumericString(inputs.initialCorpus));
    }
  };

  const handleWithdrawalCommit = (rawText: string) => {
    const parsed = parseShorthandNumber(rawText);
    if (parsed > 0) {
      setInputs((p) => ({ ...p, initialMonthlyWithdrawal: parsed }));
      setWithdrawalText(formatNumericString(parsed));
    } else {
      setWithdrawalText(formatNumericString(inputs.initialMonthlyWithdrawal));
    }
  };

  const yearlyLogs = useMemo(() => {
    if (!report?.monthlyLogs) return [];
    const filtered = report.monthlyLogs.filter(
      (l) => l.month % 12 === 0 || l.isCorpusExhausted
    );
    const seen = new Set<number>();
    return filtered.filter((item) => {
      if (seen.has(item.month)) return false;
      seen.add(item.month);
      return true;
    });
  }, [report]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color="#38BDF8" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Ionicons name="cash-outline" size={18} color="#38BDF8" />
            </View>
            <Text style={styles.brandTitle}>
              SWP<Text style={styles.brandAccent}>Pulse</Text>
            </Text>
          </View>
        </View>

        <View style={styles.taglineBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.taglineText}>Post-Tax Inflation-Adjusted SWP Planner</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Summary */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Gross Withdrawn</Text>
            <Text style={styles.kpiValue}>{formatCurrency(report.totalGrossWithdrawn)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Est. LTCG Tax Paid</Text>
            <Text style={[styles.kpiValue, { color: '#EF4444' }]}>
              {formatCurrency(report.totalTaxPaid)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Net Take-Home Cash</Text>
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>
              {formatCurrency(report.totalNetWithdrawn)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ending Corpus</Text>
            <Text style={styles.kpiValue}>
              {report.exhaustionMonth
                ? `Exhausted in Mo ${report.exhaustionMonth}`
                : formatCurrency(report.finalCorpusValue)}
            </Text>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.inputCard}>
          <Text style={styles.cardTitle}>Withdrawal Parameters</Text>

          {/* Initial Corpus */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Initial Corpus (₹)</Text>
              <TextInput
                style={styles.textInput}
                autoCapitalize="none"
                value={corpusText}
                onChangeText={(text) => {
                  setCorpusText(text);
                  const parsed = parseShorthandNumber(text);
                  if (parsed > 0) {
                    setInputs((p) => ({ ...p, initialCorpus: parsed }));
                  }
                }}
                onBlur={() => handleCorpusCommit(corpusText)}
              />
            </View>
            <Slider
              minimumValue={1000000}
              maximumValue={100000000}
              step={500000}
              value={inputs.initialCorpus}
              onValueChange={(val) => {
                setInputs((p) => ({ ...p, initialCorpus: val }));
                setCorpusText(formatNumericString(val));
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Monthly Withdrawal */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Monthly Target Withdrawal (Today's ₹)</Text>
              <TextInput
                style={styles.textInput}
                autoCapitalize="none"
                value={withdrawalText}
                onChangeText={(text) => {
                  setWithdrawalText(text);
                  const parsed = parseShorthandNumber(text);
                  if (parsed > 0) {
                    setInputs((p) => ({ ...p, initialMonthlyWithdrawal: parsed }));
                  }
                }}
                onBlur={() => handleWithdrawalCommit(withdrawalText)}
              />
            </View>
            <Slider
              minimumValue={10000}
              maximumValue={500000}
              step={5000}
              value={inputs.initialMonthlyWithdrawal}
              onValueChange={(val) => {
                setInputs((p) => ({ ...p, initialMonthlyWithdrawal: val }));
                setWithdrawalText(formatNumericString(val));
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Expected Return */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Expected Portfolio Return (% p.a.)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={returnText}
                onChangeText={(text) => {
                  setReturnText(text);
                  const parsed = parseFloat(text);
                  if (!isNaN(parsed)) setInputs((p) => ({ ...p, expectedAnnualReturn: parsed / 100 }));
                }}
              />
            </View>
            <Slider
              minimumValue={1}
              maximumValue={20}
              step={0.5}
              value={inputs.expectedAnnualReturn * 100}
              onValueChange={(val) => {
                setInputs((p) => ({ ...p, expectedAnnualReturn: val / 100 }));
                setReturnText(val.toFixed(1));
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Inflation */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Expected Inflation (% p.a.)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={inflationText}
                onChangeText={(text) => {
                  setInflationText(text);
                  const parsed = parseFloat(text);
                  if (!isNaN(parsed)) setInputs((p) => ({ ...p, expectedAnnualInflation: parsed / 100 }));
                }}
              />
            </View>
            <Slider
              minimumValue={0}
              maximumValue={12}
              step={0.5}
              value={inputs.expectedAnnualInflation * 100}
              onValueChange={(val) => {
                setInputs((p) => ({ ...p, expectedAnnualInflation: val / 100 }));
                setInflationText(val.toFixed(1));
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Horizon */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>SWP Horizon (Years)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={durationText}
                onChangeText={(text) => {
                  setDurationText(text);
                  const parsed = parseInt(text, 10);
                  if (!isNaN(parsed)) setInputs((p) => ({ ...p, swpDurationYears: parsed }));
                }}
              />
            </View>
            <Slider
              minimumValue={1}
              maximumValue={40}
              step={1}
              value={inputs.swpDurationYears}
              onValueChange={(val) => {
                setInputs((p) => ({ ...p, swpDurationYears: val }));
                setDurationText(val.toString());
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Snapshot Table */}
        <View style={styles.tableCard}>
          <Text style={styles.cardTitle}>Yearly SWP Snapshot</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 0.8 }]}>Year</Text>
            <Text style={styles.thCell}>Gross</Text>
            <Text style={styles.thCell}>Tax</Text>
            <Text style={styles.thCell}>Corpus</Text>
          </View>
          {yearlyLogs.map((row) => (
            <View key={`yr-row-${row.month}`} style={styles.tableRow}>
              <Text style={[styles.tdCell, { flex: 0.8, fontWeight: '700' }]}>
                Yr {Math.ceil(row.month / 12)}
              </Text>
              <Text style={styles.tdCell}>{formatCurrency(row.grossWithdrawal * 12)}</Text>
              <Text style={[styles.tdCell, { color: '#EF4444' }]}>
                {formatCurrency(row.taxPaid * 12)}
              </Text>
              <Text style={[styles.tdCell, { fontWeight: '600' }]}>
                {formatCurrency(row.endingCorpusValue)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    backgroundColor: '#0F172A',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 2,
  },
  backButtonText: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  brandAccent: { color: '#38BDF8' },
  taglineBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    gap: 6,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  taglineText: { color: '#94A3B8', fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  scrollContent: { padding: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  kpiValue: { color: '#0F172A', fontSize: 15, fontWeight: '800', marginTop: 4 },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 14 },
  inputBlock: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'right',
    minWidth: 80,
  },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 8, marginBottom: 6 },
  thCell: { flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tdCell: { flex: 1, fontSize: 11, color: '#334155', textAlign: 'right' },
});