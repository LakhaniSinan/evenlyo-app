import moment from 'moment';
import React, {useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const CustomCalendar = ({
  isVisible,
  onClose,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
}) => {
  const {t} = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [tempStartDate, setTempStartDate] = useState(
    selectedStartDate || selectedEndDate,
  );
  const [tempEndDate, setTempEndDate] = useState(null);

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week').add(1, 'day');
    const endOfWeek = endOfMonth.clone().endOf('week').add(1, 'day');

    const days = [];
    const day = startOfWeek.clone();

    while (day.isBefore(endOfWeek)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };

  const isDateInRange = date => {
    if (!tempStartDate || !tempEndDate) return false;
    return date.isBetween(tempStartDate, tempEndDate, 'day', '[]');
  };

  const isStartDate = date => {
    return tempStartDate && date.isSame(tempStartDate, 'day');
  };

  const isEndDate = date => {
    return tempEndDate && date.isSame(tempEndDate, 'day');
  };

  const handleDatePress = date => {
    if (onDateSelect) {
      onDateSelect(date);
    }
    onClose();
  };

  const navigateMonth = direction => {
    setCurrentMonth(prev => prev.clone().add(direction, 'month'));
  };

  const renderDay = date => {
    const isCurrentMonth = date.month() === currentMonth.month();
    const isToday = date.isSame(moment(), 'day');
    const isSelected = isStartDate(date) || isEndDate(date);
    const isInRange = isDateInRange(date);
    const isPast = date.isBefore(moment(), 'day');

    return (
      <TouchableOpacity
        key={date.format('YYYY-MM-DD')}
        style={[
          styles.dayContainer,
          isSelected && styles.selectedDay,
          isInRange && !isSelected && styles.rangeDay,
          !isCurrentMonth && styles.otherMonthDay,
          isPast && styles.pastDay,
        ]}
        onPress={() => !isPast && isCurrentMonth && handleDatePress(date)}
        disabled={isPast || !isCurrentMonth}>
        <Text
          style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isInRange && !isSelected && styles.rangeDayText,
            !isCurrentMonth && styles.otherMonthText,
            isPast && styles.pastDayText,
            isToday && !isSelected && styles.todayText,
          ]}>
          {date.date()}
        </Text>
      </TouchableOpacity>
    );
  };

  const calendarDays = generateCalendarDays();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}>
              <Ionicons name="arrow-back" size={15} color="black" />
            </TouchableOpacity>

            <Text style={styles.monthYear}>
              {currentMonth.format('MMMM YYYY')}
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(1)}>
              <Ionicons name="arrow-forward-outline" size={15} color="black" />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map(day => (
              <View key={day} style={styles.weekDayContainer}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView style={styles.calendarScroll}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekContainer}>
                {week.map(renderDay)}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: width(6),
    margin: width(5),
    maxHeight: height(70),
    width: width(90),
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width(20),
    paddingVertical: width(4),
  },
  navButton: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.black,
    borderWidth: 1,
    borderRadius: 100,
  },
  monthYear: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textDark,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: width(3),
    paddingBottom: width(2),
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 10,
    color: COLORS.textLight,
  },
  calendarScroll: {
    maxHeight: height(40),
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: width(3),
  },
  dayContainer: {
    flex: 1,
    height: width(9),
    justifyContent: 'center',
    alignItems: 'center',
    margin: width(0.5),
    borderRadius: width(2),
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  rangeDay: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
    backgroundColor: COLORS.primaryLight,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  pastDay: {
    opacity: 0.4,
  },
  dayText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 10,
    color: COLORS.textDark,
  },
  selectedDayText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  rangeDayText: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  otherMonthText: {
    color: COLORS.textLight,
  },
  pastDayText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textLight,
  },
  todayText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.primary,
  },
});

export default CustomCalendar;
