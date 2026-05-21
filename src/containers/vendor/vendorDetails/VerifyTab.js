import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import GradientText from '../../../components/gradiantText';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {globalStyles} from '../../../styles/globalStyle';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VerifyTab = ({onPressBack, handleNextStep, setVerification}) => {
  const [email, setEmail] = useState('');
  const {t} = useTranslation();
  const modalRef = useRef(null);

  const showError = message => {
    modalRef.current?.show({status: 'error', message});
  };

  const handleContinue = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return showError(t('emailRequired'));
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return showError(t('invalidEmail'));
    }

    setVerification({
      email: trimmedEmail,
    });

    handleNextStep({email: trimmedEmail});
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={[globalStyles.title, styles.title]}>
          {t('verification')}
        </Text>

        <View style={styles.fieldContainer}>
          <TextField
            label={t('emailAddress')}
            placeholder={t('enterYourEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            labelColor={COLORS.text}
            bgColor={COLORS.white}
            styleProps={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            text={<GradientText text={t('back')} />}
            onPress={onPressBack}
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
      </View>
      <CommonAlert ref={modalRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(5),
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    gap: 10,
    marginTop: width(1),
  },
  input: {
    paddingVertical: width(3),
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

export default VerifyTab;
