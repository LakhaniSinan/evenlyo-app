import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {OtpInput} from 'react-native-otp-entry';
import {fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

export default function OTPInputScreen({onResendPress, setOtp}) {
  const {t} = useTranslation();
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const countdown = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleResend = () => {
    setTimer(30); // Counter restart
    onResendPress?.(); // Resend API
  };

  return (
    <View style={styles.container}>
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

      {timer > 0 ? (
        <Text style={styles.timerText}>
          {t('otpTimerSeconds', {seconds: timer})}
        </Text>
      ) : (
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.timerText2}>{t('resendCode')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  otpContainer: {},
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
    width: 40,
    height: 60,
  },
  otpText: {
    fontSize: 18,
    color: '#000',
  },
  timerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4E4E4E',
    marginTop: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  timerText2: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4A90E2',
    marginTop: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});
