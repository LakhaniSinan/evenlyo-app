// FilterModal.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
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

const BookingFilterModal = ({isVisible, onClose, nestedFilter}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const status = useRef(null);
  const statusProgress = useRef(null);
  const [inputVal, setInputVal] = useState({
    status: '',
    statusProgress: '',
    holderType: '',
    priceRange: '',
    location: '',
    dateRange: '',
    timeRange: '',
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);
  const handleDateSelect = date => {
    console.log(date, 'handleDateSelecthandleDateSelect');
    setShowCalendar(false);
  };
  const handleOpenSubCategory = params => {
    console.log('handleOpenMainCategory called with:', params);
    if (statusProgress?.current) {
      statusProgress.current.show(params);
    } else {
      console.warn('main Category ref is not available');
    }
  };
  const handleOpenSelectStatus = params => {
    console.log('handleOpenMainCategory called with:', params);
    if (status?.current) {
      status.current.show(params);
    } else {
      console.warn('main Category ref is not available');
    }
  };

  const handleSelectValue = (name, value) => {
    console.log('handleSelectValue called:', name, value);
    if (setInputVal && typeof setInputVal === 'function') {
      setInputVal(prevState => ({
        ...prevState,
        [name]: value?.name || value,
      }));
    }
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
          <Text style={styles.title}>{t('filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{flex: 1}}>
          <View style={{}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.black,
              }}>
              By Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(true)}
              style={{
                marginTop: width(2),
                height: width(13),
                borderRadius: 12,
                backgroundColor: COLORS.backgroundLight,
                justifyContent: 'center',
                paddingHorizontal: width(4),
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                paddingHorizontal: width(3),
              }}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: COLORS.textLight,
                }}>
                DD/MM/YYYY
              </Text>
              <Image
                source={ICONS.calenderIcon}
                style={{height: 20, width: 20}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <CustomPicker
            ref={statusProgress}
            label="By Status progress"
            labelll="Select Status"
            handleOpenModal={handleOpenSubCategory}
            value={inputVal?.statusProgress || ''}
            listData={[
              {name: 'Completed'},
              {name: 'New Request'},
              {name: 'In Progress'},
              {name: 'Issue / Complain'},
            ]}
            name="statusProgress"
            handleSelectValue={handleSelectValue}
          />
          <CustomPicker
            ref={status}
            label="By Status progress"
            labelll="Select Status"
            handleOpenModal={handleOpenSelectStatus}
            value={inputVal?.status || ''}
            listData={[{name: 'Deliver'}, {name: 'Received'}]}
            name="status"
            handleSelectValue={handleSelectValue}
          />
        </ScrollView>
        {!isKeyboardVisible && !nestedFilter && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: width(4),
            }}>
            <View style={{width: width(43)}}>
              <TouchableOpacity
                onPress={() => onClose()}
                style={{
                  backgroundColor: COLORS.backgroundLight,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}>
                <GradientText text={'Reset All'} />
              </TouchableOpacity>
            </View>
            <View style={{width: width(40)}}>
              <GradientButton
                text={t('applyFilters')}
                onPress={() => {
                  onClose();
                  setTimeout(() => {
                    navigation.navigate('EventListingScreen');
                  }, 500);
                }}
                type="filled"
                textStyle={{
                  fontSize: 12,
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: 'white',
                }}
              />
            </View>
          </View>
        )}
      </View>
      <CustomCalendar
        isVisible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedStartDate={startDate}
        selectedEndDate={null}
        mode="single"
        title={t('selectDate') || 'Select Date'}
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
    height: '80%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
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
  },
  subTitleDescription: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textGray,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
  },
});

export default BookingFilterModal;
