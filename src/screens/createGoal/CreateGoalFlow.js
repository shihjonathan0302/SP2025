// screens/createGoal/CreateGoalFlow.js
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';

// 匯入所有步驟頁面
import StepCategorySelect from './StepCategorySelect';
import StepCommonFields from './StepCommonFields';
import StepCategoryFields from './StepCategoryFields';
import StepPhaseSelect from './StepPhaseSelect';
import StepReview from './StepReview';

// 主流程控制組件
export default function CreateGoalFlow({ navigation }) {
  // ✅ 1️⃣ 全域表單資料
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    startDate: new Date(),
    targetDate: new Date(),
    numPhases: 4,
    categoryFields: {}, // 類型特定問題
  });

  // ✅ 2️⃣ 流程控制
  const [step, setStep] = useState(0);
  const steps = [
    StepCategorySelect,
    StepCommonFields,
    StepCategoryFields,
    StepPhaseSelect,
    StepReview,
  ];
  const StepComponent = steps[step];

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // ✅ 3️⃣ 更新表單資料
  const updateForm = (updates) => setFormData((prev) => ({ ...prev, ...updates }));

  // ✅ 4️⃣ 返回主頁（完成流程後）
  const goBackToMain = () => {
    navigation.navigate('Main');
  };

  // ✅ 5️⃣ 渲染內容
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <StepComponent
          formData={formData}
          updateForm={updateForm}
          nextStep={nextStep}
          prevStep={prevStep}
          navigation={navigation}
          goBackToMain={goBackToMain}
        />
      </View>

      {/* 底部導航按鈕 */}
      <View style={styles.navBtns}>
        {step > 0 && <Button title="← Back" onPress={prevStep} />}
        {step < steps.length - 1 && <Button title="Next →" onPress={nextStep} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  content: { flex: 1, justifyContent: 'center' },
  navBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});