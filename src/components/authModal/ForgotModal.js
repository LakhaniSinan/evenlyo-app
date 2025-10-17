import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {forgotUser, resetPassword, verifyForgotOtp} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import Loader from '../loder';
import ContactNumberInput from '../phoneInput';
import TextField from '../textInput';

const ForgotModal = ({isVisible, onClose, handlePressFun}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('verify');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const CELL_COUNT = 6;
  const ref = useBlurOnFulfill({value: otp, cellCount: CELL_COUNT});
  const [propsCodeField, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const handleSendOtp = async () => {
    const isPhone = activeTab === 'phone';
    const identifier = isPhone ? phoneNumber : email;

    if (!identifier) {
      return modalRef.current.show({
        status: 'error',
        message: isPhone
          ? 'Please enter your phone number.'
          : 'Please enter your email address.',
      });
    }

    try {
      setIsLoading(true);
      const payload = isPhone ? {phone: phoneNumber} : {email};
      const response = await forgotUser(payload);
      setIsLoading(false);

      if (response?.status === 200 || response?.status === 201) {
        setStep('otp');
        setTimer(60);
        modalRef.current.show({
          status: 'ok',
          message: response.data.message || 'OTP sent successfully!',
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message || 'Something went wrong!',
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      modalRef.current.show({
        status: 'error',
        message: 'Failed to send OTP. Please try again.',
      });
    }
  };

  const sendOtpRequest = async () => {
    const isPhone = activeTab === 'phone';
    const payload = isPhone ? {phone: phoneNumber} : {email};
    try {
      setIsLoading(true);
      const response = await forgotUser(payload);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      return {status: 0, data: {message: err?.message || 'Network error'}};
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      return modalRef.current.show({
        status: 'error',
        message: 'Please enter OTP first.',
      });
    }

    try {
      setIsLoading(true);
      const response = await verifyForgotOtp({email, otp});
      setIsLoading(false);

      if (response?.status === 200 || response?.status === 201) {
        const tokenFromResp =
          response?.data?.token || response?.data?.resetToken || null;
        if (tokenFromResp) setResetToken(tokenFromResp);
        modalRef.current.show({
          status: 'ok',
          message: 'OTP verified successfully!',
          handlePressOk: () => {
            setStep('reset');
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message || 'Invalid OTP!',
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerror');

      setIsLoading(false);
      modalRef.current.show({
        status: 'error',
        message: 'OTP verification failed. Try again.',
      });
    }
  };

  const handleResetPassword = async () => {
    if (password == '' || confirmPassword == '') {
      return modalRef.current.show({
        status: 'error',
        message: 'Password and confirm password fields are required.',
      });
    }
    if (password !== confirmPassword) {
      return modalRef.current.show({
        status: 'error',
        message: 'Password and confirm password do not match.',
      });
    }
    if (password.length < 8) {
      return modalRef.current.show({
        status: 'error',
        message: 'Password must be at least 8 characters long.',
      });
    }

    try {
      setIsLoading(true);
      const response = await resetPassword({password: password, resetToken});
      setIsLoading(false);
      if (response?.status === 200 || response?.status === 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message || 'Password reset successfully!',
          handlePressOk: () => {
            modalRef.current.hide();
            handlePressFun('reset');
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message || 'Failed to reset password.',
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('reset password error', error);
      modalRef.current.show({
        status: 'error',
        message: 'Failed to reset password. Try again.',
      });
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsResending(true);
    const response = await sendOtpRequest();
    setIsResending(false);
    if (response?.status === 200 || response?.status === 201) {
      setStep('otp');
      setTimer(60);
      modalRef.current.show({
        status: 'ok',
        message: response.data?.message || 'OTP resent successfully',
      });
      setOtp('');
    } else {
      modalRef.current.show({
        status: 'error',
        message: response?.data?.message || 'Failed to resend OTP',
      });
    }
  };

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const resetModalState = () => {
    setIsLoading(false);
    setActiveTab('phone');
    setPhoneNumber('');
    setEmail('');
    setOtp('');
    setStep('verify');
    setPassword('');
    setConfirmPassword('');
    setResetToken(null);
    setTimer(0);
    setIsResending(false);
  };

  useEffect(() => {
    if (isVisible) {
      resetModalState();
    } else {
      setTimer(0);
    }
  }, [isVisible]);

  const formatTimer = seconds => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
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
        <View style={styles.header}>
          <Text style={globalStyles.title}>
            {step === 'verify'
              ? t('Verification')
              : step === 'otp'
              ? t('Enter OTP')
              : t('Reset Pass')}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{paddingVertical: width(5)}}>
          {step === 'verify' ? (
            <>
              <View style={styles.tabContainer}>
                {['phone', 'email'].map(tab => (
                  <LinearGradient
                    key={tab}
                    colors={
                      activeTab === tab
                        ? ['#FF295D', '#E31B95', '#C817AE']
                        : ['#fff', '#fff', '#fff']
                    }
                    style={styles.tabGradient}>
                    <TouchableOpacity
                      style={styles.tab}
                      onPress={() => setActiveTab(tab)}>
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === tab && styles.activeTabText,
                        ]}>
                        {t(tab === 'phone' ? 'phoneNumber' : 'emailAddress')}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ))}
              </View>

              <View style={{marginVertical: width(3)}}>
                {activeTab === 'phone' ? (
                  <ContactNumberInput
                    labelText={t('phoneNumber')}
                    phoneNumber={phoneNumber}
                    onChange={setPhoneNumber}
                    labelColor={COLORS.text}
                    containerStyle={{
                      backgroundColor: COLORS.white,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  />
                ) : (
                  <TextField
                    label={t('emailAddress')}
                    placeholder={t('enterYourEmail')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    labelColor={COLORS.text}
                    bgColor={COLORS.white}
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton
                  text={t('continue')}
                  onPress={handleSendOtp}
                  type="filled"
                  gradientColors={['#FF295D', '#E31B95', '#C817AE']}
                />
              </View>
            </>
          ) : step === 'otp' ? (
            <>
              <View style={{alignItems: 'center', marginVertical: width(2)}}>
                <CodeField
                  ref={ref}
                  {...propsCodeField}
                  value={otp}
                  onChangeText={value => {
                    setOtp(value);
                  }}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({index, symbol, isFocused}) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: width(3),
                }}>
                <View>
                  <Text style={{color: COLORS.textLight, fontSize: 12}}>
                    {timer > 0
                      ? `Resend available in ${formatTimer(timer)}`
                      : 'You can resend OTP now'}
                  </Text>
                </View>
                <TouchableOpacity
                  disabled={timer > 0 || isResending}
                  onPress={handleResendOtp}>
                  <Text
                    style={{
                      color: timer > 0 ? COLORS.textLight : COLORS.primary,
                    }}>
                    {isResending ? 'Resending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton
                  text={t('Verify')}
                  onPress={handleVerifyOtp}
                  type="filled"
                  gradientColors={['#FF295D', '#E31B95', '#C817AE']}
                />
              </View>
            </>
          ) : (
            <>
              <View style={{marginTop: 10}}>
                <TextField
                  label={t('enterPasswrod')}
                  placeholder={t('passwordPlaceholder')}
                  keyboardType="default"
                  autoCapitalize="none"
                  bgColor={COLORS.white}
                  value={password}
                  onChangeText={setPassword}
                />

                <TextField
                  label={t('reEnterPassword')}
                  placeholder={t('passwordPlaceholder')}
                  keyboardType="default"
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  bgColor={COLORS.white}
                />
              </View>

              <View style={{marginTop: width(4)}}>
                <GradientButton
                  text={t('continue')}
                  onPress={handleResetPassword}
                  type="filled"
                  gradientColors={['#FF295D', '#E31B95', '#C817AE']}
                />
              </View>
            </>
          )}
        </ScrollView>
        <CommonAlert ref={modalRef} />
        <Loader isLoading={isLoading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end'},
  container: {
    height: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    backgroundColor: COLORS.backgroundLight,
    marginVertical: width(4),
    gap: width(1),
  },
  tabGradient: {flex: 1, borderRadius: width(3)},
  tab: {
    paddingVertical: width(3),
    borderRadius: width(3),
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    marginTop: width(8),
  },
  codeFieldRoot: {
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
  },
  cell: {
    width: 40,
    height: 50,
    lineHeight: 48,
    fontSize: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    marginHorizontal: 6,
    borderRadius: 6,
    color: '#000',
  },
  focusCell: {
    borderColor: '#FF295D',
  },
});

export default ForgotModal;
