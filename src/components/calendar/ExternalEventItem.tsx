// 外部カレンダーイベント表示コンポーネント
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExternalCalendarEvent } from '../../types/externalCalendar';

interface Props {
  event: ExternalCalendarEvent;
  showDetails?: boolean;
}

export const ExternalEventItem: React.FC<Props> = ({ event, showDetails = false }) => {
  const time = event.isAllDay ? '終日' : formatTime(event.startTime);
  const bgColor = event.calendarColor || '#4285F4';

  return (
    <View style={[s.container, { borderLeftColor: bgColor }]}>
      <Text style={s.time}>{time}</Text>
      <View style={s.content}>
        <Text style={s.title} numberOfLines={1}>{event.title}</Text>
        {showDetails && event.location && (
          <Text style={s.location} numberOfLines={1}>{event.location}</Text>
        )}
      </View>
      <Text style={s.icon}>📅</Text>
    </View>
  );
};

const formatTime = (isoStr: string): string => {
  if (!isoStr.includes('T')) return '終日';
  const d = new Date(isoStr);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 8,
    marginVertical: 2,
  },
  time: {
    fontSize: 12,
    color: '#666',
    width: 45,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#333',
  },
  location: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  icon: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default ExternalEventItem;
