// screens/createGoal/StepCommonFields.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StepCommon_Page1 from './StepCommon_Page1';
import StepCommon_Page2 from './StepCommon_Page2';
import StepCommon_Page3 from './StepCommon_Page3';

export default function StepCommonFields({ formData, updateFormData, nextStep, prevStep }) {
  const [page, setPage] = useState(1);

  const goNextPage = () => {
    if (page < 3) setPage(page + 1);
    else nextStep();
  };

  const goPrevPage = () => {
    if (page > 1) setPage(page - 1);
    else prevStep();
  };

  return (
    <View style={styles.container}>
      {page === 1 && (
        <StepCommon_Page1
          formData={formData}
          updateFormData={updateFormData}
          goNextPage={goNextPage}
          goPrevPage={goPrevPage}
        />
      )}
      {page === 2 && (
        <StepCommon_Page2
          formData={formData}
          updateFormData={updateFormData}
          goNextPage={goNextPage}
          goPrevPage={goPrevPage}
        />
      )}
      {page === 3 && (
        <StepCommon_Page3
          formData={formData}
          updateFormData={updateFormData}
          goNextPage={goNextPage}
          goPrevPage={goPrevPage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});