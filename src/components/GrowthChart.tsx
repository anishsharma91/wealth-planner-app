// # GiftedCharts implementation

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface Props {
  yearlyBreakdown: Array<{ year: number; investedCapital: number; wealthGenerated: number }>;
}

export const GrowthChart: React.FC<Props> = ({ yearlyBreakdown }) => {
  const barData = yearlyBreakdown.map((item) => ({
    label: `Y${item.year}`,
    stacks: [
      { value: item.investedCapital, color: '#3B82F6' },
      { value: item.wealthGenerated, color: '#10B981' },
    ],
  }));

  return (
    <View style={styles.sectionCard}>
      <View style={styles.legendRow}>
        <View style={styles.legendBadge}>
          <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendLabel}>Invested Capital</Text>
        </View>
        <View style={styles.legendBadge}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>Compound Wealth</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          stackData={barData}
          height={200}
          width={Math.max(300, barData.length * 48)}
          barWidth={22}
          spacing={20}
          noOfSections={4}
          yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
          hideRules
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  legendRow: { flexDirection: 'row', marginBottom: 14 },
  legendBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },
});