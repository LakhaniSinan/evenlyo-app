import {CardField, useStripe} from '@stripe/stripe-react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, fontFamly} from '../../constants';
import {saveBookingOrder} from '../../services/ListingsItem';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';

const PaymentModal = ({
  onClose,
  modalRef,
  isVisible,
  clientSecret,
  selectedData,
  amountToPay,
}) => {
  const {confirmPayment} = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const validatePayment = () => {
    if (!cardComplete) {
      modalRef.current.show({
        status: 'error',
        message: 'Please complete card details',
      });
      return false;
    }

    if (!clientSecret) {
      modalRef.current.show({
        status: 'error',
        message: 'Payment not initialized',
      });
      return false;
    }

    return true;
  };

  const onPay = useCallback(async () => {
    if (!validatePayment() || processing) return;

    setProcessing(true);

    try {
      const {error, paymentIntent} = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        modalRef.current.show({
          status: error,
          message: error.message,
        });
        return;
      }

      if (paymentIntent) {
        try {
          const params = {
            bookingId: selectedData?._id,
            paymentIntent: paymentIntent?.id,
            amount: (paymentIntent?.amount / 100).toFixed(2),
          };
          const res = await saveBookingOrder(params);
          if (res.status === 200 || res.status === 201) {
            modalRef.current?.show({
              status: 'ok',
              message: res?.data?.message,
              handlePressOk: () => {
                modalRef.current?.hide();
                setTimeout(() => {
                  onClose();
                }, 500);
              },
            });
          } else {
            modalRef.current?.show({
              status: 'error',
              message: res?.data?.message,
            });
          }
        } catch (err) {
          console.log('PAY ERROR', err);
        }
      }
    } catch (err) {
      console.log(err, 'errerrerrerrerrerrerrerrasd2qedasc');
    } finally {
      setProcessing(false);
    }
  }, [cardComplete, clientSecret, processing, confirmPayment]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      avoidKeyboard
      style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Payment Details</Text>
            <Text style={styles.subTitle}>Complete your booking payment</Text>
          </View>

          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountTitle}>Payment Summary</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Booking Amount</Text>
            <Text style={styles.amountValue}>$ {amountToPay?.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.title}>Secure Payment</Text>
        <Text style={styles.subTitle}>
          Your card information is encrypted and secure
        </Text>
        <View style={{height: width(3)}} />
        <CardField
          postalCodeEnabled={false}
          style={styles.cardFieldContainer}
          cardStyle={styles.cardField}
          onCardChange={card => setCardComplete(card.complete)}
        />

        {!keyboardVisible && (
          <GradientButton
            text={processing ? 'Processing...' : 'Pay'}
            onPress={onPay}
            disabled={processing}
            type="filled"
          />
        )}
      </View>
      <CommonAlert ref={modalRef} />
    </Modal>
  );
};

export default React.memo(PaymentModal);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },

  container: {
    height: '70%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },

  title: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  subTitle: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  amountBox: {
    height: width(20),
    marginVertical: width(5),
    paddingHorizontal: width(3),
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
  },

  amountTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amountLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  amountValue: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  cardFieldContainer: {
    height: 50,
    marginBottom: 20,
  },

  cardField: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    textColor: COLORS.black,
    placeholderColor: COLORS.textLight,
  },
});
