// screens/SocialScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SocialScreen() {
  const navigation = useNavigation();

  const [friends, setFriends] = useState([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');

  const addFriend = () => {
    if (!inviteCode.trim() && !username.trim()) return;
    const id = String(Date.now());
    setFriends(prev => [
      ...prev,
      {
        id,
        name: username.trim() || `User-${inviteCode.trim()}`,
      },
    ]);
    setInviteCode('');
    setUsername('');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('FriendDetail', { friend: item })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarIcon}>👤</Text>
      </View>
      <Text style={styles.friendName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends List</Text>

      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<Text style={styles.empty}>No friends yet</Text>}
        contentContainerStyle={friends.length === 0 && { flex: 1, justifyContent: 'center' }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Friend</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Invitation Code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="none"
            />
            <Text style={styles.orText}>or</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button title="Add" onPress={addFriend} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Button title="Cancel" color="#999" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: { fontSize: 20, color: '#555' },
  friendName: { fontSize: 16, fontWeight: '600' },
  sep: { height: 10 },
  empty: { color: '#666', textAlign: 'center' },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%', backgroundColor: '#fff', padding: 20,
    borderRadius: 12, elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 10, marginBottom: 12, backgroundColor: '#fafafa',
  },
  orText: { textAlign: 'center', marginVertical: 4, color: '#666' },
  modalButtons: { flexDirection: 'row', marginTop: 8 },
});
