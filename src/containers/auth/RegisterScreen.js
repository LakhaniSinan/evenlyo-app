import React, {useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import CommonAlert from '../../components/commanAlert';
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import Loader from '../../components/loder';
import ContactNumberInput from '../../components/phoneInput';
import TextField from '../../components/textInput';
import {COLORS, SIZES} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import {registerUser} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';
// import {loginUser, registerUser} from '../../api/auth';
// import {setUserData} from '../../redux/slices/authSlice';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useDispatch} from 'react-redux';

const RegisterScreen = ({navigation}) => {
  const phoneInput = useRef(null);
  const modalRef = useRef(null);
  const {t} = useTranslation();
  // const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  // ✅ Validation helper
  const validateFields = fields => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let field of fields) {
      if (!formData[field] || formData[field].trim() === '') {
        return `Please enter your ${field}`;
      }
    }

    if (fields.includes('email') && !emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (fields.includes('password') && formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (
      fields.includes('confirmPassword') &&
      formData.password !== formData.confirmPassword
    ) {
      return 'Passwords do not match';
    }

    return null; // no errors
  };

  // ✅ Registration
  const handleRegister = async () => {
    const error = validateFields([
      'firstName',
      'lastName',
      'email',
      'contact',
      'address',
      'password',
      'confirmPassword',
    ]);

    if (error) {
      modalRef.current.show({status: 'error', message: error});
      return;
    }

    try {
      let payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        contactNumber: formData.contact,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      setIsLoading(true);
      const response = await registerUser(payload);
      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response.data?.message,
          handlePressOk: () => {
            modalRef.current.hide();
            navigation.navigate('RegistrationOtp', payload);
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerror123123');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => navigation.goBack();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <Background>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <Header languageModal={true} />
          <Text style={globalStyles.title}>{t('registerToAccount')}</Text>

          <View style={styles.form}>
            {/* First Name */}
            <TextField
              label={t('firstName')}
              placeholder={t('firstNamePlaceholder')}
              value={formData.firstName}
              onChangeText={val => handleInputChange('firstName', val)}
            />

            <View style={{height: 10}} />
            {/* Last Name */}
            <TextField
              label={t('lastName')}
              placeholder={t('lastNamePlaceholder')}
              value={formData.lastName}
              onChangeText={val => handleInputChange('lastName', val)}
            />

            <View style={{height: 10}} />
            {/* Email */}
            <TextField
              label={t('emailAddress')}
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChangeText={val => handleInputChange('email', val)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Address */}
            <TextField
              label={t('Address')}
              placeholder={t('Please enter your address')}
              value={formData.address}
              onChangeText={val => handleInputChange('address', val)}
              keyboardType="address"
              autoCapitalize="none"
            />

            <View style={{height: 10}} />
            {/* Contact Number */}
            <ContactNumberInput
              labelText={t('contactNumber')}
              labelColor={'#000'}
              phoneNumber={formData.contact}
              onChange={val => handleInputChange('contact', val)}
              ref={phoneInput}
              containerStyle={{backgroundColor: COLORS.backgroundLight}}
            />

            <View style={{height: 10}} />

            <TextField
              label={t('password')}
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChangeText={val => handleInputChange('password', val)}
              keyboardType="default"
              autoCapitalize="none"
              secure={showPassword}
              endIcon={ICONS.eyeIcon}
              onEndIconPress={() => setShowPassword(!showPassword)}
            />

            <View style={{height: 10}} />
            {/* Confirm Password */}
            <TextField
              label={t('password')}
              placeholder={t('passwordPlaceholder')}
              value={formData.confirmPassword}
              onChangeText={val => handleInputChange('confirmPassword', val)}
              keyboardType="default"
              autoCapitalize="none"
              secure={showPassword}
              endIcon={ICONS.eyeIcon}
              onEndIconPress={() => setShowPassword(!showPassword)}
            />
            <View style={{height: 25}} />
            <GradientButton
              text={t('register')}
              onPress={handleRegister}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
            />
          </View>

          <View style={{height: 10}} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <GradientText text={t('login')} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Background>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {flex: 1},
  form: {marginBottom: SIZES.lg, marginTop: 20},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width(2),
  },
  footerText: {color: COLORS.textLight, fontSize: 14},
});

export default RegisterScreen;
