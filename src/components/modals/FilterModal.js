// FilterModal.js
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import RangeSlider from 'rn-range-slider';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import TextField from '../textInput';

const FilterModal = ({isVisible, onClose}) => {
  const {t} = useTranslation();
  const [priceRange, setPriceRange] = useState({min: 0, max: 300});
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const lastValuesRef = useRef({min: 0, max: 300});

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
    // Only update if values actually changed
    if (
      lastValuesRef.current.min !== low ||
      lastValuesRef.current.max !== high
    ) {
      console.log('Range changed:', low, high); // Debug log
      lastValuesRef.current = {min: low, max: high};
      setPriceRange({min: low, max: high});
    }
  }, []);

  // Add renderLabel and renderNotch for floatingLabel compatibility
  const renderLabel = useCallback(
    value => (
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>${value}</Text>
      </View>
    ),
    [],
  );

  const renderNotch = useCallback(() => <View style={styles.notch} />, []);
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
          <Text style={styles.title}>Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Search Location</Text>
          <TextField
            placeholder={'Search your location'}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            endIcon={ICONS.currentLoactionIcon}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date Range</Text>
          <View style={styles.dateContainer}>
            <View style={{width: width(40)}}>
              <TextField
                placeholder={'Start date'}
                // value={email}
                // onChangeText={setEmail}
                keyboardType="date"
                autoCapitalize="none"
                endIcon={ICONS.calenderIcon}
                editable={false}
              />
            </View>
            <View style={{width: width(40)}}>
              <TextField
                placeholder={'Start End'}
                // value={email}
                // onChangeText={setEmail}
                keyboardType="date"
                autoCapitalize="none"
                endIcon={ICONS.calenderIcon}
                editable={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price Range</Text>

          {/* Price labels above slider */}
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
              renderLabel={renderLabel}
              renderNotch={renderNotch}
              onValueChanged={handlePriceRangeChange}
            />
          </View>

          {/* From and To labels with values */}
          <View style={styles.fromToContainer}>
            <View style={styles.fromToItem}>
              <Text style={styles.fromToLabel}>From</Text>
              <View style={styles.fromToValueContainer}>
                <Text style={styles.fromToValue}>${priceRange.min}</Text>
              </View>
            </View>
            <View style={styles.fromToItem}>
              <Text style={styles.fromToLabel}>To</Text>
              <View style={styles.fromToValueContainer}>
                <Text style={styles.fromToValue}>${priceRange.max}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {!isKeyboardVisible && (
        <View style={styles.buttonRow}>
          <View style={{width: width(40)}}>
            <TouchableOpacity
              onPress={() => onClose()}
              style={styles.cancelButton}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{width: width(40)}}>
            <GradientButton
              text={'Apply Filters'}
              textStyle={{
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: 'white',
              }}
            />
          </View>
        </View>
      )}
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
  labelContainer: {
    padding: 4,
    backgroundColor: '#FF295D',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  notch: {
    width: 8,
    height: 8,
    backgroundColor: '#FF295D',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
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
});

export default FilterModal;
