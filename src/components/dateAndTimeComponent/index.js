import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateAndTimings = ({dataArray}) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState(new Date(2023, 0, 1, 7, 0)); // default 7 AM
  const [endTime, setEndTime] = useState(new Date(2023, 0, 1, 22, 0)); // default 10 PM

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const calculateHours = () => {
    let diff = (endTime - startTime) / (1000 * 60 * 60);
    return diff > 0 ? diff : 24 + diff; // overnight case handle
  };

  const formatTime = date =>
    date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Date/Time</Text>

      <Text style={styles.subHeading}>Extra Time Cost</Text>
      <View style={styles.daysRow}>
        {days.map((day, idx) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={idx}
              style={styles.dayWrapper}
              onPress={() => toggleDay(day)}>
              {isSelected ? (
                <LinearGradient
                  colors={['#FF295D', '#E31B95', '#C817AE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientBtn}>
                  <Text style={[styles.dayText, {color: 'white'}]}>{day}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveBtn}>
                  <Text style={[styles.dayText, {color: '#666'}]}>{day}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Start Time & End Time */}
      <View style={styles.timeRow}>
        <TouchableOpacity
          style={styles.timeBox}
          onPress={() => setOpenStart(true)}>
          <Text style={styles.label}>Start Time *</Text>
          <Text style={styles.timeText}>{formatTime(startTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeBox}
          onPress={() => setOpenEnd(true)}>
          <Text style={styles.label}>End Time *</Text>
          <Text style={styles.timeText}>{formatTime(endTime)}</Text>
        </TouchableOpacity>
      </View>

      {/* Total Hours */}
      <Text style={styles.totalText}>
        Total <Text style={{color: '#E31B95'}}>({calculateHours()} hours)</Text>
      </Text>

      {/* Start Picker */}
      <DatePicker
        modal
        open={openStart}
        date={startTime}
        mode="time"
        onConfirm={date => {
          setOpenStart(false);
          setStartTime(date);
        }}
        onCancel={() => setOpenStart(false)}
      />

      {/* End Picker */}
      <DatePicker
        modal
        open={openEnd}
        date={endTime}
        mode="time"
        onConfirm={date => {
          setOpenEnd(false);
          setEndTime(date);
        }}
        onCancel={() => setOpenEnd(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: width(1),
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  heading: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subHeading: {
    fontSize: 12,
    marginVertical: width(2),
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  dayWrapper: {
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  inactiveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeBox: {
    flex: 0.48,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: width(4),
    paddingVertical: width(1),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textLight,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default DateAndTimings;
