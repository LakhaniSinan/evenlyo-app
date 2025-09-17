import moment from 'moment';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import CustomCalendar from '../customCalendar';

const DateSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  containerStyle,
  mode = 'range', // 'single' or 'range'
  placeholder = 'Select Date',
}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('start'); // 'start' or 'end'

  const formatDate = date => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    return moment(date).format('MM/DD/YYYY');
  };

  const handleDateSelect = (selectedStartDate, selectedEndDate) => {
    if (mode === 'single') {
      if (calendarMode === 'start' && onStartDateChange) {
        onStartDateChange(selectedStartDate);
      } else if (calendarMode === 'end' && onEndDateChange) {
        onEndDateChange(selectedStartDate);
      }
    } else {
      // Range mode - single date selection per modal
      if (calendarMode === 'start' && onStartDateChange) {
        onStartDateChange(selectedStartDate);
      } else if (calendarMode === 'end' && onEndDateChange) {
        onEndDateChange(selectedStartDate);
      }
    }
    setShowCalendar(false);
  };

  const openCalendarForStart = () => {
    setCalendarMode('start');
    setShowCalendar(true);
  };

  const openCalendarForEnd = () => {
    setCalendarMode('end');
    setShowCalendar(true);
  };

  if (mode === 'single') {
    return (
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={openCalendarForStart}>
          <Text
            style={[
              styles.dateText,
              {color: startDate ? COLORS.textDark : COLORS.textLight},
            ]}>
            {formatDate(startDate) || placeholder}
          </Text>
        </TouchableOpacity>

        <CustomCalendar
          isVisible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onDateSelect={handleDateSelect}
          selectedStartDate={startDate}
          selectedEndDate={null}
          mode="single"
          title={t('Select Date') || 'Select Date'}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dateRow}>
        {/* Start Date */}
        <View style={styles.dateSection}>
          <Text style={styles.label}>{t('Start Date') || 'Start Date'}</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              showCalendar && calendarMode === 'end' && styles.disabledButton,
            ]}
            disabled={showCalendar && calendarMode === 'end'}
            onPress={openCalendarForStart}>
            <Text
              style={[
                styles.dateText,
                {color: startDate ? COLORS.textDark : COLORS.textLight},
              ]}>
              {formatDate(startDate) || t('Select Date') || 'Select Date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.dateSection}>
          <Text style={styles.label}>{t('End Date') || 'End Date'}</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              showCalendar && calendarMode === 'start' && styles.disabledButton,
            ]}
            disabled={showCalendar && calendarMode === 'start'}
            onPress={openCalendarForEnd}>
            <Text
              style={[
                styles.dateText,
                {color: endDate ? COLORS.textDark : COLORS.textLight},
              ]}>
              {formatDate(endDate) || t('Select Date') || 'Select Date'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Calendar Modal */}
      <CustomCalendar
        isVisible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedStartDate={calendarMode === 'start' ? startDate : null}
        selectedEndDate={calendarMode === 'end' ? endDate : null}
        mode="single"
        title={
          calendarMode === 'start'
            ? t('selectStartDate') || 'Select Start Date'
            : t('selectEndDate') || 'Select End Date'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: width(3),
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateSection: {
    flex: 1,
    marginHorizontal: width(0.5),
  },
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
  disabledButton: {
    backgroundColor: COLORS.semiLightText,
    opacity: 0.6,
  },
  dateText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default DateSelector;
