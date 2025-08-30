import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {width} from 'react-native-dimension';
import moment from 'moment'; // ✅ Import moment
import {COLORS, fontFamly} from '../../constants';
import {ICONS} from '../../assets';

const timeSlots = [
  '07:00 am',
  '08:00 am',
  '09:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '01:00 pm',
  '02:00 pm',
  '03:00 pm',
  '04:00 pm',
  '05:00 pm',
  '06:00 pm',
  '07:00 pm',
  '08:00 pm',
  '09:00 pm',
  '10:00 pm',
];

const events = [
  {title: 'New Requests', start: '08:00 am', end: '08:30 am', color: '#FF69B4'},
  {title: 'Reject', start: '10:30 am', end: '03:45 pm', color: '#FF4C4C'},
  {title: 'In Progress', start: '04:00 pm', end: '04:30 pm', color: '#FFA500'},
  {title: 'Completed', start: '09:00 pm', end: '09:30 pm', color: '#32CD32'},
];

function DailyCalendar({onEventPress, selectedDate, goBack}) {
  const dayName = moment(selectedDate).format('dddd');
  const formattedDate = moment(selectedDate).format('DD/MM/YYYY');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={goBack}>
            <Image
              source={ICONS.leftArrowIcon}
              style={{height: 25, width: 25}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.dayText}>{dayName}</Text>
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* Time Slots */}
      <ScrollView style={{flex: 1}}>
        {timeSlots.map((slot, index) => {
          const slotEvents = events.filter(event =>
            event.start.startsWith(slot),
          );
          return (
            <View key={index} style={styles.timeRow}>
              <Text style={styles.timeText}>{slot}</Text>
              <View style={styles.eventContainer}>
                {slotEvents.map((event, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    onPress={() => onEventPress && onEventPress(event)}
                    style={[
                      styles.eventBox,
                      {
                        backgroundColor: event.color + '20',
                        borderColor: event.color,
                      },
                    ]}>
                    <Text style={[styles.eventTitle, {color: event.color}]}>
                      {event.title} {event.start} to {event.end}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default DailyCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    margin: width(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: width(3),
    paddingHorizontal: width(4),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dayText: {
    fontSize: 13,
    fontWeight: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
    marginLeft: width(2),
  },
  dateText: {
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: width(14),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: width(3),
  },
  timeText: {
    width: width(20),
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 10,
  },
  eventContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  eventBox: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  eventTitle: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  eventTime: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
