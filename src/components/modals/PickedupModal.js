import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
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
  const {t} = useTranslation();
  const securityFee = Number(booking?.pricingBreakdown?.securityFee || 0);

  const [selectedReason, setSelectedReason] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setAmount('');
      setNote('');
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
    if (!selectedReason) return false;
    if (selectedReason === 'Fair' && !amount) return false;
    if (selectedReason === 'Claim' && !amount) return false;
    return true;
  }, [selectedReason, amount, note]);

  const handleConfirm = () => {
    const numericAmount = Number(amount);

    if (!isValid) {
      ToastAndroid.show('Please complete required fields', ToastAndroid.SHORT);
      return;
    }

    if (selectedReason === 'Fair' && numericAmount > securityFee) {
      ToastAndroid.show(
        `Fair amount cannot exceed $${securityFee}`,
        ToastAndroid.SHORT,
      );
      return;
    }

    onConfirm({
      type: selectedReason,
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
        `Fair amount cannot exceed $${securityFee}`,
        ToastAndroid.SHORT,
      );
      setAmount(String(securityFee));
      return;
    }

    setAmount(text);
  };

  const renderReasonItem = ({item}) => (
    <TouchableOpacity
      style={styles.reasonItem}
      onPress={() => setSelectedReason(item)}>
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
            <Text style={styles.title}>{t('Pickup Status')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text="✕" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('Rate the Condition of Booked Items')}
          </Text>

          <FlatList
            data={REASONS}
            keyExtractor={item => item}
            renderItem={renderReasonItem}
          />

          {selectedReason === 'Fair' && (
            <TextField
              label={t(`Add security fee ($${securityFee})`)}
              placeholder={`Max $${securityFee}`}
              value={amount}
              keyboardType="numeric"
              onChangeText={handleFairAmountChange}
            />
          )}

          {selectedReason === 'Claim' && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Claim Security Fees</Text>
                <Text style={styles.infoText}>
                  Security Fee (Already Paid: ${securityFee})
                </Text>
                <Text style={styles.infoDesc}>
                  The security fee will be processed in full along with any
                  additional amount if your product has sustained severe damage
                  beyond normal wear and tear.
                </Text>
              </View>

              <TextField
                label={t('Claim Amount')}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </>
          )}

          <View style={styles.buttonRow}>
            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Cancel')}
                type="outline"
                onPress={onClose}
              />
            </View>
            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Confirm')}
                onPress={handleConfirm}
                disabled={!isValid}
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
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    padding: width(4),
    marginVertical: width(3),
  },
  infoTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  infoDesc: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(4),
  },
});
