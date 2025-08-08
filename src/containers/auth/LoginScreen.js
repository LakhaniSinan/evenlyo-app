import React, {useState} from 'react';
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
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import TextField from '../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import {setUserData} from '../../redux/slice/auth';
import {globalStyles} from '../../styles/globalStyle';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToHome = () => {
    dispatch(
      setUserData({
        name: 'Sinan',
      }),
    );
  };

  return (
    <Background>
      <ScrollView style={{flex: 1, width: width(90)}}>
        <Header />
        <Text style={globalStyles.title}>{t('loginToAccount')}</Text>
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
          />
          <View style={{height: 10}} />
          <TouchableOpacity>
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
            onPress={navigateToHome}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View
            style={{
              width: width(45),
              height: width(0.5),
              backgroundColor: COLORS.border,
            }}
          />
          <Text style={{fontSize: 12, fontWeight: '600', color: COLORS.text}}>
            {t('or')}
          </Text>
          <View
            style={{
              width: width(45),
              height: width(0.5),
              backgroundColor: COLORS.border,
            }}
          />
        </View>
        <View style={{height: 25}} />
        <GradientButton
          text={t('continueWithGoogle')}
          onPress={() => navigation.navigate('Home')}
          type="outline"
          styleProps={{backgroundColor: COLORS.backgroundLight}}
          icon={ICONS.googleIcon}
          iconPosition="left"
        />
        <View style={{height: 10}} />
        <GradientButton
          text={t('continueWithLinkedin')}
          onPress={() => navigation.navigate('Home')}
          type="outline"
          styleProps={{backgroundColor: COLORS.backgroundLight}}
          icon={ICONS.linkedInIcon}
          iconPosition="left"
        />
        <View style={{height: 10}} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <GradientText text={t('signUp')} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
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
    width: width(90),
    alignSelf: 'center',
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
