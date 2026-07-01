import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';

import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {setUserData} from '../../redux/slice/auth';
import {loginClient, loginVendor, socialLogin} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import Loader from '../loder';
import TextField from '../textInput';
import {helper} from '../../helper';
import {ensureFcmTokenForAuth} from '../../utils/fcmToken';

const LoginModal = ({onClose, isVisible, handlePressFun}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  const [fcm, setFcm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({email: '', password: ''});

  useEffect(() => {
    handleGetFCM();
  }, []);

  const handleGetFCM = async () => {
    const res = await helper.requestNotificationPermission();
    console.log(res,"resresresresresresres");
    
    if (res === 'granted') {
      getFCMToken();
    } else {
    }
  };

  const getFCMToken = async () => {
    const fcmToken = await helper.getFCMTokenWithRetry();
    setFcm(fcmToken || '');
  };

  const handleInputChange = useCallback((key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  }, []);

  const showAlert = message => {
    modalRef.current?.show({status: 'error', message});
  };

  const validateInputs = () => {
    const {email, password} = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      return showAlert('Please enter your email.');
    }
    if (!emailRegex.test(email)) {
      return showAlert('Please enter a valid email address.');
    }
    if (!password.trim()) {
      return showAlert('Please enter your password.');
    }
    if (password.length < 8) {
      return showAlert('Password must be at least 8 characters long.');
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }
    const {email, password} = formData;

    try {
      setIsLoading(true);
      const fcmToken = (await ensureFcmTokenForAuth()) || fcm;
      const payload = {email, password, appFcm: fcmToken || ''};

      const response =
        user?.type === 'vendor'
          ? await loginVendor(payload)
          : await loginClient(payload);

      const {status, data} = response;
      setIsLoading(false);

      if (status === 200 || status === 201) {
        const userData = data?.user;
        const accessToken = data?.token;
        onClose();
        await AsyncStorage.multiSet([
          ['token', JSON.stringify(accessToken)],
          ['userData', JSON.stringify(userData)],
        ]);

        dispatch(setUserData(userData));
      } else {
        showAlert(data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.log('Login Error:', error);
      setIsLoading(false);
      showAlert('Something went wrong. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const userInfo = await GoogleSignin.signIn();
      let userData = userInfo?.data?.user;
      console.log(userData, 'userInfouserInfouserInfouserInfo');
      if (!userData) {
        return;
      }

      const fcmToken = await ensureFcmTokenForAuth();
      let params = {
        firstName: userData?.givenName || '',
        lastName: userData?.familyName || '',
        email: userData?.email || '',
        loginType: 'google',
        userType: user?.userType,
        picture: userData?.photo,
      };
      console.log(params, 'paramsparamsparamsparams');

      const response = await socialLogin({
        userData: params,
        type: 'App',
        appFcm: fcmToken || '',
      });
      console.log(response, 'responseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.user;
        console.log('User data:', data);
        await AsyncStorage.setItem(
          'token',
          JSON.stringify(response?.data?.tokens?.access),
        );
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        dispatch(setUserData(data));
        onClose();
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message || 'Login failed. Please try again.',
        });
      }
    } catch (error) {
      console.log('Google Sign-In error:', error);
    } finally {
      setIsLoading(false);
    }
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
          <Text style={globalStyles.title}>{t('loginToAccount')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <TextField
              label={t('email')}
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.spacer} />
            <TextField
              label={t('password')}
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
              secure={!showPassword}
              autoCapitalize="none"
              passwordToggle
              onEndIconPress={() => setShowPassword(prev => !prev)}
            />
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => handlePressFun('forgot')}>
              <GradientText
                text={`${t('forgotPassword')} ?`}
                customStyles={styles.forgotPasswordText}
              />
            </TouchableOpacity>
            <View style={{height: width(2)}} />
            <GradientButton
              text={t('login')}
              onPress={handleLogin}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              styleContainer={styles.loginButtonContainer}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>{t('or')}</Text>
            <View style={styles.divider} />
          </View>

          <GradientButton
            text={t('continueWithGoogle')}
            onPress={handleGoogleSignIn}
            type="outline"
            styleContainer={styles.socialButtonContainer}
            outlineButtonStyle={styles.socialButton}
            icon={ICONS.googleIcon}
          />
          <View style={{height: width(2)}} />
          {/* <GradientButton
            text={t('continueWithLinkedin')}
            onPress={() => {}}
            type="outline"
            styleProps={styles.socialButton}
            icon={ICONS.linkedInIcon}
            iconPosition="left"
          /> */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
            <TouchableOpacity onPress={() => handlePressFun('register')}>
              <GradientText text={t('signUp')} />
            </TouchableOpacity>
          </View>
        </ScrollView>
        <CommonAlert ref={modalRef} />
        <Loader isLoading={isLoading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 25,
    borderBottomColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
  },
  scrollView: {flex: 1, width: width(90)},
  form: {
    marginTop: 20,
    width: width(90),
    alignSelf: 'center',
  },
  spacer: {height: 10},
  forgotPasswordContainer: {marginTop: 10, alignSelf: 'flex-end'},
  forgotPasswordText: {fontSize: 12, textAlign: 'right'},
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width(4),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 10,
  },
  socialButtonContainer: {
    marginVertical: 10,
  },
  socialButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    marginRight: 5,
  },
  loginButtonContainer: {
    height: width(14),
  },
});

export default LoginModal;
