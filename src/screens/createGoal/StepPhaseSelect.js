// screens/createGoal/StepPhaseSelect.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';

export default function StepPhaseSelect({ formData, updateForm, nextStep, prevStep }) {
  const [selected, setSelected] = useState(formData.numPhases || 4);

  const handleSelect = (n) => {
    setSelected(n);
    updateForm({ numPhases: n });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How many phases do you want?</Text>
      <Text style={styles.subtitle}>
        Choose how many stages your goal will be divided into.
      </Text>

      <View style={styles.phaseRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.phaseBtn, selected === n && styles.selected]}
            onPress={() => handleSelect(n)}
          >
            <Text style={[styles.phaseText, selected === n && styles.selectedText]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
        <Button title="Next →" onPress={nextStep} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30 },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  phaseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  phaseText: { fontSize: 18, fontWeight: '600', color: '#333' },
  selectedText: { color: '#fff' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between' },
});