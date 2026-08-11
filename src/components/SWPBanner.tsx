// # Navigation banner

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SWPBanner: React.FC = () => (
  <View style={styles.swpBanner}>
    <View style={{ flex: 1 }}>
      <Text style={styles.swpBannerTitle}>Plan Retirement Withdrawals?</Text>
      <Text style={styles.swpBannerSub}>Simulate post-tax SWP cash flows</Text>
    </View>
    <Link href="/swp" asChild>
      <TouchableOpacity style={styles.swpButton}>
        <Text style={styles.swpButtonText}>SWP Planner</Text>
        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </Link>
  </View>
);

const styles = StyleSheet.create({
  swpBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  swpBannerTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '700' },
  swpBannerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  swpButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, gap: 4 },
  swpButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});