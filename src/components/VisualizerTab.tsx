// # Chart vs. Table tab container

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActiveTab } from '../hooks/useWealthPlanner';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const VisualizerTab: React.FC<Props> = ({ activeTab, onSelectTab }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === 'chart' && styles.tabItemActive]}
      onPress={() => onSelectTab('chart')}
    >
      <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>📊 Growth Chart</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === 'table' && styles.tabItemActive]}
      onPress={() => onSelectTab('table')}
    >
      <Text style={[styles.tabText, activeTab === 'table' && styles.tabTextActive]}>📋 Yearly Breakdown</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 3, marginBottom: 16 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#0F172A', fontWeight: '700' },
});