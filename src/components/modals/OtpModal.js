import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {OtpInput} from 'react-native-otp-entry';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const OtpModal = ({visible, onClose}) => {
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState('');
  const {t} = useTranslation();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

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
          <Text style={styles.title}>{t('Enter OTP Code')}</Text>
          <OtpInput
            numberOfDigits={6}
            onTextChange={text => setOtp(text)}
            focusColor="#4A90E2"
            focusStickBlinkingDuration={500}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
            }}
          />
          <Text style={styles.timerText}>{timer} Sec</Text>
          {timer == 0 && <Text style={styles.timerText2}>Resend Code</Text>}
          <View style={{marginVertical: width(5)}}>
            <GradientButton
              text={t('Send')}
              onPress={onClose}
              textStyle={{
                fontSize: 14,
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.white,
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

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
    width: width(90),
    paddingVertical: width(5),
    paddingHorizontal: width(5),
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
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    textAlign: 'center',
    marginVertical: width(2),
    marginBottom: width(7),
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  languageContainer: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
  },
  languageInfo: {
    flex: 1,
  },
  languageText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  selectedLanguageText: {
    color: COLORS.primary,
  },
  nativeText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  selectedNativeText: {
    color: COLORS.primary + 'AA',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 14,
    height: 14,
    tintColor: COLORS.white,
  },
  timerText: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.textDark,
    marginTop: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  timerText2: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.textDark,
    marginTop: 5,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});

export default OtpModal;
