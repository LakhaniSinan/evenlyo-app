// FilterModal.js
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import RangeSlider from 'rn-range-slider';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import DateSelector from '../dateSelector';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const FilterModal = ({isVisible, onClose, nestedFilter, showOtherCheckBox}) => {
  const {t} = useTranslation();
  const [priceRange, setPriceRange] = useState({min: 0, max: 500});
  const [isChecked, setIsChecked] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const lastValuesRef = useRef({min: 0, max: 500});
  const navigation = useNavigation();
  const mainCategory = useRef(null);
  const subCategory = useRef(null);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [inputVal, setInputVal] = useState({
    mainCategory: '',
    subCategory: '',
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

  const handlePriceRangeChange = useCallback((low, high) => {
    if (
      lastValuesRef.current.min !== low ||
      lastValuesRef.current.max !== high
    ) {
      console.log('Range changed:', low, high);
      lastValuesRef.current = {min: low, max: high};
      setPriceRange({min: low, max: high});
    }
  }, []);

  const handleOpenMainCategory = params => {
    console.log('handleOpenMainCategory called with:', params);
    if (mainCategory?.current) {
      mainCategory.current.show(params);
    } else {
      console.warn('main Category ref is not available');
    }
  };
  const handleOpenSubCategory = params => {
    console.log('handleOpenMainCategory called with:', params);
    if (subCategory?.current) {
      subCategory.current.show(params);
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
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{flex: 1}}>
          {nestedFilter && (
            <>
              <CustomPicker
                ref={mainCategory}
                label="Main_Category"
                labelll="Main Category"
                handleOpenModal={handleOpenMainCategory}
                value={inputVal?.mainCategory || ''}
                listData={[
                  {name: 'Entertainment & Attractions'},
                  {name: 'Food & Drinks'},
                  {name: 'Decoration & Styling'},
                  {name: 'Locations & Party Tents'},
                  {name: 'Staff & Services'},
                ]}
                name="mainCategory"
                handleSelectValue={handleSelectValue}
              />
              <CustomPicker
                ref={subCategory}
                label="Sub_Category"
                labelll="Sub Category"
                handleOpenModal={handleOpenSubCategory}
                value={inputVal?.subCategory || ''}
                listData={[
                  {name: 'DJ'},
                  {name: 'Live Band'},
                  {name: 'Photo Booth'},
                ]}
                name="subCategory"
                handleSelectValue={handleSelectValue}
              />
              <View style={{height: 15}} />
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: width(5),
                  alignItems: 'center',
                }}>
                {!isChecked ? (
                  <TouchableOpacity
                    onPress={() => setIsChecked(!isChecked)}
                    style={{
                      height: width(6),
                      width: width(6),
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: COLORS.primary,
                    }}></TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsChecked(!isChecked)}
                    style={{
                      borderColor: COLORS.primary,
                    }}>
                    <Image
                      source={ICONS.cheackIcon}
                      style={{height: width(6), width: width(6)}}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    marginBottom: 3,
                    marginLeft: width(3),
                  }}>
                  {t('Other Category')}
                </Text>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>{t('Search Location')}</Text>
            <TextField
              placeholder={t('Search Your Location')}
              // value={email}
              // onChangeText={setEmail}
              autoCapitalize="none"
              endIcon={ICONS.currentLoactionIcon}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('Date Range')}</Text>
            <DateSelector
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartDateChange={date => {
                console.log('Start date selected:', date);
                setFilterStartDate(date);
                if (setInputVal && typeof setInputVal === 'function') {
                  setInputVal(prev => ({...prev, startDate: date}));
                }
              }}
              onEndDateChange={date => {
                console.log('End date selected:', date);
                setFilterEndDate(date);
                if (setInputVal && typeof setInputVal === 'function') {
                  setInputVal(prev => ({...prev, endDate: date}));
                }
              }}
              mode="range"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('Price Range')}</Text>

            <View style={styles.priceLabelsContainer}>
              <Text style={styles.priceLabel}>$0</Text>
              <Text style={styles.priceLabel}>$500</Text>
            </View>

            <View style={styles.sliderContainer} pointerEvents="auto">
              <RangeSlider
                style={styles.slider}
                min={0}
                max={500}
                step={10}
                low={priceRange.min}
                high={priceRange.max}
                floatingLabel
                renderThumb={() => <View style={styles.thumb} />}
                renderRail={() => <View style={styles.rail} />}
                renderRailSelected={() => <View style={styles.railSelected} />}
                onValueChanged={handlePriceRangeChange}
              />
            </View>

            {/* From and To labels with values */}
            <View style={styles.fromToContainer}>
              <View style={styles.fromToItem}>
                <Text style={styles.fromToLabel}>{t('from')}</Text>
                <View style={styles.fromToValueContainer}>
                  <Text style={styles.fromToValue}>${priceRange.min}</Text>
                </View>
              </View>
              <View style={styles.fromToItem}>
                <Text style={styles.fromToLabel}>{t('to')}</Text>
                <View style={styles.fromToValueContainer}>
                  <Text style={styles.fromToValue}>${priceRange.max}</Text>
                </View>
              </View>
            </View>
          </View>
          {!isKeyboardVisible && nestedFilter && (
            <View style={styles.buttonRowtext}>
              {!nestedFilter && (
                <View style={{width: width(40)}}>
                  <TouchableOpacity
                    onPress={() => onClose()}
                    style={styles.cancelButton}
                    activeOpacity={0.7}>
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {nestedFilter && (
                <View style={{width: width(40)}}>
                  <TouchableOpacity
                    onPress={() => onClose()}
                    style={styles.cancelButton}
                    activeOpacity={0.7}>
                    <GradientText text={'Reset Filter'} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{width: width(40)}}>
                <GradientButton
                  text={t('Apply Filters')}
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
        </ScrollView>
        {!isKeyboardVisible && !nestedFilter && (
          <View style={styles.buttonRow}>
            {!nestedFilter && (
              <View style={{width: width(40)}}>
                <TouchableOpacity
                  onPress={() => onClose()}
                  style={styles.cancelButton}
                  activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {nestedFilter && (
              <View style={{width: width(40)}}>
                <TouchableOpacity
                  onPress={() => onClose()}
                  style={styles.cancelButton}
                  activeOpacity={0.7}>
                  <GradientText text={'Reset Filter'} />
                </TouchableOpacity>
              </View>
            )}
            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Apply Filters')}
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateInput: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
  },
  priceLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: fontFamly.PlusJakartaSansRegular,
  },
  sliderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 5,
    zIndex: 1000,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF295D',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rail: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f2f2f2',
  },
  railSelected: {
    height: 6,
    backgroundColor: '#FF295D',
    borderRadius: 3,
  },
  fromToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  fromToItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fromToLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginRight: width(3),
  },
  fromToValueContainer: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#333',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    height: width(15),
    width: width(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fromToValue: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#333',
  },

  buttonRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: width(100),
    justifyContent: 'space-around',
  },
  btnWhite: {
    flex: 0.48,
    backgroundColor: '#f9f9f9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 0,
  },
  btnWhiteText: {
    color: '#f0a',
    fontWeight: '600',
  },
  btnPink: {
    flex: 0.48,
    backgroundColor: '#f0a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPinkText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#666',
  },
  buttonRowtext: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
});

export default FilterModal;
