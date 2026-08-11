// # Yearly breakdown table

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { YearlyBreakdown } from '../utils/compoundMath';

interface Props {
  breakdown?: YearlyBreakdown[];
  formatMoney: (val: number) => string;
}

export const BreakdownTable: React.FC<Props> = ({ breakdown, formatMoney }) => {
  return (
    <View style={styles.tableCard}>
      <Text style={styles.title}>Yearly Growth & Inflation Breakdown</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { width: 50 }]}>Year</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 110 }]}>Invested</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Nominal Corpus</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 130, color: '#2563EB' }]}>
              Inflation Adj. Real Value
            </Text>
          </View>

          {Array.isArray(breakdown) && breakdown.length > 0 ? (
            breakdown.map((item) => (
              <View key={item.year} style={styles.row}>
                <Text style={[styles.cell, { width: 50, fontWeight: '600' }]}>Yr {item.year}</Text>
                <Text style={[styles.cell, { width: 110 }]}>{formatMoney(item.investedCapital)}</Text>
                <Text style={[styles.cell, { width: 120 }]}>{formatMoney(item.totalCorpus)}</Text>
                <Text style={[styles.cell, { width: 130, fontWeight: '700', color: '#2563EB' }]}>
                  {formatMoney(item.realCorpusInflationAdjusted)}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>No breakdown data available.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 10 },
  headerRow: { backgroundColor: '#F8FAFC', borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  cell: { fontSize: 12, color: '#334155' },
  headerCell: { fontWeight: '700', color: '#475569' },
});