import moment from 'moment';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const statusColors = {
  pending: '#FFA500', // Orange
  accepted: '#32CD32', // Green
  rejected: '#FF4C4C', // Red
  completed: '#0080FF', // Blue
  paid: '#0080FF', // same as completed
  default: '#808080', // Gray
};

const timeSlots = Array.from({length: 24}, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? 'am' : 'pm';
  return `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
});

function DailyCalendar({
  listingCartData = [],
  onEventPress,
  selectedDate,
  goBack,
}) {
  const selected = moment(selectedDate).startOf('day');
  const dayName = selected.format('dddd');
  const showDate = selected.format('DD/MM/YYYY');

  const filteredBookings = listingCartData.filter(item =>
    moment.utc(item.startDate).local().isSame(selected, 'day'),
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.dateText}>{showDate}</Text>
      </View>

      <ScrollView style={{flex: 1}}>
        {timeSlots.map((slot, index) => {
          const slotTime = moment(slot, ['hh:mm a']).format('HH:mm');
          const slotEvents = filteredBookings.filter(event => {
            if (!event.startTime) return index === 0;
            const eventTime = moment(event.startTime, [
              'hh:mm a',
              'HH:mm',
            ]).format('HH:mm');
            return eventTime === slotTime;
          });

          return (
            <View key={index} style={styles.timeRow}>
              <Text style={styles.timeText}>{slot}</Text>
              <View style={styles.eventContainer}>
                {slotEvents.length > 0 &&
                  slotEvents.map((event, i) => {
                    const color =
                      statusColors[event?.status?.toLowerCase()] ||
                      statusColors.default;
                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => onEventPress && onEventPress(event)}
                        style={[
                          styles.eventBox,
                          {backgroundColor: color + '20', borderColor: color},
                        ]}>
                        <Text style={[styles.eventTitle, {color}]}>
                          {event?.title?.en || 'Untitled'} — {event?.status}
                        </Text>

                        <Text style={[styles.eventTime, {color}]}>
                          {event?.startTime || 'All Day'}
                        </Text>

                        <Text style={styles.location}>
                          📍 {event?.location || 'Unknown'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
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
    color: COLORS.textLight,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  eventTime: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  location: {
    fontSize: 9,
    color: '#666',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});
