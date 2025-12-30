import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {width} from 'react-native-dimension';
import moment from 'moment';
import {COLORS, fontFamly} from '../../constants';

const SelectedDateTimeDisplay = ({localStartDate, localEndDate}) => {
  return (
    <View style={styles.section}>
      <View style={styles.dateTimeHeader}>
        <Text style={styles.label}>Selected Date & Time</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {localStartDate && (
            <Text style={styles.dateValue}>
              {moment(localStartDate).format('dddd, MMMM D')}
            </Text>
          )}
          {localEndDate && (
            <Text style={styles.dateValue}>
              , {moment(localEndDate).format('dddd, MMMM D')}
            </Text>
          )}
        </View>
      </View>
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
  dateTimeHeader: {
    backgroundColor: COLORS.backgroundLight,
    padding: width(4),
    borderRadius: width(3),
    marginTop: width(3),
  },
  dateValue: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
});

export default SelectedDateTimeDisplay;
