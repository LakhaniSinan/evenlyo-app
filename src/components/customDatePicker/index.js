import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Switch} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const DateRangePicker = ({
  startDate = new Date(),
  setStartDate = () => {},
  endDate = new Date(),
  setEndDate = () => {},
  onChangeSingleDay = () => {},
  singleDay = false,
}) => {
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [isSingleDay, setIsSingleDay] = useState(singleDay);

  React.useEffect(() => {
    setIsSingleDay(singleDay);
  }, [singleDay]);

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

  const formatDate = useMemo(() => {
    const options = {month: 'short', day: 'numeric', year: 'numeric'};
    return date => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Select date';
      }
      return date.toLocaleDateString(undefined, options);
    };
  }, []);

  React.useEffect(() => {
    if (isSingleDay) {
      setEndDate(startDate);
    }
  }, [isSingleDay, startDate, setEndDate]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Single day event</Text>
        <Switch
          value={isSingleDay}
          onValueChange={value => {
            setIsSingleDay(value);
            onChangeSingleDay(value);
            if (value) {
              setEndDate(startDate);
            }
          }}
          thumbColor={isSingleDay ? COLORS.primary : COLORS.white}
          trackColor={{false: COLORS.border, true: COLORS.primaryLight}}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            onPress={() => setOpenStartDate(true)}
            style={styles.dateInput}>
            <View>
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </View>
            <DatePicker
              modal
              mode="date"
              open={openStartDate}
              date={startDate}
              onConfirm={date => {
                setOpenStartDate(false);
                setStartDate(date);
              }}
              onCancel={() => {
                setOpenStartDate(false);
              }}
            />
          </TouchableOpacity>
        </View>

        {!isSingleDay && (
          <View style={[styles.cell, {marginRight: 0}]}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              onPress={() => setOpenEndDate(true)}
              style={styles.dateInput}>
              <View>
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </View>
              <DatePicker
                modal
                mode="date"
                open={openEndDate}
                date={endDate}
                onConfirm={date => {
                  setOpenEndDate(false);
                  setEndDate(date);
                }}
                onCancel={() => {
                  setOpenEndDate(false);
                }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setOpenStartTime(true)}>
            <View>
              <Text style={styles.dateText}>{formatTime(startDate)}</Text>
            </View>
            <DatePicker
              modal
              mode="time"
              open={openStartTime}
              date={startDate}
              onConfirm={date => {
                setOpenStartTime(false);
                setStartDate(date);
              }}
              onCancel={() => {
                setOpenStartTime(false);
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.cell, {marginRight: 0}]}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            onPress={() => setOpenEndTime(true)}
            style={styles.dateInput}>
            <View>
              <Text style={styles.dateText}>{formatTime(endDate)}</Text>
            </View>
            <DatePicker
              modal
              mode="time"
              open={openEndTime}
              date={endDate}
              onConfirm={date => {
                setOpenEndTime(false);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEndTime(false);
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  container: {
    marginTop: width(4),
    marginVertical: width(2),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(3),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: width(3),
  },
  cell: {
    flex: 1,
    marginRight: width(3),
  },
  dateContainer: {
    marginBottom: width(3),
  },
  label: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
    fontSize: 12,
    marginBottom: width(1),
  },
  dateInput: {
    borderRadius: width(100),
    padding: width(4),
    borderWidth: 1,
    borderColor: COLORS.textLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  dateText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
  },
});
