import React, {useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {register, registerUser} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

import {ICONS} from '../../assets';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import Loader from '../loder';
import OTPInputScreen from '../otpScreen';
import ContactNumberInput from '../phoneInput';
import TextField from '../textInput';

const RegistrationModal = ({onClose, isVisible, handlePressFun}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [showOtp, setShowOtp] = useState(false);
  const phoneInput = useRef(null);
  const [otp, setOtp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) =>
    setFormData(prev => ({...prev, [field]: value}));

  const validateFields = () => {
    const {
      firstName,
      lastName,
      email,
      contact,
      address,
      password,
      confirmPassword,
    } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !address ||
      !password ||
      !confirmPassword
    )
      return 'Please fill out all required fields.';
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8)
      return 'Password must be at least 8 characters long.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  // ✅ Register User
  const handleRegister = async () => {
    const error = validateFields();
    if (error) return modalRef.current.show({status: 'error', message: error});

    try {
      setIsLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        contactNumber: formData.contact,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await registerUser(payload);
      const {status, data} = response || {};

      if (status === 200 || status === 201) {
        modalRef.current.show({
          status: 'ok',
          message: data?.message || 'Registration successful!',
          handlePressOk: () => {
            modalRef.current.hide();
            setShowOtp(true);
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: data?.message || 'Something went wrong.',
        });
      }
    } catch (err) {
      console.error('Registration Error:', err);
      modalRef.current.show({
        status: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const response = await registerUser({email: formData.email});

      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response.data?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerror123123234');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        contactNumber: formData.contact,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        otp: otp,
      };
      console.log(payload, 'payloadpayloadpayload');

      return;
      setIsLoading(true);
      const response = await register(payload);
      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response.data.message,
          handlePressOk: () => {
            modalRef.current.hide();
            onClose();
            handlePressFun('registeredOTP');
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerror3452343 ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      avoidKeyboard
      style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>
            {showOtp ? t('Enter OTP') : t('registerToAccount')}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 40}}>
          {!showOtp ? (
            <View style={styles.form}>
              {[
                {
                  key: 'firstName',
                  label: t('firstName'),
                  placeholder: t('firstNamePlaceholder'),
                },
                {
                  key: 'lastName',
                  label: t('lastName'),
                  placeholder: t('lastNamePlaceholder'),
                },
                {
                  key: 'email',
                  label: t('emailAddress'),
                  placeholder: t('emailPlaceholder'),
                  keyboardType: 'email-address',
                },
                {
                  key: 'address',
                  label: t('Address'),
                  placeholder: t('Please enter your address'),
                },
              ].map(({key, ...props}) => (
                <View key={key} style={styles.inputGap}>
                  <TextField
                    {...props}
                    value={formData[key]}
                    onChangeText={val => handleInputChange(key, val)}
                    autoCapitalize="none"
                  />
                </View>
              ))}

              <View style={styles.inputGap}>
                <ContactNumberInput
                  labelText={t('contactNumber')}
                  labelColor="#000"
                  phoneNumber={formData.contact}
                  onChange={val => handleInputChange('contact', val)}
                  ref={phoneInput}
                  containerStyle={{backgroundColor: COLORS.backgroundLight}}
                />
              </View>

              <View style={styles.inputGap}>
                <TextField
                  label={t('password')}
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChangeText={val => handleInputChange('password', val)}
                  secure={showPassword}
                  endIcon={ICONS.eyeIcon}
                  onEndIconPress={() => setShowPassword(prev => !prev)}
                />
              </View>

              <View style={styles.inputGap}>
                <TextField
                  label={t('confirmPassword')}
                  placeholder={
                    t('confirmPasswordPlaceholder') || t('passwordPlaceholder')
                  }
                  value={formData.confirmPassword}
                  onChangeText={val =>
                    handleInputChange('confirmPassword', val)
                  }
                  secure={showPassword}
                  endIcon={ICONS.eyeIcon}
                  onEndIconPress={() => setShowPassword(prev => !prev)}
                />
              </View>

              <GradientButton
                text={t('register')}
                onPress={handleRegister}
                type="filled"
                gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              />
            </View>
          ) : (
            <View style={{flex: 1, paddingVertical: width(20)}}>
              <View
                style={{
                  width: width(90),
                  backgroundColor: COLORS.backgroundLight,
                  borderRadius: width(5),
                  padding: width(4),
                  marginTop: width(20),
                  marginBottom: width(10),
                  height: width(90),
                }}>
                <Text
                  style={[
                    globalStyles.title,
                    {fontSize: 20, textAlign: 'center'},
                  ]}>
                  {t('enterCode')}
                </Text>
                <OTPInputScreen
                  onResendPress={handleResendCode}
                  setOtp={setOtp}
                />
                <View style={{marginTop: width(4)}}>
                  <GradientButton
                    onPress={handleVerifyOtp}
                    text={t('Verify OTP')}
                    textStyle={{
                      fontSize: 12,
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      color: 'white',
                    }}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => handlePressFun('goBackToLogin')}>
              <GradientText text={t('login')} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CommonAlert ref={modalRef} />
        <Loader isLoading={isLoading} />
      </View>
    </Modal>
  );
};

export default RegistrationModal;

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end'},
  container: {
    height: '90%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  form: {marginTop: 20},
  inputGap: {marginBottom: 12},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    marginRight: 5,
  },
});
