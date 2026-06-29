import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const DateSelector = ({
  date,
  onDateChange,
  containerStyle,
  placeholder = 'Select Date',
}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    date ? moment(date).format('YYYY-MM-DD') : null,
  );

  useEffect(() => {
    setSelectedDate(date ? moment(date).format('YYYY-MM-DD') : null);
  }, [date]);

  const formatDate = d => (d ? moment(d).format('DD/MM/YYYY') : placeholder);

  const openCalendar = () => setShowCalendar(true);
  const closeCalendar = () => setShowCalendar(false);

  const onDayPress = day => {
    const selected = day.dateString;

    setSelectedDate(selected);
    onDateChange && onDateChange(new Date(selected));
    closeCalendar();
  };

  const markedDates = selectedDate
    ? {
        [selectedDate]: {
          selected: true,
          selectedColor: COLORS.primary,
        },
      }
    : {};

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{t('Select Date') || 'Select Date'}</Text>

      <TouchableOpacity style={styles.dateButton} onPress={openCalendar}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={closeCalendar}>
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeCalendar} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              markedDates={markedDates}
              onDayPress={onDayPress}
              current={selectedDate || moment().format('YYYY-MM-DD')}
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

export default DateSelector;

const styles = StyleSheet.create({
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
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: width(1),
  },
  closeButton: {
    paddingHorizontal: width(2),
    paddingVertical: width(1),
  },
  closeButtonText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.textDark,
  },
});
