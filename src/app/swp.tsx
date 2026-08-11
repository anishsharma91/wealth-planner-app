// app/swp.tsx
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Platform,
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

export default function SWPScreen() {
  const router = useRouter();

  const [inputs, setInputs] = useState<SWPInput>({
    initialCorpus: 10000000, // ₹1 Cr
    initialUnitNAV: 100,
    expectedAnnualReturn: 0.10, // 10%
    expectedAnnualInflation: 0.05, // 5%
    initialMonthlyWithdrawal: 50000, // ₹50k/mo
    swpDurationYears: 15,
    annualLTCGExemption: 125000, // ₹1.25L
    ltcgTaxRate: 0.125, // 12.5%
    stcgTaxRate: 0.20, // 20%
    baseCurrency: 'INR',
  });

  const report = useMemo(() => runPostTaxSWPSimulation(inputs), [inputs]);

  const handleTextChange = (field: keyof SWPInput, text: string) => {
    const val = Number(text.replace(/[^0-9.]/g, ''));
    setInputs((prev) => ({ ...prev, [field]: isNaN(val) ? 0 : val }));
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Safe Navigation */}
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
        {/* Summary KPI Cards */}
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
                keyboardType="numeric"
                value={inputs.initialCorpus.toString()}
                onChangeText={(t) => handleTextChange('initialCorpus', t)}
              />
            </View>
            <Slider
              minimumValue={1000000}
              maximumValue={100000000}
              step={500000}
              value={inputs.initialCorpus}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, initialCorpus: v }))}
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
                keyboardType="numeric"
                value={inputs.initialMonthlyWithdrawal.toString()}
                onChangeText={(t) => handleTextChange('initialMonthlyWithdrawal', t)}
              />
            </View>
            <Slider
              minimumValue={10000}
              maximumValue={500000}
              step={5000}
              value={inputs.initialMonthlyWithdrawal}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, initialMonthlyWithdrawal: v }))}
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
                value={(inputs.expectedAnnualReturn * 100).toString()}
                onChangeText={(t) =>
                  setInputs((prev) => ({ ...prev, expectedAnnualReturn: Number(t) / 100 }))
                }
              />
            </View>
            <Slider
              minimumValue={1}
              maximumValue={20}
              step={0.5}
              value={inputs.expectedAnnualReturn * 100}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, expectedAnnualReturn: v / 100 }))}
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
                value={(inputs.expectedAnnualInflation * 100).toString()}
                onChangeText={(t) =>
                  setInputs((prev) => ({ ...prev, expectedAnnualInflation: Number(t) / 100 }))
                }
              />
            </View>
            <Slider
              minimumValue={0}
              maximumValue={12}
              step={0.5}
              value={inputs.expectedAnnualInflation * 100}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, expectedAnnualInflation: v / 100 }))}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          {/* Duration */}
          <View style={styles.inputBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>SWP Horizon (Years)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={inputs.swpDurationYears.toString()}
                onChangeText={(t) => handleTextChange('swpDurationYears', t)}
              />
            </View>
            <Slider
              minimumValue={1}
              maximumValue={40}
              step={1}
              value={inputs.swpDurationYears}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, swpDurationYears: v }))}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Yearly Table */}
        <View style={styles.tableCard}>
          <Text style={styles.cardTitle}>Yearly SWP Snapshot</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 0.8 }]}>Year</Text>
            <Text style={styles.thCell}>Gross</Text>
            <Text style={styles.thCell}>Tax</Text>
            <Text style={styles.thCell}>Corpus</Text>
          </View>
          {report.monthlyLogs
            .filter((l) => l.month % 12 === 0 || l.isCorpusExhausted)
            .map((row) => (
              <View key={row.month} style={styles.tableRow}>
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

  // Header Styles
  headerContainer: {
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? 36 : 12,
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

  // Content Styles
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