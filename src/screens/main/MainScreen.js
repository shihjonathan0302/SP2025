// screens/main/MainScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as db from '../../services/db';

/* 小工具：今天 YYYY-MM-DD */
function todayYMD() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/* 小工具：格式化日期 → Wed Nov 19 2025 */
function formatHeaderDate(ymd) {
  try {
    const d = new Date(ymd);
    if (Number.isNaN(d.getTime())) return ymd;
    return d.toDateString();
  } catch {
    return ymd;
  }
}

/* 小工具：這一天相對於今天的文字（Today / Tomorrow / 2 days ago ...） */
const MS_PER_DAY = 24 * 60 * 60 * 1000;
function relativeLabel(ymd) {
  try {
    const today = new Date(todayYMD());
    const target = new Date(ymd);
    const diff = Math.round((target - today) / MS_PER_DAY); // 正數=未來, 負數=過去

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1) return `In ${diff} days`;
    // diff <= -2
    return `${Math.abs(diff)} days ago`;
  } catch {
    return 'Selected day';
  }
}

/* 產生橫條上要顯示的 7 天（中心為 selectedDate） */
function buildStripDates(centerYMD, range = 3) {
  const dates = [];
  const center = new Date(centerYMD);

  for (let offset = -range; offset <= range; offset += 1) {
    const d = new Date(center);
    d.setDate(d.getDate() + offset);
    const ymd = d.toISOString().slice(0, 10);
    const week = d.toLocaleDateString(undefined, { weekday: 'short' }); // Mon, Tue...
    const day = d.getDate();
    dates.push({ ymd, week, day });
  }

  return dates;
}

export default function MainScreen() {
  const [selectedDate, setSelectedDate] = useState(todayYMD());
  const [loading, setLoading] = useState(true);
  const [subgoals, setSubgoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showMonth, setShowMonth] = useState(false);

  const loadForDate = useCallback(
    async (dateString) => {
      try {
        setLoading(true);
        const rows = await db.listSubgoalsForDate(dateString);
        setSubgoals(rows);
      } catch (e) {
        console.error('[MainScreen] loadForDate error:', e);
        Alert.alert('Error', e.message || 'Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadForDate(selectedDate);
  }, []);

  const changeDate = (ymd) => {
    setSelectedDate(ymd);
    loadForDate(ymd);
  };

  const shiftDays = (delta) => {
    try {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + delta);
      const next = d.toISOString().slice(0, 10);
      changeDate(next);
    } catch (e) {
      console.error('[MainScreen] shiftDays error:', e);
    }
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    changeDate(dateStr);
    setShowMonth(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadForDate(selectedDate);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSubgoal = async (item) => {
    try {
      const toDone = item.status !== 'done';
      const updated = await db.toggleSubgoalDone(item.id, toDone);
      setSubgoals((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: updated.status } : s))
      );
    } catch (e) {
      console.error('[MainScreen] toggleSubgoal error:', e);
      Alert.alert('Error', e.message || 'Failed to update status.');
    }
  };

  const renderSubgoalItem = ({ item }) => {
    const done = item.status === 'done';

    return (
      <View style={styles.taskCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalTitle}>{item.goal_title || 'Untitled Goal'}</Text>
          <Text
            style={[
              styles.subgoalTitle,
              done && { textDecorationLine: 'line-through', color: '#9CA3AF' },
            ]}
          >
            {item.subgoal_title}
          </Text>
          <View style={styles.metaRow}>
            {item.phase_number != null && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Phase {item.phase_number}</Text>
              </View>
            )}
            {item.goal_category && (
              <View style={[styles.chip, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[styles.chipText, { color: '#4F46E5' }]}>{item.goal_category}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => toggleSubgoal(item)}
          style={styles.checkBox}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>{done ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const headerLabel = relativeLabel(selectedDate);      // 🔹 動態顯示 Today / Tomorrow / ... 
  const headerDate = formatHeaderDate(selectedDate);
  const stripDates = buildStripDates(selectedDate, 3);
  const markedDates = { [selectedDate]: { selected: true, selectedColor: '#2563EB' } };

  return (
    <View style={styles.container}>
      {/* 上方日期區塊（左邊顯示「Today / In 3 days」+ 完整日期，右邊保留 Today 按鈕） */}
      <View style={styles.todayBlock}>
        <View>
          <Text style={styles.todayLabel}>{headerLabel}</Text>
          <Text style={styles.todayDate}>{headerDate}</Text>
        </View>

        <TouchableOpacity
          style={styles.todayBtn}
          onPress={() => {
            const t = todayYMD();
            setShowMonth(false);
            changeDate(t);
          }}
        >
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* 一條「7 天橫條」 */}
      <View style={styles.dayStrip}>
        <TouchableOpacity
          onPress={() => shiftDays(-3)}
          style={styles.navArrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.dayStripCenter}>
          {stripDates.map((d) => {
            const isSelected = d.ymd === selectedDate;
            return (
              <TouchableOpacity
                key={d.ymd}
                onPress={() => {
                  if (isSelected) {
                    setShowMonth((v) => !v);
                  } else {
                    setShowMonth(false);
                    changeDate(d.ymd);
                  }
                }}
                style={[styles.dayPill, isSelected && styles.dayPillSelected]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.dayPillWeek, isSelected && styles.dayPillWeekSelected]}
                >
                  {d.week}
                </Text>
                <Text
                  style={[styles.dayPillDate, isSelected && styles.dayPillDateSelected]}
                >
                  {d.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => shiftDays(3)}
          style={styles.navArrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 展開月曆 */}
      {showMonth && (
        <Calendar
          current={selectedDate}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          enableSwipeMonths={true}
          style={styles.calendar}
          theme={{
            todayTextColor: '#2563EB',
            arrowColor: '#111827',
          }}
        />
      )}

      {/* Tasks Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Tasks for this day</Text>
        <Text style={styles.listCount}>{subgoals.length} item(s)</Text>
      </View>

      {/* Tasks List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : subgoals.length === 0 ? (
        <Text style={styles.emptyText}>No tasks for this day.</Text>
      ) : (
        <FlatList
          data={subgoals}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSubgoalItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 8 },

  todayBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  todayDate: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  todayBtnText: { fontSize: 13, color: '#111827', fontWeight: '600' },

  dayStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navArrow: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: { fontSize: 20, color: '#111827', fontWeight: '600' },

  dayStripCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 999,
    flex: 1,
    marginHorizontal: 2,
  },
  dayPillSelected: {
    backgroundColor: '#2563EB',
  },
  dayPillWeek: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  dayPillWeekSelected: {
    color: '#E5E7EB',
  },
  dayPillDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  dayPillDateSelected: {
    color: '#FFFFFF',
  },

  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  listCount: { fontSize: 12, color: '#9CA3AF' },

  taskCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  goalTitle: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  subgoalTitle: { fontSize: 15, color: '#111827', marginBottom: 6 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },

  checkBox: { justifyContent: 'center', alignItems: 'center', paddingLeft: 8 },

  emptyText: { marginTop: 16, textAlign: 'center', color: '#9CA3AF' },
});