// # Forward/Reverse mode toggle

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalcMode } from '../hooks/useWealthPlanner';

interface Props {
  mode: CalcMode;
  onSelectMode: (mode: CalcMode) => void;
}

export const ModeSelector: React.FC<Props> = ({ mode, onSelectMode }) => (
  <View style={styles.modeToggleContainer}>
    <TouchableOpacity
      style={[styles.modeTab, mode === 'forward' && styles.modeTabActive]}
      onPress={() => onSelectMode('forward')}
    >
      <Text style={[styles.modeTabText, mode === 'forward' && styles.modeTabTextActive]}>📈 Corpus Predictor</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.modeTab, mode === 'reverse' && styles.modeTabActive]}
      onPress={() => onSelectMode('reverse')}
    >
      <Text style={[styles.modeTabText, mode === 'reverse' && styles.modeTabTextActive]}>🎯 Goal Planner</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  modeToggleContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 3, marginBottom: 12 },
  modeTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  modeTabActive: { backgroundColor: '#0F172A' },
  modeTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  modeTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
});