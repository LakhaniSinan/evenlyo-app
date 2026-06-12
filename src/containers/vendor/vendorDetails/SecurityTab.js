import React, {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const MIN_PASSWORD_LENGTH = 6;

const SecurityTab = ({enteredPass, onPressBack, handleNextStep}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (enteredPass) {
      setPassword(enteredPass?.password || '');
      setConfirmPassword(enteredPass?.confirmPassword || '');
    }
  }, [enteredPass]);

  const showError = message => {
    modalRef.current?.show({status: 'error', message});
  };

  const handleContinue = () => {
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      return showError(t('passwordRequired'));
    }
    if (!trimmedConfirm) {
      return showError(t('confirmPasswordRequired'));
    }
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      return showError(t('passwordTooShort'));
    }
    if (trimmedPassword !== trimmedConfirm) {
      return showError(t('passwordsDontMatch'));
    }

    handleNextStep({
      password: trimmedPassword,
      confirmPassword: trimmedConfirm,
    });
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.titleText}>{t('vendorSecurityTitle')}</Text>
        <KeyboardAvoidingView>
          <TextField
            label={t('Set Password')}
            placeholder={t('passwordPlaceholder')}
            bgColor={COLORS.white}
            value={password}
            onChangeText={setPassword}
            secure={!showPassword}
            autoCapitalize="none"
            passwordToggle
            onEndIconPress={() => setShowPassword(prev => !prev)}
          />
          <View style={styles.fieldGap} />
          <TextField
            label={t('Re Enter Password')}
            placeholder={t('confirmPasswordPlaceholder')}
            bgColor={COLORS.white}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure={!showConfirmPassword}
            autoCapitalize="none"
            passwordToggle
            onEndIconPress={() => setShowConfirmPassword(prev => !prev)}
          />

          <View style={styles.buttonContainer}>
            <GradientButton
              text={t('back')}
              useGradient={true}
              onPress={() => onPressBack()}
              type="outline"
              styleProps={{flex: 1}}
              outlineButtonStyle={{flex: 1, paddingVertical: 0}}
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              icon={ICONS.backIcon}
              styleContainer={styles.backButton}
            />

            <GradientButton
              text={t('continue')}
              onPress={handleContinue}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              styleProps={{flex: 1}}
              styleContainer={styles.continueButton}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
      <CommonAlert ref={modalRef} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  form: {
    marginBottom: SIZES.lg,
    marginTop: 10,
    paddingHorizontal: SIZES.lg,
  },
  titleText: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
  },
  fieldGap: {
    height: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
  backButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
  continueButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
});

export default SecurityTab;
