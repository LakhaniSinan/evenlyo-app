import {useNavigation} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
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
import CustomPicker from '../customPicker';
import DateSelector from '../dateSelector';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import TimeSelector from '../timingsSelector';

const INITIAL_FILTERS = {
  mainCategory: '',
  subCategory: '',
  location: '',
};

const INITIAL_DATES = {
  startDate: null,
  endDate: null,
};

const INITIAL_TIMINGS = {
  startTime: null,
  endTime: null,
};

const FilterModal = ({
  isVisible,
  onClose,
  nestedFilter = false,
  modalRef,
  onApplyPress = () => {},
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const mainCategoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [address, setAddress] = useState({
    fullAddress: '',
    lat: 0,
    lng: 0,
  });

  const [otherCategory, setOtherCategory] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [dates, setDates] = useState(INITIAL_DATES);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const openPicker = useCallback((ref, params) => {
    ref?.current?.show(params);
  }, []);

  const handleSelect = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value?.name || value,
    }));
  }, []);

  const handleApply = useCallback(() => {
    const payload = {
      startTime: startTime,
      endTime: endTime,
      startDate: dates.startDate,
      endDate: dates.endDate,
      location: address.fullAddress,
      lat: address.lat,
      lng: address.lng,
    };

    console.log(payload, 'payloadpayloadpayloadpayloadpayload');

    onApplyPress(payload);
    // onClose();
    // handleReset();
  }, [dates, filters, navigation, onClose]);

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setDates(INITIAL_DATES);
    setStartTime(null);
    setEndTime(null);
    setAddress({
      fullAddress: '',
      lat: 0,
      lng: 0,
    });
    setOtherCategory(false);
  }, []);

  const FooterButtons = memo(() => (
    <View style={styles.buttonRow}>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={nestedFilter ? handleReset : onClose}>
          {nestedFilter ? (
            <GradientText text={t('Reset Filter')} />
          ) : (
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonWrapper}>
        <GradientButton
          text={t('Apply Filters')}
          onPress={handleApply}
          type="filled"
          textStyle={styles.applyText}
        />
      </View>
    </View>
  ));

  const onLocationSelect = item => {
    setAddress({
      fullAddress: item.userAddress,
      lat: item?.latLng?.latitude,
      lng: item?.latLng?.longitude,
    });
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {nestedFilter && (
            <>
              <CustomPicker
                ref={mainCategoryRef}
                labelll={t('Main Category')}
                label={t('Main Category')}
                value={filters.mainCategory}
                listData={[
                  {name: 'Entertainment & Attractions'},
                  {name: 'Food & Drinks'},
                  {name: 'Decoration & Styling'},
                  {name: 'Locations & Party Tents'},
                  {name: 'Staff & Services'},
                ]}
                name="mainCategory"
                handleOpenModal={() =>
                  openPicker(mainCategoryRef, {title: 'Main Category'})
                }
                handleSelectValue={handleSelect}
              />

              <CustomPicker
                ref={subCategoryRef}
                label={t('Sub Category')}
                labelll={t('Sub Category')}
                value={filters.subCategory}
                listData={[
                  {name: 'DJ'},
                  {name: 'Live Band'},
                  {name: 'Photo Booth'},
                ]}
                name="subCategory"
                handleOpenModal={() =>
                  openPicker(subCategoryRef, {title: 'Sub Category'})
                }
                handleSelectValue={handleSelect}
              />
            </>
          )}

          <View style={{height: width(4)}} />
          <GooglePlacesInput
            selectedLocation={address.fullAddress}
            setSelectedLocation={onLocationSelect}
            placeholder="Search Your Location"
            bgcolor={COLORS.backgroundLight}
            onEndIconPress={() => {
              setAddress({
                fullAddress: '',
                lat: 0,
                lng: 0,
              });
            }}
            showRightIcon={ICONS.locationIcon}
            lable="Search Location"
          />

          <View style={styles.section}>
            <Text style={styles.label}>{t('Date Range')}</Text>
            <DateSelector
              startDate={dates.startDate}
              endDate={dates.endDate}
              mode="range"
              onStartDateChange={date =>
                setDates(prev => ({...prev, startDate: date}))
              }
              onEndDateChange={date =>
                setDates(prev => ({...prev, endDate: date}))
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('Time Range')}</Text>
            <TimeSelector
              modalRef={modalRef}
              endTime={endTime}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
          </View>
        </ScrollView>

        {!keyboardVisible && <FooterButtons />}
      </View>
    </Modal>
  );
};

export default memo(FilterModal);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: width(8),
    borderTopRightRadius: width(8),
    paddingHorizontal: 16,
    paddingTop: 14,
    height: '80%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
  },

  title: {
    fontSize: 18,
    fontFamily: fontFamly.bold,
    color: COLORS.black,
  },

  section: {
    marginTop: 18,
  },

  label: {
    fontSize: 14,
    fontFamily: fontFamly.medium,
    color: COLORS.black,
    marginBottom: 8,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  checkbox: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },

  checkboxEmpty: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    borderRadius: 4,
  },

  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: fontFamly.regular,
    color: COLORS.black,
  },

  buttonRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },

  deliveryLabel: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textLight,
  },

  deliveryBox: {
    backgroundColor: '#FDF0FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    marginVertical: 12,
  },

  buttonWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },

  cancelButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontFamily: fontFamly.medium,
    color: COLORS.primary,
  },

  applyText: {
    fontSize: 14,
    fontFamily: fontFamly.medium,
    color: COLORS.white,
  },
});
