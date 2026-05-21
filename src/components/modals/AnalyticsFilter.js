import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomCalendar from '../customCalendar';
import GradientText from '../gradiantText';

const AnalyticsFilter = ({
  isVisible,
  onClose,
  onApplyFilters,
  onResetFilters,
  filters,
}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    setStartDate(filters?.startDate || '');
    setEndDate(filters?.endDate || '');
  }, [filters?.endDate, filters?.startDate, isVisible]);

  const formatDateLabel = dateValue =>
    dateValue ? moment(dateValue).format('DD/MM/YYYY') : t('DD/MM/YYYY');

  const handleDateSelect = date => {
    const selectedDate = date?.format ? date.format('YYYY-MM-DD') : '';
    if (!selectedDate) {
      return;
    }

    if (activeField === 'endDate') {
      setEndDate(selectedDate);
    } else {
      setStartDate(selectedDate);
    }
  };

  const handleApplyFilters = () => {
    if (
      startDate &&
      endDate &&
      moment(endDate).isBefore(moment(startDate), 'day')
    ) {
      Alert.alert(t('Error'), t('analyticsFilterEndBeforeStart'));
      return;
    }
    onApplyFilters?.({startDate, endDate});
    onClose?.();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    onResetFilters?.();
    onClose?.();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.fields}>
          <Text style={styles.fieldLabel}>{t('Start Date')}</Text>
          <TouchableOpacity
            onPress={() => {
              setActiveField('startDate');
              setShowCalendar(true);
            }}
            style={styles.dateField}>
            <Text style={styles.dateFieldText}>{formatDateLabel(startDate)}</Text>
            <Image
              source={ICONS.calenderIcon}
              style={styles.calendarIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, styles.endDateLabel]}>
            {t('End Date')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setActiveField('endDate');
              setShowCalendar(true);
            }}
            style={styles.dateField}>
            <Text style={styles.dateFieldText}>{formatDateLabel(endDate)}</Text>
            <Image
              source={ICONS.calenderIcon}
              style={styles.calendarIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleResetFilters}
            style={styles.resetButton}
            activeOpacity={0.7}>
            <GradientText text={t('Reset All')} />
          </TouchableOpacity>
          <View style={styles.applyButtonWrap}>
            <GradientButton
              text={t('Apply Filters')}
              onPress={handleApplyFilters}
              type="filled"
              styleContainer={styles.applyButtonContainer}
              textStyle={styles.applyButtonText}
            />
          </View>
        </View>
      </View>
      <CustomCalendar
        isVisible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedStartDate={activeField === 'endDate' ? endDate : startDate}
        selectedEndDate={null}
        mode="single"
        title={t('selectDate')}
        allowPastDates
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
  },
  container: {
    minHeight: '50%',
    maxHeight: '70%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  fields: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.black,
  },
  endDateLabel: {
    marginTop: width(4),
  },
  dateField: {
    marginTop: width(2),
    height: width(13),
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: width(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFieldText: {
    flex: 1,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginRight: width(2),
  },
  calendarIcon: {
    height: 20,
    width: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(3),
    marginTop: width(4),
    paddingTop: width(2),
  },
  resetButton: {
    flex: 1,
    minHeight: width(12),
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonWrap: {
    flex: 1,
    minWidth: 0,
  },
  applyButtonContainer: {
    flex: 1,
    minHeight: width(12),
  },
  applyButtonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

export default AnalyticsFilter;
