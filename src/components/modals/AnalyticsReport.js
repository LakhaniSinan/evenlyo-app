import {CardField, StripeProvider} from '@stripe/stripe-react-native';
import React, {useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import GradientText from '../gradiantText';

const AnalyticsReport = ({visible, onClose}) => {
  const {t} = useTranslation();
  const [paymentType, setPaymentType] = useState('');
  const [cardDetails, setCardDetails] = useState(null);

  const renderCardData = (left, center, right) => (
    <View style={styles.cardRow}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.leftText}>{left}</Text>
        {center && <Text style={styles.centerText}>{center}</Text>}
      </View>
      {right && <Text style={styles.rightText}>{right}</Text>}
    </View>
  );

  const fetchPaymentIntentClientSecret = async () => {
    try {
      const response = await fetch(
        'http://YOUR_SERVER_URL/create-payment-intent',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({amount: 2500, currency: 'usd'}), // $25.00
        },
      );
      const {clientSecret} = await response.json();
      return clientSecret;
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch payment intent');
      return null;
    }
  };

  const handleSelectPaymentMethod = value => {
    setPaymentType(value?.name || value);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('Analytics & Report')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text={'✕'} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Invoice Data */}
            <View style={styles.cardContainer}>
              {renderCardData('Invoice:', '', 'INV-2024-002')}
              {renderCardData('Plan:', '', 'Basic')}
              {renderCardData('Amount Due:', '', '$25.00')}
              {renderCardData('Security Fee:', '', '$25')}
              {renderCardData('Kilometer:', '10km', '$2')}
            </View>

            {/* Payment Method Picker */}
            <CustomPicker
              label="Payment Method"
              labelll="Select Payment Method"
              value={paymentType}
              listData={[
                {name: 'Credit/Debit Card'},
                {name: 'PayPal'},
                {name: 'Bank Transfer'},
              ]}
              name="paymentType"
              handleSelectValue={(_, value) => handleSelectPaymentMethod(value)}
            />

            {/* Card Input */}
            <Text style={styles.title}>{t('Add Card Details')}</Text>
            <StripeProvider publishableKey="pk_test_qblFNYngBkEdjEZ16jxxoWSM">
              <CardField
                postalCodeEnabled={true}
                placeholder={{number: '4242 4242 4242 4242'}}
                cardStyle={styles.cardField}
                style={styles.cardFieldContainer}
                onCardChange={details => setCardDetails(details)}
              />
            </StripeProvider>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.7}>
                <GradientText text={'Cancel'} />
              </TouchableOpacity>
              <GradientButton
                text={t('Pay $25.00')}
                onPress={() => onClose()}
                type="filled"
                textStyle={styles.payButtonText}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default AnalyticsReport;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width(95),
    maxHeight: height(80),
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.semiLightText,
    paddingVertical: 12,
    paddingHorizontal: width(4),
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginTop: width(2),
  },
  body: {
    padding: width(4),
  },
  cardContainer: {
    borderRadius: width(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: width(2),
    marginBottom: width(5),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: width(3),
  },
  leftText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  centerText: {
    marginLeft: width(2),
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  rightText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 20,
  },
  cardField: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    textColor: '#000000',
    fontSize: 14,
    placeholderColor: COLORS.textLight, // ✅ Custom placeholder color
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(4),
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: width(40),
  },
  payButtonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
});
