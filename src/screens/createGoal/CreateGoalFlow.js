// screens/createGoal/CreateGoalFlow.js
import React, { useState, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';
import StepCategorySelect from './StepCategorySelect';
import StepCommon_Page1 from './StepCommon_Page1';
import StepCommon_Page2 from './StepCommon_Page2';
import StepCategoryFields from './StepCategoryFields';
import StepReview from './StepReview';
import StepResult from './StepResult';
import StepDetails_Page1 from './StepDetails_Page1';
import StepDetails_Page2 from './StepDetails_Page2';

export default function CreateGoalFlow({ navigation }) {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    startDate: new Date(),
    etaDays: 30,
    numPhases: 3,
    questions: {},
  });

  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    StepCategorySelect,
    StepCommon_Page1,
    StepCommon_Page2,
    StepDetails_Page1,
    StepDetails_Page2,
    StepReview,
    StepResult,
  ];
  const totalSteps = steps.length;
  const StepComponent = steps[step];

  const updateFormData = (u) => setFormData((p) => ({ ...p, ...u }));

  /* ---------------- Animation Transition ---------------- */
  const animateTransition = (direction = 'next') => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: direction === 'next' ? -20 : 20,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  /* ---------------- Navigation between Steps ---------------- */
  const goNextPage = () => {
    if (step < totalSteps - 1) {
      animateTransition('next');
      setTimeout(() => setStep((s) => s + 1), 160);
    }
  };

  const goPrevPage = () => {
    if (step > 0) {
      animateTransition('prev');
      setTimeout(() => setStep((s) => s - 1), 160);
    }
  };

  /* ---------------- Progress Bar ---------------- */
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateX: translateAnim }] },
      ]}
    >
      {/* 🔵 頂部 Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {step + 1} / {totalSteps}
        </Text>
      </View>

      {/* 🧩 動態載入對應 Step */}
      <StepComponent
        formData={formData}
        updateFormData={updateFormData}
        goNextPage={goNextPage}
        goPrevPage={goPrevPage}
        nextStep={goNextPage} // ✅ 相容舊版命名
        prevStep={goPrevPage}
        navigation={navigation}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    width: '90%',
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
});