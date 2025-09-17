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
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const ShippingFromModal = ({isVisible, onClose, onContinueToShipping}) => {
  const {t} = useTranslation();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
    postalCode: '',
    address: '',
    apartment: '',
  });

  // 🔹 Pricing with dummy values
  const [pricing, setPricing] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
  });

  // 🔹 Keyboard listeners
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      show?.remove();
      hide?.remove();
    };
  }, []);

  // 🔹 Dummy pricing update
  useEffect(() => {
    const dummySubtotal = 120.5;
    const dummyShipping = 15.0;
    setPricing({
      subtotal: dummySubtotal,
      shipping: dummyShipping,
      total: dummySubtotal + dummyShipping,
    });
  }, []);

  const handleChange = (field, value) => {
    let newValue = value;
    if (field === 'phone' || field === 'postalCode') {
      newValue = value.replace(/[^0-9]/g, '');
    }
    setFormData(prev => ({...prev, [field]: newValue}));
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Shipping address')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {[
            {
              label: 'First Name*',
              field: 'firstName',
              placeholder: 'Your first name',
            },
            {
              label: 'Last Name*',
              field: 'lastName',
              placeholder: 'Your last name',
            },
            {
              label: 'Phone*',
              field: 'phone',
              placeholder: 'Your phone',
              keyboardType: 'numeric',
            },
            {
              label: 'Country/Region*',
              field: 'country',
              placeholder: 'Your country/region',
            },
          ].map((item, i) => (
            <View style={styles.section} key={i}>
              <TextField
                label={item.label}
                placeholder={item.placeholder}
                value={formData[item.field]}
                keyboardType={item.keyboardType}
                onChangeText={text => handleChange(item.field, text)}
              />
            </View>
          ))}

          {/* City & Postal Code */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{width: width(42)}}>
              <TextField
                label="City*"
                placeholder="Your city"
                value={formData.city}
                onChangeText={text => handleChange('city', text)}
              />
            </View>
            <View style={{width: width(42)}}>
              <TextField
                label="Postal code*"
                placeholder="Your postal code"
                keyboardType="numeric"
                value={formData.postalCode}
                onChangeText={text => handleChange('postalCode', text)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <TextField
              label="Address*"
              placeholder="Your address"
              value={formData.address}
              onChangeText={text => handleChange('address', text)}
            />
          </View>

          <View style={styles.section}>
            <TextField
              label="Apartment, Suite, etc. (optional)"
              placeholder="Your apartment, suite, etc."
              value={formData.apartment}
              onChangeText={text => handleChange('apartment', text)}
            />
          </View>

          {/* Pricing Summary */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Summary</Text>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Shipping:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.shipping.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${pricing.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
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

        {/* Footer */}
        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.addToWishlistButton}>
              <GradientText text="Add To Wishlist" />
            </TouchableOpacity>
            <View style={{width: width(50)}}>
              <GradientButton
                text="Continue to shipping"
                onPress={() => acceptTerms && onContinueToShipping()}
                type="filled"
                textStyle={styles.sendRequestText}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end', backgroundColor: '#8b8b8b66'},
  container: {
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
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
  scrollView: {flex: 1},
  section: {marginBottom: width(4)},
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
  divider: {height: 1, backgroundColor: '#e0e0e0', marginVertical: 15},
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
  termsSection: {marginBottom: 25},
  termsContainer: {flexDirection: 'row', alignItems: 'flex-start'},
  termsTextContainer: {flexDirection: 'row', flexWrap: 'wrap', flex: 1},
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
  checkboxChecked: {backgroundColor: '#FF295D'},
  buttonContainer: {
    paddingTop: width(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addToWishlistButton: {
    width: width(35),
    backgroundColor: COLORS.backgroundLight,
    height: width(13),
    borderRadius: width(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendRequestText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
});

export default ShippingFromModal;
