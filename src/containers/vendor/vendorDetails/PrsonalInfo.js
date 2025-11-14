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

const PersonalInfo = ({personalInfo, onPressBack, handleNextStep}) => {
  const modalRef = useRef(null);
  const phoneInput = useRef(null);
  const {t, currentLanguage} = useTranslation();
  console.log(personalInfo, 'personalInfopersonalInfopersonalInfo');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    city: '',
    postalCode: '',
    address: '',
    cnicPassport: '',
    tagline: {en: '', nl: ''},
    description: {en: '', nl: ''},
  });

  useEffect(() => {
    if (personalInfo) {
      setFormData({
        firstName: personalInfo?.firstName || '',
        lastName: personalInfo?.lastName || '',
        email: personalInfo?.email || '',
        contact: personalInfo?.contact || '',
        city: personalInfo?.city || '',
        postalCode: personalInfo?.postalCode || 0,
        address: personalInfo?.address || '',
        cnicPassport: personalInfo?.cnicPassport || '',
        tagline: personalInfo?.tagline || {en: '', nl: ''},
        description: personalInfo?.description || {en: '', nl: ''},
      });
    }
  }, [personalInfo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleContinue = () => {
    const {
      firstName,
      lastName,
      email,
      contact,
      city,
      postalCode,
      address,
      cnicPassport,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !city ||
      !postalCode ||
      !address ||
      !cnicPassport
    ) {
      return modalRef.current.show({
        status: 'error',
        message: 'All fields are required',
      });
    }
    handleNextStep(formData);
  };
  const handleLangBasedInput = (field, text) => {
    setFormData(prev => ({
      ...prev,
      [field]:
        currentLanguage === 'en' ? {en: text, nl: ''} : {en: '', nl: text},
    }));
  };

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
          Personal Information
        </Text>
        <KeyboardAvoidingView>
          <TextField
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            bgColor={COLORS.white}
            value={formData.firstName}
            onChangeText={value => handleInputChange('firstName', value)}
            keyboardType="default"
            autoCapitalize="words"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            bgColor={COLORS.white}
            value={formData.lastName}
            onChangeText={value => handleInputChange('lastName', value)}
            keyboardType="default"
            autoCapitalize="words"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('emailAddress')}
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            bgColor={COLORS.white}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('contactNumber')}
            placeholder={t('00000*****')}
            value={formData.contact}
            onChangeText={value => handleInputChange('contact', value)}
            bgColor={COLORS.white}
            keyboardType="numeric"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('City')}
            placeholder={t('Enter Your City')}
            bgColor={COLORS.white}
            value={formData.city}
            onChangeText={value => handleInputChange('city', value)}
            keyboardType="default"
            autoCapitalize="words"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Postal Code')}
            placeholder={t('Enter Your Postal Code')}
            bgColor={COLORS.white}
            value={formData.postalCode}
            onChangeText={value => handleInputChange('postalCode', value)}
            keyboardType="numeric"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Address')}
            placeholder={t('Enter Your Address')}
            bgColor={COLORS.white}
            value={formData.address}
            onChangeText={value => handleInputChange('address', value)}
            keyboardType="default"
            autoCapitalize="sentences"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('CNIC / Passport Details')}
            placeholder={t('Enter Your CNIC / Passport Details')}
            bgColor={COLORS.white}
            value={formData.cnicPassport}
            onChangeText={value => handleInputChange('cnicPassport', value)}
            keyboardType="numeric"
            autoCapitalize="characters"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Tagline')}
            placeholder={t('Add Why Choose Us')}
            value={
              currentLanguage === 'en'
                ? formData.tagline.en
                : formData.tagline.nl
            }
            bgColor={COLORS.white}
            onChangeText={text => handleLangBasedInput('tagline', text)}
          />

          <View style={{height: 10}} />
          <TextField
            label={t('description')}
            placeholder={t(
              'Focused on creating vibes through immersive sound...',
            )}
            multiline
            numberOfLines={3}
            bgColor={COLORS.white}
            value={
              currentLanguage === 'en'
                ? formData.description.en
                : formData.description.nl
            }
            onChangeText={text => handleLangBasedInput('description', text)}
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
              onPress={handleContinue}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              styleProps={{flex: 1}}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
      <CommonAlert ref={modalRef} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

export default PersonalInfo;
