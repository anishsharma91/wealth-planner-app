// # Sliders, Inputs, Top-Up Strategy controls

import { parseShorthandNumber } from '@/utils/formatters';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalcMode, Currency } from '../hooks/useWealthPlanner';
import { TopUpMode } from '../utils/compoundMath';

type StringOrNumberSetter = (val: string | number) => void;

interface Props {
  mode: CalcMode;
  currency: Currency;
  activeSymbol: string;
  targetCorpus: number; setTargetCorpus: StringOrNumberSetter;
  monthlySIP: number; setMonthlySIP: StringOrNumberSetter;
  initialLumpsum: number; setInitialLumpsum: StringOrNumberSetter;
  stepUp: number; setStepUp: StringOrNumberSetter;
  returnRate: number; setReturnRate: StringOrNumberSetter;
  years: number; setYears: StringOrNumberSetter;
  topUpAmount: number; setTopUpAmount: StringOrNumberSetter;
  topUpYear: number; setTopUpYear: StringOrNumberSetter;
  topUpMode: TopUpMode; setTopUpMode: (val: TopUpMode) => void;
  inflationRate: number; setInflationRate: StringOrNumberSetter;
}

const TOP_UP_STRATEGIES: { label: string; value: TopUpMode }[] = [
  { label: 'Single Year', value: 'single' },
  { label: 'First N Yrs', value: 'first_n' },
  { label: 'Last N Yrs', value: 'last_n' },
  { label: 'Every N Yrs', value: 'every_n' },
];

/**
 * Reusable Row Component: Handles text state locally so letters (k, L, cr) 
 * can be typed without being stripped, parsing on blur / submit.
 */
interface ShorthandInputRowProps {
  label: string;
  value: number;
  onChangeValue: StringOrNumberSetter;
  highlight?: boolean;
}

function ShorthandInputRow({ label, value, onChangeValue, highlight }: ShorthandInputRowProps) {
  const [text, setText] = useState(value ? value.toString() : '0');

  useEffect(() => {
    setText(value ? value.toString() : '0');
  }, [value]);

  const handleBlur = () => {
    const parsed = parseShorthandNumber(text);
    onChangeValue(parsed);
  };

  return (
    <View style={styles.labelRow}>
      <Text style={[styles.inputLabel, highlight && { color: '#2563EB' }]}>{label}</Text>
      <TextInput
        style={[styles.textInput, highlight && { borderColor: '#2563EB' }]}
        keyboardType="default"
        autoCapitalize="none"
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        onSubmitEditing={handleBlur}
      />
    </View>
  );
}

export const InputControls: React.FC<Props> = (props) => {
  return (
    <View style={styles.inputCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Investment Parameters</Text>
        <View style={styles.shorthandBadge}>
          <Text style={styles.shorthandBadgeText}>💡 Hint: Type "10k", "1.5L", "2Cr"</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>Investment Parameters</Text>

      {props.mode === 'reverse' && (
        <View style={styles.inputBlock}>
          <ShorthandInputRow
            label={`Target Goal Corpus (${props.activeSymbol})`}
            value={props.targetCorpus}
            onChangeValue={props.setTargetCorpus}
            highlight
          />
          <Slider
            minimumValue={100000}
            maximumValue={props.currency === 'INR' ? 100000000 : 5000000}
            step={100000}
            value={props.targetCorpus}
            onValueChange={(v) => props.setTargetCorpus(Math.round(v))}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      )}

      {props.mode === 'forward' && (
        <View style={styles.inputBlock}>
          <ShorthandInputRow
            label={`Monthly SIP (${props.activeSymbol})`}
            value={props.monthlySIP}
            onChangeValue={props.setMonthlySIP}
          />
          <Slider
            minimumValue={500}
            maximumValue={200000}
            step={500}
            value={props.monthlySIP}
            onValueChange={(v) => props.setMonthlySIP(Math.round(v))}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      )}

      <View style={styles.inputBlock}>
        <ShorthandInputRow
          label={`Initial Lump Sum (${props.activeSymbol})`}
          value={props.initialLumpsum}
          onChangeValue={props.setInitialLumpsum}
        />
        <Slider
          minimumValue={0}
          maximumValue={props.currency === 'INR' ? 10000000 : 1000000}
          step={10000}
          value={props.initialLumpsum}
          onValueChange={(v) => props.setInitialLumpsum(Math.round(v))}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
        />
      </View>

      <View style={styles.inputBlock}>
        <ShorthandInputRow
          label="Annual Step-Up (%)"
          value={props.stepUp}
          onChangeValue={props.setStepUp}
        />
        <Slider
          minimumValue={0}
          maximumValue={30}
          step={1}
          value={props.stepUp}
          onValueChange={(v) => props.setStepUp(Math.round(v))}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
        />
      </View>

      <View style={styles.inputBlock}>
        <ShorthandInputRow
          label="Expected Return (% p.a.)"
          value={props.returnRate}
          onChangeValue={props.setReturnRate}
        />
        <Slider
          minimumValue={1}
          maximumValue={25}
          step={0.5}
          value={props.returnRate}
          onValueChange={(v) => props.setReturnRate(Number(v.toFixed(1)))}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
        />
      </View>

      <View style={styles.inputBlock}>
        <ShorthandInputRow
          label="Investment Horizon (Years)"
          value={props.years}
          onChangeValue={(v) => {
            props.setYears(v);
            // Convert to number for comparison if topUpYear needs to be capped
            const numVal = typeof v === 'number' ? v : parseShorthandNumber(v);
            if (props.topUpYear > numVal) props.setTopUpYear(numVal);
          }}
        />
        <Slider
          minimumValue={1}
          maximumValue={40}
          step={1}
          value={props.years}
          onValueChange={(v) => {
            const yr = Math.round(v);
            props.setYears(yr);
            if (props.topUpYear > yr) props.setTopUpYear(yr);
          }}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
        />
      </View>

      <View style={styles.strategyContainer}>
        <Text style={styles.strategyTitle}>⚡ Extra Top-Up Strategy</Text>
        <View style={styles.strategyChipsRow}>
          {TOP_UP_STRATEGIES.map((strat) => (
            <TouchableOpacity
              key={strat.value}
              style={[
                styles.strategyChip,
                props.topUpMode === strat.value && styles.strategyChipActive,
              ]}
              onPress={() => props.setTopUpMode(strat.value)}
            >
              <Text
                style={[
                  styles.strategyChipText,
                  props.topUpMode === strat.value && styles.strategyChipTextActive,
                ]}
              >
                {strat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inputBlock}>
          <ShorthandInputRow
            label={`Top-Up Amount (${props.activeSymbol})`}
            value={props.topUpAmount}
            onChangeValue={props.setTopUpAmount}
          />
          <Slider
            minimumValue={0}
            maximumValue={props.currency === 'INR' ? 5000000 : 500000}
            step={5000}
            value={props.topUpAmount}
            onValueChange={(v) => props.setTopUpAmount(Math.round(v))}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      </View>

      <View style={styles.inputBlock}>
        <ShorthandInputRow
          label="Assumed Inflation Rate (%)"
          value={props.inflationRate}
          onChangeValue={props.setInflationRate}
        />
        <Slider
          minimumValue={0}
          maximumValue={12}
          step={0.5}
          value={props.inflationRate}
          onValueChange={(v) => props.setInflationRate(Number(v.toFixed(1)))}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  inputBlock: { marginBottom: 16 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
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
    minWidth: 85,
  },
  strategyContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strategyTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  strategyChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  strategyChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  strategyChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  strategyChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  strategyChipTextActive: { color: '#FFFFFF' },
  cardHeader: {
    marginBottom: 12,
  },
  shorthandBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  shorthandBadgeText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  inputSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  }
});