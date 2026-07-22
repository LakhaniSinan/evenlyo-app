import {CardField, useStripe} from '@stripe/stripe-react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, fontFamly} from '../../constants';
import {STRIPE_RETURN_URL} from '../../config/server';
import {useTranslation} from '../../hooks';
import {saveBookingOrder} from '../../services/ListingsItem';
import {formatEuro, parsePrice} from '../../utils';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';

const PAYMENT_METHODS = {
  CARD: 'card',
  IDEAL: 'ideal',
};

const PaymentModal = ({
  onClose,
  onPaymentSuccess,
  modalRef,
  isVisible,
  clientSecret,
  selectedData,
  amountToPay,
}) => {
  const {t, currentLanguage} = useTranslation();
  const {confirmPayment} = useStripe();
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CARD);
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
      methodTitle: t('paymentMethodTitle'),
      cardOption: t('paymentMethodCard'),
      idealOption: t('paymentMethodIdeal'),
      secureTitle: t('securePaymentTitle'),
      secureSubtitle: t('securePaymentSubtitle'),
      idealInfo: t('idealPaymentInfo'),
      payCard: t('payWithCard'),
      payIdeal: t('payWithIdeal'),
      processing: t('Processing'),
      completeCard: t('pleaseCompleteCardDetails'),
      notInitialized: t('paymentNotInitialized'),
      paymentFailed: t('paymentFailedTryAgain'),
    }),
    [t],
  );

  useEffect(() => {
    if (!isVisible) {
      setSelectedMethod(PAYMENT_METHODS.CARD);
      setCardComplete(false);
      setProcessing(false);
    }
  }, [isVisible]);

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
    if (!clientSecret) {
      modalRef.current.show({
        status: 'error',
        message: labels.notInitialized,
      });
      return false;
    }

    if (selectedMethod === PAYMENT_METHODS.CARD && !cardComplete) {
      modalRef.current.show({
        status: 'error',
        message: labels.completeCard,
      });
      return false;
    }

    return true;
  };

  const recordPayment = useCallback(
    async paymentIntentId => {
      const params = {
        bookingId: selectedData?._id,
        paymentIntent: paymentIntentId,
        amount: payableAmount,
      };
      const res = await saveBookingOrder(params);
      console.log(res, 'RRRRRRRRRRRRRR');

      const message = res?.data?.message?.en
        ? currentLanguage === 'en'
          ? res.data.message.en
          : res.data.message.nl
        : res?.data?.message;

      if (res.status === 200 || res.status === 201) {
        // Close the payment modal first, then wait for its native dismiss
        // animation to fully complete before presenting the alert.
        onClose();
        setTimeout(() => {
          modalRef.current?.show({
            status: 'ok',
            message,
            handlePressOk: () => {
              modalRef.current?.hide();
              setTimeout(() => {
                onPaymentSuccess?.();
              }, 300);
            },
          });
        }, 2000);
      } else {
        modalRef.current?.show({
          status: 'error',
          message,
        });
      }
    },
    [
      selectedData,
      payableAmount,
      modalRef,
      currentLanguage,
      onPaymentSuccess,
      onClose,
    ],
  );

  const onPay = useCallback(async () => {
    if (!validatePayment() || processing) {
      return;
    }

    Keyboard.dismiss();
    setProcessing(true);

    try {
      const isIdeal = selectedMethod === PAYMENT_METHODS.IDEAL;
      const confirmParams = {
        paymentMethodType: isIdeal ? 'Ideal' : 'Card',
        returnURL: 'com.evenlyo://stripe-redirect',
      };

      if (isIdeal) {
        confirmParams.returnURL = STRIPE_RETURN_URL;
      }

      console.log('STRIPE_RETURN_URL:', STRIPE_RETURN_URL);
      console.log('confirmParams:', confirmParams);

      const {error, paymentIntent} = await confirmPayment(
        clientSecret,
        confirmParams,
      );
      console.log(error, paymentIntent, 'VALUESS');

      if (error) {
        modalRef.current.show({
          status: 'error',
          message: error?.message || labels.paymentFailed,
        });
        return;
      }

      if (paymentIntent?.id) {
        await recordPayment(paymentIntent.id);
      }
    } catch (err) {
      console.log('Payment error', err);
      modalRef.current?.show({
        status: 'error',
        message: labels.paymentFailed,
      });
    } finally {
      setProcessing(false);
    }
  }, [
    selectedMethod,
    cardComplete,
    clientSecret,
    processing,
    confirmPayment,
    labels,
    recordPayment,
    modalRef,
  ]);

  const handleSelectMethod = method => {
    setSelectedMethod(method);
    if (method === PAYMENT_METHODS.IDEAL) {
      Keyboard.dismiss();
    }
  };

  const payButtonLabel =
    selectedMethod === PAYMENT_METHODS.IDEAL ? labels.payIdeal : labels.payCard;

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

        <Text style={styles.methodTitle}>{labels.methodTitle}</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === PAYMENT_METHODS.CARD &&
                styles.methodCardActive,
            ]}
            onPress={() => handleSelectMethod(PAYMENT_METHODS.CARD)}
            activeOpacity={0.8}>
            <Icon
              name="card-outline"
              size={22}
              color={
                selectedMethod === PAYMENT_METHODS.CARD
                  ? COLORS.primary
                  : COLORS.textLight
              }
            />
            <Text
              style={[
                styles.methodLabel,
                selectedMethod === PAYMENT_METHODS.CARD &&
                  styles.methodLabelActive,
              ]}>
              {labels.cardOption}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === PAYMENT_METHODS.IDEAL &&
                styles.methodCardActive,
            ]}
            onPress={() => handleSelectMethod(PAYMENT_METHODS.IDEAL)}
            activeOpacity={0.8}>
            <View style={styles.idealBadge}>
              <Text style={styles.idealBadgeText}>iDEAL</Text>
            </View>
            <Text
              style={[
                styles.methodLabel,
                selectedMethod === PAYMENT_METHODS.IDEAL &&
                  styles.methodLabelActive,
              ]}>
              {labels.idealOption}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedMethod === PAYMENT_METHODS.CARD ? (
          <>
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
          </>
        ) : (
          <View style={styles.idealBox}>
            <Text style={styles.title}>{labels.secureTitle}</Text>
            <Text style={styles.subTitle}>{labels.idealInfo}</Text>
          </View>
        )}

        {!keyboardVisible && (
          <GradientButton
            text={processing ? labels.processing : payButtonLabel}
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
    minHeight: '70%',
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
    marginVertical: width(4),
    paddingHorizontal: width(3),
    paddingVertical: width(4),
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
  },

  amountTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginBottom: width(2),
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

  methodTitle: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginBottom: width(2),
  },

  methodRow: {
    flexDirection: 'row',
    gap: width(3),
    marginBottom: width(4),
  },

  methodCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
    borderRadius: width(3),
    padding: width(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: width(22),
    backgroundColor: COLORS.white,
  },

  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FDF0FA',
  },

  methodLabel: {
    marginTop: width(2),
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlign: 'center',
  },

  methodLabelActive: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  idealBadge: {
    backgroundColor: '#CC0066',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  idealBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  idealBox: {
    marginBottom: width(4),
    padding: width(4),
    borderRadius: width(3),
    backgroundColor: COLORS.backgroundLight,
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
