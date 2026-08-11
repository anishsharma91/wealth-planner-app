// # Currency selection modal

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Currency, CURRENCY_CONFIG } from '../hooks/useWealthPlanner';

interface Props {
  visible: boolean;
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
  onClose: () => void;
}

export const CurrencyModal: React.FC<Props> = ({ visible, selectedCurrency, onSelectCurrency, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Display Currency</Text>
        {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((currKey) => (
          <TouchableOpacity
            key={currKey}
            style={[styles.modalOption, selectedCurrency === currKey && styles.modalOptionActive]}
            onPress={() => { onSelectCurrency(currKey); onClose(); }}
          >
            <Text style={[styles.modalOptionText, selectedCurrency === currKey && styles.modalOptionTextActive]}>
              {CURRENCY_CONFIG[currKey].label}
            </Text>
            {selectedCurrency === currKey && <Ionicons name="checkmark-circle" size={18} color="#2563EB" />}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 320, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionActive: { backgroundColor: '#F8FAFC' },
  modalOptionText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  modalOptionTextActive: { color: '#2563EB', fontWeight: '700' },
});