import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';

import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const REASONS = ['Good', 'Fair', 'Claim'];

const PickedupModal = ({booking, visible, onClose, onConfirm}) => {
  const {t, currentLanguage} = useTranslation();
  const securityFee = Number(booking?.pricingBreakdown?.securityFee || 0);
  const listingTitle = useMemo(() => {
    const title = booking?.listingDetails?.title;
    if (!title) {
      return '—';
    }
    if (typeof title === 'string') {
      return title;
    }
    return (
      (currentLanguage === 'en' ? title?.en : title?.nl) ||
      title?.en ||
      title?.nl ||
      '—'
    );
  }, [booking, currentLanguage]);

  const [selectedReason, setSelectedReason] = useState(null);
  const [amount, setAmount] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setAmount('');
      setClaimAmount('');
      setClaimReason('');
    }
  }, [visible]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: visible ? 300 : 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fadeAnim, scaleAnim]);

  const isValid = useMemo(() => {
    if (!selectedReason) {
      return false;
    }
    if (selectedReason === 'Fair') {
      return Boolean(amount);
    }
    if (selectedReason === 'Claim') {
      const n = Number(claimAmount);
      return (
        !Number.isNaN(n) && n > 0 && String(claimReason || '').trim().length > 0
      );
    }
    return true;
  }, [selectedReason, amount, claimAmount, claimReason]);

  const handleConfirm = () => {
    const numericAmount = Number(amount);

    if (!isValid) {
      ToastAndroid.show('Please complete required fields', ToastAndroid.SHORT);
      return;
    }

    if (selectedReason === 'Good') {
      onConfirm({type: 'Good'});
      return;
    }

    if (selectedReason === 'Claim') {
      onConfirm({
        type: 'Claim',
        claimAmount: Number(claimAmount) || 0,
        reason: String(claimReason || '').trim(),
      });
      return;
    }

    if (selectedReason === 'Fair' && numericAmount > securityFee) {
      ToastAndroid.show(
        `Fair amount cannot exceed €${securityFee}`,
        ToastAndroid.SHORT,
      );
      return;
    }

    onConfirm({
      type: 'Fair',
      amount: numericAmount || 0,
    });
  };

  const handleFairAmountChange = text => {
    const numericValue = Number(text);

    if (text === '') {
      setAmount('');
      return;
    }

    if (isNaN(numericValue)) return;

    if (numericValue > securityFee) {
      ToastAndroid.show(
        `Fair amount cannot exceed €${securityFee}`,
        ToastAndroid.SHORT,
      );
      setAmount(String(securityFee));
      return;
    }

    setAmount(text);
  };

  const handleClaimAmountChange = text => {
    if (text === '') {
      setClaimAmount('');
      return;
    }
    const numericValue = Number(text);
    if (Number.isNaN(numericValue)) {
      return;
    }
    setClaimAmount(text);
  };

  const claimTotalDisplay = useMemo(() => {
    const n = Number(claimAmount);
    const v = Number.isNaN(n) ? 0 : n;
    return `€${v.toFixed(2)}`;
  }, [claimAmount]);

  const scrollMaxHeight = Dimensions.get('window').height * 0.52;

  const handleSelectReason = item => {
    setSelectedReason(item);
    if (item !== 'Fair') {
      setAmount('');
    }
    if (item !== 'Claim') {
      setClaimAmount('');
      setClaimReason('');
    }
  };

  const renderReasonItem = ({item}) => (
    <TouchableOpacity
      style={styles.reasonItem}
      onPress={() => handleSelectReason(item)}>
      <View
        style={[
          styles.radioOuter,
          {
            backgroundColor:
              selectedReason === item ? COLORS.primary : COLORS.white,
          },
        ]}>
        {selectedReason === item && (
          <Image source={ICONS.cheackIcon} style={styles.checkIcon} />
        )}
      </View>
      <Text style={styles.reasonText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <Animated.View
          style={[styles.container, {transform: [{scale: scaleAnim}]}]}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {selectedReason === 'Claim'
                ? t('Claim Security Fees')
                : t('Pickup Status')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text="✕" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{maxHeight: scrollMaxHeight}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              {t('Rate the Condition of Booked Items')}
            </Text>

            {REASONS.map(item => (
              <View key={item}>{renderReasonItem({item})}</View>
            ))}

            {selectedReason === 'Fair' && (
              <TextField
                label={t(`Add security fee (€${securityFee})`)}
                placeholder={`Max €${securityFee}`}
                value={amount}
                keyboardType="numeric"
                onChangeText={handleFairAmountChange}
              />
            )}

            {selectedReason === 'Claim' && (
              <>
                <View style={styles.infoBox}>
                  <Text style={styles.listingTitleBold}>{listingTitle}</Text>
                  <Text style={styles.infoText}>
                    {t('Security Fee (Already Paid)')}: €
                    {securityFee.toFixed(2)}
                  </Text>
                  <Text style={styles.infoDesc}>
                    {t(
                      'The security fee will be processed in full along with any additional amount if your product has sustained severe damage beyond normal wear and tear.',
                    )}
                  </Text>

                  <TextField
                    label={t('Current claimed fee')}
                    placeholder={t('Enter claim amount')}
                    keyboardType="numeric"
                    value={claimAmount}
                    onChangeText={handleClaimAmountChange}
                    labelColor={COLORS.textLight}
                    inputBorderColor={COLORS.border}
                    styleProps={{marginTop: width(2)}}
                  />
                  <TextField
                    label={t('Description')}
                    placeholder={t('Enter description for the claim')}
                    value={claimReason}
                    onChangeText={setClaimReason}
                    multiline
                    numberOfLines={4}
                    labelColor={COLORS.textLight}
                    inputBorderColor={COLORS.border}
                    styleProps={{height: width(28), marginTop: width(1)}}
                  />
                </View>

                <View style={styles.claimFooter}>
                  <Text style={styles.claimFooterLabel}>
                    {t('Total Claimed Fees')}:
                  </Text>
                  <Text style={styles.claimFooterValue}>
                    {claimTotalDisplay}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <GradientButton
                text={t('Cancel')}
                type="outline"
                onPress={onClose}
                textStyle={styles.modalCancelText}
                styleContainer={styles.modalBtnHeight}
                outlineButtonStyle={styles.modalOutlineInner}
              />
            </View>
            <View style={styles.buttonHalf}>
              <GradientButton
                text={t('Confirm')}
                type="filled"
                onPress={handleConfirm}
                textStyle={styles.confirmBtnText}
                styleContainer={styles.modalBtnHeight}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default PickedupModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: width(5),
    padding: width(4),
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: width(2),
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  subtitle: {
    marginVertical: width(3),
    fontSize: 12,
    color: COLORS.textLight,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width(2),
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 6,
    marginRight: width(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  reasonText: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: width(4),
    marginVertical: width(3),
  },
  listingTitleBold: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(1),
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  infoDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: width(2),
    marginBottom: width(2),
    lineHeight: 16,
  },
  claimFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4FC',
    borderRadius: 10,
    paddingVertical: width(3),
    paddingHorizontal: width(4),
    marginBottom: width(2),
  },
  claimFooterLabel: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  claimFooterValue: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: width(2),
    marginTop: width(4),
  },
  buttonHalf: {
    flex: 1,
    minWidth: 0,
  },
  modalBtnHeight: {
    height: width(11),
  },
  modalOutlineInner: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCancelText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  confirmBtnText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});
