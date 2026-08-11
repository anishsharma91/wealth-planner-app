// # FIRE, House, Education quick presets

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onApplyPreset: (preset: 'fire' | 'house' | 'education') => void;
}

export const PresetChips: React.FC<Props> = ({ onApplyPreset }) => (
  <View style={styles.presetSection}>
    <Text style={styles.presetHeading}>Quick Goal Presets:</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
      <TouchableOpacity style={styles.chip} onPress={() => onApplyPreset('fire')}>
        <Text style={styles.chipText}>🔥 Early Retirement</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chip} onPress={() => onApplyPreset('education')}>
        <Text style={styles.chipText}>🎓 Child Education</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chip} onPress={() => onApplyPreset('house')}>
        <Text style={styles.chipText}>🏡 House Downpayment</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  presetSection: { marginBottom: 14 },
  presetHeading: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  presetRow: { flexDirection: 'row' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 11, fontWeight: '600', color: '#334155' },
});