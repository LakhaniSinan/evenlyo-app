import {CardField, useStripe} from '@stripe/stripe-react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {saveBookingOrder} from '../../services/ListingsItem';
import {formatEuro, parsePrice} from '../../utils';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';

const PaymentModal = ({
  onClose,
  onPaymentSuccess,
  modalRef,
  isVisible,
  clientSecret,
  selectedData,
  amountToPay,
}) => {
  const {t} = useTranslation();
  const {confirmPayment} = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const payableAmount = useMemo(() => parsePrice(amountToPay), [amountToPay]);

  const labels = useMemo(
    () => ({
      title: t('paymentDetailsTitle'),
      subtitle: t('paymentDetailsSubtitle'),
      summaryTitle: t('paymentSummaryTitle'),
      bookingAmount: t('bookingAmountLabel'),
      secureTitle: t('securePaymentTitle'),
      secureSubtitle: t('securePaymentSubtitle'),
      pay: t('payButton'),
      processing: t('Processing'),
      completeCard: t('pleaseCompleteCardDetails'),
      notInitialized: t('paymentNotInitialized'),
      paymentFailed: t('paymentFailedTryAgain'),
    }),
    [t],
  );

  const handleBackdropPress = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    onClose?.();
  };

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
        message: labels.completeCard,
      });
      return false;
    }

    if (!clientSecret) {
      modalRef.current.show({
        status: 'error',
        message: labels.notInitialized,
      });
      return false;
    }

    return true;
  };

  const onPay = useCallback(async () => {
    if (!validatePayment() || processing) return;
    Keyboard.dismiss();

    setProcessing(true);

    try {
      const {error, paymentIntent} = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        modalRef.current.show({
          status: 'error',
          message: error?.message || labels.paymentFailed,
        });
        return;
      }

      if (paymentIntent) {
        try {
          const params = {
            bookingId: selectedData?._id,
            paymentIntent: paymentIntent?.id,
            amount: payableAmount,
          };
          const res = await saveBookingOrder(params);
          if (res.status === 200 || res.status === 201) {
            modalRef.current?.show({
              status: 'ok',
              message: res?.data?.message,
              handlePressOk: () => {
                modalRef.current?.hide();
                setTimeout(() => {
                  onPaymentSuccess?.();
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
  }, [
    cardComplete,
    clientSecret,
    processing,
    confirmPayment,
    labels,
    selectedData,
    payableAmount,
    modalRef,
    onClose,
    onPaymentSuccess,
  ]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleBackdropPress}
      backdropOpacity={0.5}
      avoidKeyboard
      style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{labels.title}</Text>
            <Text style={styles.subTitle}>{labels.subtitle}</Text>
          </View>

          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountTitle}>{labels.summaryTitle}</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{labels.bookingAmount}</Text>
            <Text style={styles.amountValue}>{formatEuro(payableAmount)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{labels.secureTitle}</Text>
        <Text style={styles.subTitle}>{labels.secureSubtitle}</Text>
        <View style={{height: width(3)}} />
        <CardField
          postalCodeEnabled={false}
          style={styles.cardFieldContainer}
          cardStyle={styles.cardField}
          onCardChange={card => {
            const isComplete = Boolean(card?.complete);
            setCardComplete(isComplete);
            if (isComplete) {
              Keyboard.dismiss();
            }
          }}
        />

        {!keyboardVisible && (
          <GradientButton
            text={processing ? labels.processing : labels.pay}
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
