// screens/createGoal/StepCommon_Page3.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

const MAX_ADDITIONAL = 280;

export default function StepCommon_Page3({ formData, updateFormData, goPrevPage, goNextPage }) {
  const desc = formData.description ?? '';
  const motive = formData.motivation ?? '';
  const extra = formData.additionalInfo ?? '';

  const onNext = () => {
    // 這頁都是 optional；如果你想要必填可在這裡加驗證
    goNextPage();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Context & Notes</Text>
        <Text style={styles.subtitle}>Keep it brief — we minimize typing to save tokens.</Text>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          placeholder="Background or constraints (e.g., limited gym access)"
          placeholderTextColor="#9CA3AF"
          value={desc}
          onChangeText={(t) => updateFormData({ description: t })}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Motivation (optional)</Text>
        <TextInput
          placeholder="Why this goal matters (e.g., for grad school)"
          placeholderTextColor="#9CA3AF"
          value={motive}
          onChangeText={(t) => updateFormData({ motivation: t })}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Additional Information (optional)</Text>
        <TextInput
          placeholder="Any extra context (≤ 280 chars)"
          placeholderTextColor="#9CA3AF"
          value={extra}
          onChangeText={(t) =>
            updateFormData({ additionalInfo: t.slice(0, MAX_ADDITIONAL) })
          }
          style={[styles.input, styles.multiline]}
          multiline
          maxLength={MAX_ADDITIONAL}
        />
        <Text style={styles.counter}>{(extra ?? '').length} / {MAX_ADDITIONAL}</Text>

        <View style={styles.navBtns}>
          <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
            <Text style={styles.navBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={onNext}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  label: { fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  counter: { textAlign: 'right', color: '#6B7280', marginTop: 4 },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
});