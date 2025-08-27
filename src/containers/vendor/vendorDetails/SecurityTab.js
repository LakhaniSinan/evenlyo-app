import React from 'react';
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
import TextField from '../../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const SecurityTab = ({onPressBack, handleNextStep}) => {
  const {t} = useTranslation();

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black,
            textAlign: 'center',
          }}>
          Security
        </Text>
        <KeyboardAvoidingView>
          <TextField
            label={t('Set Password')}
            placeholder={t('passwordPlaceholder')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />
          <TextField
            label={t('Re Enter Password')}
            placeholder={t('Re Enter Password')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.buttonContainer}>
            <GradientButton
              text={t('back')}
              useGradient={true}
              onPress={() => onPressBack()}
              type="outline"
              styleProps={{
                paddingVertical: 14,
              }}
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              icon={ICONS.backIcon}
            />

            <GradientButton
              text={t('continue')}
              onPress={() => handleNextStep()}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              styleProps={{flex: 1}}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
    marginTop: 10,
    paddingHorizontal: SIZES.lg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  form: {
    marginBottom: SIZES.lg,
    marginTop: 20,
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
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  roleContainer: {
    marginBottom: SIZES.lg,
  },
  roleButton: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: width(1),
  },
  roleButtonTextSelected: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.md,
    marginTop: SIZES.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width(2),
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default SecurityTab;
