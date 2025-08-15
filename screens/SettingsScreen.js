// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const settingsOptions = [
  { id: 'EditProfile', title: 'Edit Profile' },
  { id: 'ChangePassword', title: 'Change Password' },
  { id: 'NotificationSettings', title: 'Notification Settings' },
  { id: 'PrivacySettings', title: 'Privacy Settings' },
  { id: 'LanguageSettings', title: 'Language Settings' },
  { id: 'About', title: 'About' },
];

export default function SettingsScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate(item.id)}
    >
      <Text style={styles.itemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: { fontSize: 16 },
});
