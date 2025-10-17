import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
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
import {loginUser, loginVendor} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import Loader from '../loder';
import TextField from '../textInput';

const LoginModal = ({onClose, isVisible, handlePressFun}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({email: '', password: ''});

  const handleInputChange = useCallback((key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  }, []);

  const showAlert = message => {
    modalRef.current?.show({status: 'error', message});
  };

  const validateInputs = () => {
    const {email, password} = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) return showAlert('Please enter your email.');
    if (!emailRegex.test(email))
      return showAlert('Please enter a valid email address.');
    if (!password.trim()) return showAlert('Please enter your password.');
    if (password.length < 8)
      return showAlert('Password must be at least 8 characters long.');

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    const {email, password} = formData;

    try {
      setIsLoading(true);
      const payload = {email, password};

      const response =
        user?.type === 'vendor'
          ? await loginVendor(payload)
          : await loginUser(payload);

      const {status, data} = response;
      setIsLoading(false);

      if (status === 200 || status === 201) {
        const userData = data?.user;
        const accessToken = data?.tokens?.access;
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
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
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
              endIcon={ICONS.eyeIcon}
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
            styleProps={styles.socialButton}
            icon={ICONS.googleIcon}
            iconPosition="left"
          />
          <View style={{height: width(2)}} />
          <GradientButton
            text={t('continueWithLinkedin')}
            onPress={() => {}}
            type="outline"
            styleProps={styles.socialButton}
            icon={ICONS.linkedInIcon}
            iconPosition="left"
          />

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
  socialButton: {backgroundColor: COLORS.backgroundLight, marginVertical: 10},
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
});

export default LoginModal;
