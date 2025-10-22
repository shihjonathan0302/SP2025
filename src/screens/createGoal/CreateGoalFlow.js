// screens/createGoal/CreateGoalFlow.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StepCategorySelect from './StepCategorySelect';
import StepCommonFields from './StepCommonFields';
import StepCategoryFields from './StepCategoryFields';
import StepPhaseSelect from './StepPhaseSelect';
import StepReview from './StepReview';
import StepResult from './StepResult'; // 🆕 新增

export default function CreateGoalFlow({ navigation }) {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    startDate: new Date(),
    targetDate: new Date(),
    etaDays: 30,
    numPhases: 3,
    questions: {},
  });

  const [step, setStep] = useState(0);
  const steps = [
    StepCategorySelect,
    StepCommonFields,
    StepCategoryFields,
    StepPhaseSelect,
    StepReview,
    StepResult,
  ];

  const StepComponent = steps[step];
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));
  const updateFormData = (u) => setFormData((p) => ({ ...p, ...u }));

  return (
    <View style={styles.container}>
      <StepComponent
        formData={formData}
        updateFormData={updateFormData}
        nextStep={nextStep}
        prevStep={prevStep}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
});