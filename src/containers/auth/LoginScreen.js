import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useEffect, useRef, useState} from 'react';
import {statusCodes} from '@react-native-google-signin/google-signin';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch} from 'react-redux';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import CommonAlert from '../../components/commanAlert';
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import Loader from '../../components/loder';
import TextField from '../../components/textInput';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  COLORS,
  fontFamly,
  SIZES,
} from '../../constants';
import {helper} from '../../helper';
import {ensureFcmTokenForAuth} from '../../utils/fcmToken';
import useTranslation from '../../hooks/useTranslation';
import {setUserData} from '../../redux/slice/auth';
import {loginClient, loginVendor, socialLogin} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

const LoginScreen = ({navigation, route}) => {
  const {type} = route.params;

  const [fcm, setFcm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const {t, currentLanguage} = useTranslation();

  useEffect(() => {
    handleGetFCM();
  }, []);

  const handleGetFCM = async () => {
    const res = await helper.requestNotificationPermission();
    if (res === 'granted') {
      getFCMToken();
    } else {
    }
  };

  const getFCMToken = async () => {
    const fcmToken = await helper.getFCMTokenWithRetry();
    setFcm(fcmToken || '');
  };

  const handleBackToOnboarding = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Onboarding'}],
    });
  };

  const navigateToRegister = () => {
    if (type == 'client') {
      navigation.navigate('Register');
    } else {
      navigation.navigate('VendorDetailStack');
    }
  };

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === '') {
      modalRef.current.show({
        status: 'error',
        message: 'Please enter your email.',
      });
    } else if (!emailRegex.test(email)) {
      modalRef.current.show({
        status: 'error',
        message: 'Please enter a valid email address.',
      });
    } else if (password.trim() === '') {
      modalRef.current.show({
        status: 'error',
        message: 'Please enter your password.',
      });
    } else if (password.length < 8) {
      modalRef.current.show({
        status: 'error',
        message: 'Password must be at least 8 characters long.',
      });
    } else {
      try {
        const fcmToken = (await ensureFcmTokenForAuth()) || fcm;
        console.log(fcmToken,"fcmTokenfcmTokenfcmTokenfcmToken");
        
        let payload = {
          email: email,
          password: password,
          userType: type,
          appFcm: fcmToken || '',
        };
        setIsLoading(true);
        const response =
          type == 'client'
            ? await loginClient(payload)
            : await loginVendor(payload);
        console.log(response, 'responseresponseresponseresponseresponse');

        let data = response?.data?.user;
        setIsLoading(false);

        if (response.status == 200 || response.status == 201) {
          await AsyncStorage.setItem(
            'token',
            JSON.stringify(response?.data?.token),
          );
          await AsyncStorage.setItem('userData', JSON.stringify(data));
          dispatch(setUserData(data));
        } else {
          modalRef.current.show({
            status: 'error',
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
        }
      } catch (error) {
        console.log(error, 'errorerrorerrorerror123');
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo, 'userInfouserInfouserInfo');

      let user = userInfo?.data?.user || userInfo?.user;

      if (!user) {
        modalRef.current.show({
          status: 'error',
          message: 'Unable to get Google account details. Please try again.',
        });
        return;
      }

      const fcmToken = await ensureFcmTokenForAuth();
      let params = {
        firstName: user?.givenName || '',
        lastName: user?.familyName || '',
        email: user?.email || '',
        loginType: 'google',
        userType: type,
        picture: user?.photo,
      };
      console.log(params, 'PARAMSSSS');

      const response = await socialLogin({
        userData: params,
        type: 'App',
        appFcm: fcmToken || '',
      });
        console.log(response.data,"responseresponseresponseresponse");
      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.user;
        console.log('User data:', data);
        await AsyncStorage.setItem(
          'token',
          JSON.stringify(response?.data?.tokens?.access),
        );
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        dispatch(setUserData(data));
      } else {
        modalRef.current.show({
          status: 'error',
          message:
            currentLanguage == 'en'
              ? response?.data?.message.en
              : response?.data?.message.nl,
        });
      }
    } catch (error) {
      console.log('Google Sign-In error:', error);
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        modalRef.current.show({
          status: 'error',
          message: 'Google Play Services are not available on this device.',
        });
        return;
      }
      if (error?.code === statusCodes.IN_PROGRESS) {
        return;
      }
      if (error?.code === statusCodes.DEVELOPER_ERROR) {
        modalRef.current.show({
          status: 'error',
          message:
            'Google Sign-In is not configured for this APK signature. Please contact support.',
        });
        return;
      }
      modalRef.current.show({
        status: 'error',
        message: 'Google Sign-In failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    const payload = {
      email: '',
      password: '',
      userType: 'client',
    };
    dispatch(setUserData(payload));
    AsyncStorage.setItem('userData', JSON.stringify(payload));
  };

  return (
    <Background>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Header languageModal showBack onBackPress={handleBackToOnboarding} />
          <Text style={[globalStyles.title, styles.screenTitle]}>
            {t('loginToAccount')}
          </Text>
          <View style={styles.form}>
            <TextField
              label={t('email')}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={{height: 10}} />
            <TextField
              label={t('password')}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              keyboardType="default"
              autoCapitalize="none"
              secure={showPassword}
              passwordToggle
              onEndIconPress={() => setShowPassword(!showPassword)}
            />
            <View style={{height: 10}} />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ForgotPassword', {type: type})
              }>
              <GradientText
                customStyles={{
                  fontSize: 12,
                  textAlign: 'right',
                }}
                text={t('forgotPassword') + ' ?'}
              />
            </TouchableOpacity>
            <View style={{height: 25}} />
            <GradientButton
              text={t('login')}
              onPress={handleLogin}
              type="filled"
              gradientColors={BRAND_BUTTON_GRADIENT_COLORS}
              styleContainer={styles.equalButtonContainer}
              styleProps={styles.equalFilledButton}
            />
            {type === 'client' && (
              <>
                <View style={{height: 10}} />
                <GradientButton
                  text={t('Skip')}
                  onPress={handleSkip}
                  type="outline"
                  styleContainer={styles.equalButtonContainer}
                  styleProps={{flex: 1}}
                  outlineButtonStyle={styles.equalOutlineButton}
                />
              </>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: width(2),
            }}>
            <View
              style={{
                width: width(40),
                height: width(0.5),
                backgroundColor: COLORS.border,
              }}
            />
            <Text style={{fontSize: 12, fontWeight: '600', color: COLORS.text}}>
              {t('or')}
            </Text>
            <View
              style={{
                width: width(40),
                height: width(0.5),
                backgroundColor: COLORS.border,
              }}
            />
          </View>
          <View style={{height: 25}} />
          {type == 'client' && (
            <GradientButton
              text={t('continueWithGoogle')}
              onPress={handleGoogleSignIn}
              type="outline"
              styleContainer={styles.equalButtonContainer}
              styleProps={{flex: 1}}
              outlineButtonStyle={styles.equalOutlineButton}
              icon={ICONS.googleIcon}
            />
          )}
          {/* <GradientButton
          text={t('continueWithLinkedin')}
          onPress={() => {}}
          type="outline"
          styleProps={{backgroundColor: COLORS.backgroundLight}}
          icon={ICONS.linkedInIcon}
          iconPosition="left"
        /> */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <GradientText text={t('signUp')} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
    </Background>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: width(6),
  },
  column: {
    width: width(90),
    alignSelf: 'center',
  },
  screenTitle: {
    marginTop: width(3),
    marginBottom: width(2),
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.lg,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.xxl,
  },
  form: {
    marginTop: SIZES.xxl,
    width: '100%',
  },
  equalButtonContainer: {
    height: width(11),
  },
  equalOutlineButton: {
    flex: 1,
    paddingVertical: 0,
    backgroundColor: COLORS.backgroundLight,
  },
  equalFilledButton: {
    flex: 1,
    paddingVertical: 0,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.md,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  forgotButton: {
    alignSelf: 'center',
  },
  forgotButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  footer: {
    marginTop: width(5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  signUpText: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    // fontWeight: '600',
  },
});

export default LoginScreen;
