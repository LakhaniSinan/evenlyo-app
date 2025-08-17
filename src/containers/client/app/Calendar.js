import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {COLORS} from '../../../constants';

const Calendar = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}>
      <Text>Calendar</Text>
    </SafeAreaView>
  );
};

export default Calendar;
