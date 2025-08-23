import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const DateRangePicker = ({
  startDate = new Date(),
  setStartDate = () => {},
  endDate = new Date(),
  setEndDate = () => {},
  setOpenStart = () => {},
  openEnd = false,
  setOpenEnd = () => {},
  openStart = false,
}) => {
  const formatTime = date => {
    // Ensure date is a valid Date object
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '12:00 PM'; // Default time if date is invalid
    }

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    // Ensure minutes are always 2 digits
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Start Time</Text>
        <View style={styles.dateInput}>
          <TouchableOpacity onPress={() => setOpenStart(true)}>
            <Text style={styles.dateText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            mode="time"
            open={openStart}
            date={startDate}
            onConfirm={date => {
              setOpenStart(false);
              setStartDate(date);
            }}
            onCancel={() => {
              setOpenStart(false);
            }}
          />
        </View>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.label}>End Time</Text>
        <View style={styles.dateInput}>
          <TouchableOpacity onPress={() => setOpenEnd(true)}>
            <Text style={styles.dateText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            mode="time"
            open={openEnd}
            date={endDate}
            onConfirm={date => {
              setOpenEnd(false);
              setEndDate(date);
            }}
            onCancel={() => {
              setOpenEnd(false);
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  container: {
    marginTop: width(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: width(2),
  },
  dateContainer: {
    flex: 1,
    width: width(41),
    backgroundColor: 'red',
  },
  label: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
    fontSize: 12,
    marginBottom: width(2),
  },
  dateInput: {
    marginRight: width(3),
    borderRadius: width(100),
    padding: width(4),
    borderWidth: 1,
    borderColor: COLORS.textLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  dateText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
  },
});
