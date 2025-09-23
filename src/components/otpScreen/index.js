import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {OtpInput} from 'react-native-otp-entry';
import {fontFamly} from '../../constants';

export default function OTPInputScreen() {
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

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
      <Text style={styles.timerText}>{timer} Sec</Text>
      {timer == 0 && (
        <TouchableOpacity>
          <Text style={styles.timerText2}>Resend Code</Text>
        </TouchableOpacity>
      )}
      {timer == 0 && (
        <TouchableOpacity>
          <Text style={styles.timerText2}>Call Request</Text>
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
    color: '#4E4E4E',
    marginTop: 5,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});
