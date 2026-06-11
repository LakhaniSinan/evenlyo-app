import moment from 'moment';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomCalendar from '../customCalendar';
import CustomPicker from '../customPicker';
import GradientText from '../gradiantText';

const BOOKING_STATUS_I18N = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  on_the_way: 'statusOnTheWay',
  received: 'statusReceived',
  finished: 'statusFinished',
  picked_up: 'statusPickedUp',
  received_back: 'statusReceivedBack',
  completed: 'statusCompleted',
  claim: 'statusClaim',
};

const BookingFilterModal = ({
  isVisible,
  onClose,
  onApplyFilters,
  onResetFilters,
  filters,
}) => {
  const {t} = useTranslation();
  const statusPickerRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const statusOptions = useMemo(
    () => [
      {_id: '', name: t('All Statuses')},
      ...Object.entries(BOOKING_STATUS_I18N).map(([statusKey, i18nKey]) => ({
        _id: statusKey,
        name: t(i18nKey),
      })),
    ],
    [t],
  );

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      hideListener?.remove();
      showListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    setStartDate(filters?.startDate || '');
    setEndDate(filters?.endDate || '');
    setSelectedStatus(filters?.status || '');
  }, [filters?.endDate, filters?.startDate, filters?.status, isVisible]);

  const formatDateLabel = dateValue =>
    dateValue ? moment(dateValue).format('DD/MM/YYYY') : t('DD/MM/YYYY');

  const handleDateSelect = date => {
    const selected = date?.format ? date.format('YYYY-MM-DD') : '';
    if (!selected) {
      return;
    }

    if (activeField === 'endDate') {
      setEndDate(selected);
    } else {
      setStartDate(selected);
    }
  };

  const handleStatusSelect = (name, value) => {
    const statusKey =
      typeof value === 'object'
        ? value?._id ?? value?.id ?? value?.name ?? ''
        : value;
    setSelectedStatus(statusKey || '');
  };

  const handleApply = () => {
    if (
      startDate &&
      endDate &&
      moment(endDate).isBefore(moment(startDate), 'day')
    ) {
      Alert.alert(t('Error'), t('analyticsFilterEndBeforeStart'));
      return;
    }

    onApplyFilters?.({
      startDate,
      endDate,
      status: selectedStatus,
    });
    onClose?.();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStatus('');
    onResetFilters?.();
    onClose?.();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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

          <CustomPicker
            ref={statusPickerRef}
            label={t('By Status')}
            labelll={t('Select Status')}
            value={selectedStatus}
            listData={statusOptions}
            name="status"
            handleOpenModal={() =>
              statusPickerRef?.current?.show({title: t('Select Status')})
            }
            handleSelectValue={handleStatusSelect}
          />
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetButton}
              activeOpacity={0.7}>
              <GradientText text={t('Reset All')} />
            </TouchableOpacity>
            <View style={styles.applyButtonWrap}>
              <GradientButton
                text={t('Apply Filters')}
                onPress={handleApply}
                type="filled"
                styleContainer={styles.applyButtonContainer}
                textStyle={styles.applyButtonText}
              />
            </View>
          </View>
        )}
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
    height: '50%',
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
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: width(5),
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  scroll: {
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

export default BookingFilterModal;
