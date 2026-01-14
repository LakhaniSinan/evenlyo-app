import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const DateSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  containerStyle,
  placeholder = 'Select Date',
}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState({
    start: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
    end: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
  });
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  useEffect(() => {
    setRange({
      start: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
      end: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
    });
  }, [startDate, endDate]);

  const formatDate = date =>
    date ? moment(date).format('DD MMM YYYY') : placeholder;

  const openCalendar = () => {
    setShowCalendar(true);
    setIsSelectingEnd(false);
  };

  const closeCalendar = () => setShowCalendar(false);

  const onDayPress = day => {
    const selected = day.dateString;

    if (!range.start || !isSelectingEnd) {
      setRange({start: selected, end: null});
      onStartDateChange && onStartDateChange(new Date(selected));
      onEndDateChange && onEndDateChange(null);
      setIsSelectingEnd(true);
    } else {
      let start = range.start;
      let end = selected;

      if (moment(selected).isBefore(range.start)) {
        start = selected;
        end = range.start;
      }

      setRange({start, end});
      onStartDateChange && onStartDateChange(new Date(start));
      onEndDateChange && onEndDateChange(new Date(end));
      closeCalendar();
    }
  };

  const getMarkedDates = () => {
    const marked = {};

    if (!range.start) return marked;

    const start = moment(range.start);
    const end = range.end ? moment(range.end) : start;

    let current = start.clone();

    while (current.isSameOrBefore(end)) {
      const date = current.format('YYYY-MM-DD');

      marked[date] = {
        color: COLORS.primary,
        textColor: COLORS.white,
        startingDay: date === range.start,
        endingDay: date === range.end,
      };

      current.add(1, 'day');
    }

    return marked;
  };

  const calendarCurrent = range.start || moment().format('YYYY-MM-DD');

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dateRow}>
        <View style={styles.dateSection}>
          <Text style={styles.label}>{t('Start Date') || 'Start Date'}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={openCalendar}>
            <Text style={styles.dateText}>{formatDate(range.start)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.label}>{t('End Date') || 'End Date'}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={openCalendar}>
            <Text style={styles.dateText}>{formatDate(range.end)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <Calendar
              markingType="period"
              markedDates={getMarkedDates()}
              onDayPress={onDayPress}
              current={calendarCurrent}
              theme={{
                todayTextColor: COLORS.primary,
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.textDark,
                textDayFontFamily: fontFamly.PlusJakartaSansSemiBold,
                textMonthFontFamily: fontFamly.PlusJakartaSansBold,
                textDayHeaderFontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: width(3)},
  dateRow: {flexDirection: 'row', justifyContent: 'space-between'},
  dateSection: {flex: 1, marginHorizontal: width(0.5)},
  label: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    fontSize: 12,
    marginBottom: width(2),
  },
  dateButton: {
    height: width(13),
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    paddingHorizontal: width(4),
    borderRadius: width(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  calendarWrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 10,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  closeText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default DateSelector;
