import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import moment from 'moment';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const TimeRangeSelector = ({
  isSingleDateSelected,
  startTime,
  endTime,
  showStartPicker,
  setShowStartPicker,
  showEndPicker,
  setShowEndPicker,
  setStartTime,
  setEndTime,
}) => {
  if (!isSingleDateSelected) {return null;}

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Time Range *</Text>
      <View style={styles.dateRangeContainer}>
        {[
          {
            label: 'Start Time',
            value: startTime,
            setter: setShowStartPicker,
          },
          {label: 'End Time', value: endTime, setter: setShowEndPicker},
        ].map(({label, value, setter}, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.dateInput, idx === 0 && {marginRight: 10}]}
            onPress={() => setter(true)}>
            <Text style={styles.dateInputText}>
              {value ? moment(value).format('hh:mm A') : label}
            </Text>
            <Image
              source={ICONS.clockIcon}
              style={styles.iconSmall}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
      <DatePicker
        modal
        open={showStartPicker}
        date={startTime || new Date()}
        mode="time"
        onConfirm={date => {
          setShowStartPicker(false);
          setStartTime(date);
        }}
        onCancel={() => setShowStartPicker(false)}
      />
      <DatePicker
        modal
        open={showEndPicker}
        date={endTime || new Date()}
        mode="time"
        onConfirm={date => {
          setShowEndPicker(false);
          setEndTime(date);
        }}
        onCancel={() => setShowEndPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {marginBottom: width(4)},
  label: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  dateRangeContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  dateInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dateInputText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  iconSmall: {height: width(5), width: width(5)},
});

export default TimeRangeSelector;
