import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
import GradientText from '../gradiantText';
import TextField from '../textInput';

const OrderBooking = ({
  isVisible,
  onClose,
  nestedFilter,
  handleSendBookingRequest,
}) => {
  const {t} = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('Friday, July 11, 2025');
  const [isMultipleDay, setIsMultipleDay] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState('');
  const [kilometer, setKilometer] = useState('10');
  const [instructions, setInstructions] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [pricing, setPricing] = useState({
    duration: 8,
    ratePerHour: 108,
    subtotal: 864,
    securityFee: 25,
    kmCost: 5,
    total: 894,
    kmValue: 10,
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

  // Recalculate pricing whenever kilometer changes
  useEffect(() => {
    const newPricing = calculatePricing();
    setPricing(newPricing);
    console.log('Pricing updated:', newPricing);
  }, [kilometer]);

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const toggleMultipleDay = () => {
    setIsMultipleDay(!isMultipleDay);
  };

  const toggleTermsAcceptance = () => {
    setAcceptTerms(!acceptTerms);
  };

  const handleKilometerChange = text => {
    // Only allow numbers and decimal points
    const cleanedText = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const decimalCount = (cleanedText.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setKilometer(cleanedText);
      console.log('Kilometer changed to:', cleanedText);
    }
  };

  const calculatePricing = () => {
    const duration = 8; // hours
    const ratePerHour = 108;
    const securityFee = 25;
    const kmRate = 0.5; // $0.5 per km

    // Convert kilometer to number and handle invalid input
    const kmValue = parseFloat(kilometer) || 0;

    const subtotal = duration * ratePerHour;
    const kmCost = kmValue * kmRate;
    const total = subtotal + securityFee + kmCost;

    console.log('Calculation details:', {
      duration,
      ratePerHour,
      subtotal,
      securityFee,
      kmValue,
      kmRate,
      kmCost,
      total,
    });

    return {
      duration,
      ratePerHour,
      subtotal,
      securityFee,
      kmCost,
      total,
      kmValue,
    };
  };

  // Remove the old pricing variable since we're now using state
  // const pricing = calculatePricing();

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
          <Text style={styles.title}>Order Booking</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.dateTimeHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Selected Date & Time</Text>
                <Text style={styles.dateValue}>{selectedDate}</Text>
              </View>
              <TouchableOpacity
                onPress={toggleMultipleDay}
                style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    isMultipleDay && styles.checkboxChecked,
                  ]}>
                  {isMultipleDay && (
                    <Icon name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Multiple Day</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date Range *</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                </Text>
                <Icon name="calendar" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {endDate ? endDate.toLocaleDateString() : 'End Date'}
                </Text>
                <Icon name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <TextField
              label="Add Location *"
              placeholder="Add Location"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="none"
              endIcon={ICONS.locationIcon}
            />
          </View>

          <View style={styles.section}>
            <TextField
              label="Add Kilometer *"
              placeholder="Add Kilometer"
              value={kilometer}
              onChangeText={handleKilometerChange}
              keyboardType="numeric"
              endIcon={ICONS.currentLoactionIcon}
            />
          </View>

          <View style={styles.section}>
            <TextField
              label="Add Instructions *"
              placeholder="Any Special Requirements Or Setup Instructions..."
              value={instructions}
              onChangeText={setInstructions}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Summary</Text>
            <View style={styles.pricingRow}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.pricingLabel}>Duration: </Text>
                <Text style={[styles.pricingLabel, {color: COLORS.textDark}]}>
                  {pricing.duration} hours
                </Text>
              </View>
              <Text style={styles.pricingValue}>${pricing.ratePerHour}/Hr</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Security Fee:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.securityFee.toFixed(2)}
              </Text>
            </View>
            <View style={styles.pricingRow}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.pricingLabel}>Kilometer:</Text>
                <Text style={[styles.pricingLabel, {color: COLORS.textDark}]}>
                  {pricing.kmValue} km
                </Text>
              </View>
              <Text style={[styles.pricingValue, {color: COLORS.textDark}]}>
                ${pricing.kmCost.toFixed(2)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${pricing.total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.termsSection}>
            <TouchableOpacity
              onPress={toggleTermsAcceptance}
              style={styles.termsContainer}>
              <View
                style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked,
                ]}>
                {acceptTerms && (
                  <Icon name="checkmark" size={16} color="white" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I Accept The Company's </Text>
                <TouchableOpacity>
                  <GradientText
                    text={'Terms & Conditions'}
                    customStyles={styles.termsLink}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                onClose();
              }}
              style={{
                width: width(35),
                backgroundColor: COLORS.backgroundLight,
                height: width(13),
                borderRadius: width(5),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <GradientText text={'Add to Cart'} />
            </TouchableOpacity>
            <View style={{width: width(50)}}>
              <GradientButton
                text="Send Booking Request"
                onPress={() => {
                  if (!acceptTerms) {
                    return;
                  }
                  handleSendBookingRequest();
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
    height: '90%',
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
    paddingBottom: 25,
    borderBottomColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: width(4),
  },
  label: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  requiredLabel: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  dateValue: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  dateTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: width(4),
    borderRadius: width(3),
    marginTop: width(3),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF295D',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF295D',
  },
  checkboxLabel: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dateInputText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  pricingSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    marginBottom: width(4),
  },
  pricingTitle: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  totalValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  termsSection: {
    marginBottom: 25,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    paddingTop: width(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default OrderBooking;
