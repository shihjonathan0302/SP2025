// screens/createGoal/StepCategorySelect.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GraduationCap, Briefcase, Heart, BookOpen } from 'lucide-react-native';

const CATEGORIES = [
  {
    key: 'Academic and Education',
    label: 'Academic & Education',
    desc: 'Exams, research, or academic progress',
    icon: GraduationCap,
  },
  {
    key: 'Career and Professional',
    label: 'Career & Professional',
    desc: 'Internships, skills, or portfolio',
    icon: Briefcase,
  },
  {
    key: 'Personal and Lifestyle',
    label: 'Personal & Lifestyle',
    desc: 'Fitness, travel, or health goals',
    icon: Heart,
  },
  {
    key: 'Habits and Learning',
    label: 'Habits & Learning',
    desc: 'Daily learning or new habits',
    icon: BookOpen,
  },
];

export default function StepCategorySelect({ formData, updateFormData, nextStep }) {
  const [tapped, setTapped] = useState(null);

  const handleSelect = (key) => {
    setTapped(key);
    updateFormData({ category: key });
    // 給 180ms 看見選中樣式，再前進
    setTimeout(nextStep, 180);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Select a Goal Type</Text>

      {CATEGORIES.map((cat) => {
        const selected = formData.category === cat.key || tapped === cat.key;
        const Icon = cat.icon;
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.92}
            onPress={() => handleSelect(cat.key)}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon size={22} color={selected ? '#2563EB' : '#6B7280'} />
              </View>

              {/* 這塊必須 minWidth:0 + flexShrink:1 才會換行不截字 */}
              <View style={styles.textWrap}>
                <Text style={[styles.label, selected && styles.labelSelected]}>
                  {cat.label}
                </Text>
                <Text style={[styles.desc, selected && styles.descSelected]}>
                  {cat.desc}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // 讓整個內容直接鋪在白卡片上，不再額外鋪灰底，避免「看到一圈白邊」
  container: {
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    transform: [{ scale: 1 }],
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F3F8FF',
    shadowOpacity: 0.12,
    transform: [{ scale: 0.99 }], // 微縮：按下視覺回饋
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  textWrap: {
    flexShrink: 1,
    minWidth: 0,         // 🔑 讓長字可以換行
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  labelSelected: {
    color: '#1E3A8A',
  },
  desc: {
    fontSize: 15,
    lineHeight: 20,
    color: '#6B7280',
  },
  descSelected: {
    color: '#1D4ED8',
  },
});