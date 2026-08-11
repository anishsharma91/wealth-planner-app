// # Sliders, Inputs, Top-Up Strategy controls

import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalcMode, Currency } from '../hooks/useWealthPlanner';
import { TopUpMode } from '../utils/compoundMath';

interface Props {
  mode: CalcMode;
  currency: Currency;
  activeSymbol: string;
  targetCorpus: number; setTargetCorpus: (val: number) => void;
  monthlySIP: number; setMonthlySIP: (val: number) => void;
  initialLumpsum: number; setInitialLumpsum: (val: number) => void;
  stepUp: number; setStepUp: (val: number) => void;
  returnRate: number; setReturnRate: (val: number) => void;
  years: number; setYears: (val: number) => void;
  topUpAmount: number; setTopUpAmount: (val: number) => void;
  topUpYear: number; setTopUpYear: (val: number) => void;
  topUpMode: TopUpMode; setTopUpMode: (val: TopUpMode) => void;
  inflationRate: number; setInflationRate: (val: number) => void;
}

const TOP_UP_STRATEGIES: { label: string; value: TopUpMode }[] = [
  { label: 'Single Year', value: 'single' },
  { label: 'First N Yrs', value: 'first_n' },
  { label: 'Last N Yrs', value: 'last_n' },
  { label: 'Every N Yrs', value: 'every_n' },
];

export const InputControls: React.FC<Props> = (props) => {
  const handleNumChange = (text: string, setter: (val: number) => void) => {
    if (text === '') {
      setter(0);
      return;
    }
    const cleanNum = parseFloat(text.replace(/[^0-9.]/g, ''));
    setter(isNaN(cleanNum) ? 0 : cleanNum);
  };

  return (
    <View style={styles.inputCard}>
      <Text style={styles.cardTitle}>Investment Parameters</Text>

      {props.mode === 'reverse' && (
        <View style={styles.inputBlock}>
          <View style={styles.labelRow}>
            <Text style={[styles.inputLabel, { color: '#2563EB' }]}>
              Target Goal Corpus ({props.activeSymbol})
            </Text>
            <TextInput
              style={[styles.textInput, { borderColor: '#2563EB' }]}
              keyboardType="numeric"
              value={props.targetCorpus.toString()}
              onChangeText={(t) => handleNumChange(t, props.setTargetCorpus)}
            />
          </View>
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
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Monthly SIP ({props.activeSymbol})</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={props.monthlySIP.toString()}
              onChangeText={(t) => handleNumChange(t, props.setMonthlySIP)}
            />
          </View>
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
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Initial Lump Sum ({props.activeSymbol})</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={props.initialLumpsum.toString()}
            onChangeText={(t) => handleNumChange(t, props.setInitialLumpsum)}
          />
        </View>
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
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Annual Step-Up (%)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={props.stepUp.toString()}
            onChangeText={(t) => handleNumChange(t, props.setStepUp)}
          />
        </View>
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
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Expected Return (% p.a.)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={props.returnRate.toString()}
            onChangeText={(t) => handleNumChange(t, props.setReturnRate)}
          />
        </View>
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
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Investment Horizon (Years)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={props.years.toString()}
            onChangeText={(t) =>
              handleNumChange(t, (v) => {
                props.setYears(v);
                if (props.topUpYear > v) props.setTopUpYear(v);
              })
            }
          />
        </View>
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
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Top-Up Amount ({props.activeSymbol})</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={props.topUpAmount.toString()}
              onChangeText={(t) => handleNumChange(t, props.setTopUpAmount)}
            />
          </View>
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
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Assumed Inflation Rate (%)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={props.inflationRate.toString()}
            onChangeText={(t) => handleNumChange(t, props.setInflationRate)}
          />
        </View>
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
});