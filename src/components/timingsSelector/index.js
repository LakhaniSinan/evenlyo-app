import moment from 'moment';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const TimeSelector = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  containerStyle,
  modalRef,
}) => {
  const {t} = useTranslation();

  const [openPicker, setOpenPicker] = useState(false);
  const [type, setType] = useState(null); // 'start' | 'end'

  const openTimePicker = pickerType => {
    setType(pickerType);
    setOpenPicker(true);
  };

  const onConfirm = date => {
    setOpenPicker(false);

    // ✅ Start Time Validation
    if (type === 'start') {
      if (endTime && moment(date).isSameOrAfter(endTime)) {
        modalRef.current.show({
          status: 'error',
          message: t('Start time must be before end time'),
        });

        return;
      }
      onStartTimeChange?.(date);
    }

    // ✅ End Time Validation
    if (type === 'end') {
      if (startTime && moment(date).isSameOrBefore(startTime)) {
        modalRef.current.show({
          status: 'error',
          message: t('End time must be after start time'),
        });
        return;
      }
      onEndTimeChange?.(date);
    }
  };

  const formatTime = time => (time ? moment(time).format('hh:mm A') : '--');

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        {/* Start Time */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('Start Time') || 'Start Time'}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => openTimePicker('start')}>
            <Text style={styles.timeText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('End Time') || 'End Time'}</Text>
          <TouchableOpacity
            disabled={!startTime}
            style={[styles.button, !startTime && {opacity: 0.5}]}
            onPress={() => openTimePicker('end')}>
            <Text style={styles.timeText}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={openPicker}
        mode="time"
        date={new Date()}
        onConfirm={onConfirm}
        onCancel={() => setOpenPicker(false)}
      />
    </View>
  );
};

export default TimeSelector;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    marginTop: width(3),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  section: {
    flex: 1,
    marginHorizontal: width(0.5),
  },

  label: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    fontSize: 12,
    marginBottom: width(2),
  },

  button: {
    height: width(13),
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    paddingHorizontal: width(4),
    borderRadius: width(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  timeText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.black,
  },
});
