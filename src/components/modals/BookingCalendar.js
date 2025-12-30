import React from 'react';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';

const availableDays = ['mon', 'tue', 'thu', 'fri'];

const getInitialMarkedDates = (availableDays, referenceDate = moment()) => {
  const marked = {};
  const start = referenceDate.clone();
  const end = referenceDate.clone().add(6, 'months');

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = m.format('ddd').toLowerCase();
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(referenceDate, 'day');
    const isAvailable = availableDays.includes(dayName);

    marked[dateStr] =
      isPast || !isAvailable
        ? {
            disabled: true,
            disableTouchEvent: true,
            customStyles: {
              container: {backgroundColor: '#f0f0f0'},
              text: {color: '#999'},
            },
          }
        : {
            disabled: false,
            customStyles: {
              container: {backgroundColor: '#fff'},
              text: {color: '#000'},
            },
          };
  }

  return marked;
};

const BookingCalendar = ({markedDates, onDayPress, referenceDate}) => {
  return (
    <Calendar
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="custom"
      minDate={referenceDate.format('YYYY-MM-DD')}
      maxDate={referenceDate
        .clone()
        .add(6, 'months')
        .format('YYYY-MM-DD')}
      theme={{
        todayTextColor: 'red',
        arrowColor: 'blue',
      }}
      disableAllTouchEventsForDisabledDays
    />
  );
};

export {getInitialMarkedDates};
export default BookingCalendar;
