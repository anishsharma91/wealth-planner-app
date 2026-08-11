// # Logo, Currency Picker, PDF Export

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  currency: string;
  onOpenCurrencyModal: () => void;
  onExportPDF: () => void;
}

export const HeaderBar: React.FC<Props> = ({ currency, onOpenCurrencyModal, onExportPDF }) => (
  <View style={styles.headerContainer}>
    <View style={styles.topRow}>
      <View style={styles.brandGroup}>
        <View style={styles.logoBadge}>
          <Ionicons name="pulse" size={20} color="#38BDF8" />
        </View>
        <Text style={styles.brandTitle}>Wealth<Text style={styles.brandAccent}>Pulse</Text></Text>
      </View>
      <View style={styles.actionGroup}>
        <TouchableOpacity style={styles.currencyChip} onPress={onOpenCurrencyModal} activeOpacity={0.7}>
          <Ionicons name="globe-outline" size={14} color="#38BDF8" />
          <Text style={styles.currencyText}>{currency}</Text>
          <Ionicons name="chevron-down" size={12} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pdfButton} onPress={onExportPDF} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={15} color="#FFFFFF" />
          <Text style={styles.pdfButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.taglineBadge}>
      <View style={styles.pulseDot} />
      <Text style={styles.taglineText}>FIRE & Hybrid Wealth Planner</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: { backgroundColor: '#0F172A', paddingTop: Platform.OS === 'android' ? 36 : 12, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  brandAccent: { color: '#38BDF8' },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencyChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: '#334155', gap: 4 },
  currencyText: { color: '#F1F5F9', fontSize: 12, fontWeight: '700' },
  pdfButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 4 },
  pdfButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  taglineBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.5)', gap: 6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  taglineText: { color: '#94A3B8', fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
});