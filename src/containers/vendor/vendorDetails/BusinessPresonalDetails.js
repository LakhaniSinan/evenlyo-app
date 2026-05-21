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
import CustomPicker from '../../../components/customPicker';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

// E.164: + then 7–15 digits (ITU max 15), first digit 1–9 (no leading national 0).
const E164_MAX_DIGITS = 15;
const E164_MIN_DIGITS = 7;

const compactPhoneInput = value =>
  String(value ?? '')
    .trim()
    .replace(/\s/g, '');

// Strips to +digits; caps length; treats 00… as international prefix; allows lone "+" while editing.
const normalizeToE164 = input => {
  const compact = compactPhoneInput(input);
  if (compact === '') {
    return '';
  }
  if (compact === '+') {
    return '+';
  }
  let digits = compact.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  digits = digits.replace(/^0+/, '');
  if (!digits) {
    return '';
  }
  if (!/^[1-9]/.test(digits)) {
    return '';
  }
  digits = digits.slice(0, E164_MAX_DIGITS);
  return `+${digits}`;
};

const isValidE164 = value => {
  if (!value || value === '+') {
    return false;
  }
  return /^\+[1-9]\d{6,14}$/.test(value);
};

const BusinessPersonalInfo = ({businessInfo, onPressBack, handleNextStep}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const workTypeRef = useRef(null);
  const teamSizeRef = useRef(null);

  const normalizeLocalizedValue = value => {
    if (typeof value === 'string') {
      return {en: value, nl: ''};
    }
    return {
      en: value?.en || '',
      nl: value?.nl || '',
    };
  };

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    contact: '',
    companyAddress: '',
    companyWebsite: '',
    passportNumber: '',
    kvknumber: '',
    workType: '',
    teamSize: '',
    tagline: {en: '', nl: ''},
    description: {en: '', nl: ''},
  });

  // populate form data from props
  useEffect(() => {
    if (businessInfo) {
      setFormData({
        companyName: businessInfo?.companyName || '',
        companyEmail: businessInfo?.companyEmail || '',
        contact:
          normalizeToE164(businessInfo?.contact || '') ||
          businessInfo?.contact ||
          '',
        companyAddress: businessInfo?.companyAddress || '',
        companyWebsite: businessInfo?.companyWebsite || '',
        passportNumber: businessInfo?.passportNumber || '',
        kvknumber: businessInfo?.kvknumber || '',
        workType: businessInfo?.workType || '',
        teamSize:
          businessInfo?.workType === 'Single'
            ? "It's Just Me"
            : businessInfo?.teamSize || '',
        tagline: normalizeLocalizedValue(businessInfo?.tagline),
        description: normalizeLocalizedValue(businessInfo?.description),
      });
    }
  }, [businessInfo]);

  // generic text handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  // language-based tagline & description handler
  const handleLangBasedInput = (field, language, text) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: text,
      },
    }));
  };

  // select value handler for dropdowns
  const handleSelectValue = (name, value) => {
    const selectedValue = value?.name || value;
    setFormData(prev => {
      if (name === 'workType') {
        const isSingle = selectedValue === 'Single';
        return {
          ...prev,
          workType: selectedValue,
          teamSize: isSingle
            ? "It's Just Me"
            : prev.teamSize === "It's Just Me"
            ? ''
            : prev.teamSize,
        };
      }

      return {
        ...prev,
        [name]: selectedValue,
      };
    });
  };

  // validation and next
  const handleContinue = () => {
    const {
      companyName,
      companyEmail,
      contact,
      companyAddress,
      workType,
      teamSize,
      tagline,
      description,
    } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const showError = message =>
      modalRef.current?.show({status: 'error', message});

    if (!companyName?.trim()) {
      return showError(t('validationCompanyNameRequired'));
    }
    if (!companyEmail?.trim()) {
      return showError(t('validationCompanyEmailRequired'));
    }
    if (!emailRegex.test(companyEmail.trim())) {
      return showError(t('invalidEmail'));
    }
    if (!contact || contact === '+') {
      return showError(t('validationContactRequired'));
    }
    if (!isValidE164(contact)) {
      return showError(
        t('validationContactE164', {
          min: E164_MIN_DIGITS,
          max: E164_MAX_DIGITS,
        }),
      );
    }
    if (!companyAddress?.trim()) {
      return showError(t('validationCompanyAddressRequired'));
    }
    if (!workType) {
      return showError(t('validationWorkTypeRequired'));
    }
    if (workType === 'Team' && !teamSize) {
      return showError(t('validationTeamSizeRequired'));
    }
    if (!tagline?.nl?.trim()) {
      return showError(t('validationTaglineDutchRequired'));
    }
    if (!description?.nl?.trim()) {
      return showError(t('validationDescriptionDutchRequired'));
    }

    handleNextStep({
      ...formData,
      teamSize: workType === 'Single' ? "It's Just Me" : formData.teamSize,
    });
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.titleText}>{t('vendorBusinessInfoTitle')}</Text>

        <KeyboardAvoidingView>
          {/* Company Name */}
          <TextField
            label={t('Company Name')}
            placeholder={t('Enter Company Name')}
            value={formData.companyName}
            onChangeText={val => handleInputChange('companyName', val)}
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Company Email */}
          <TextField
            label={t('Company Email')}
            placeholder={t('Enter Company Email')}
            value={formData.companyEmail}
            onChangeText={val => handleInputChange('companyEmail', val)}
            keyboardType="email-address"
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Contact */}
          <TextField
            label={t('Company Number')}
            placeholder={t('+31612345678')}
            value={formData.contact}
            onChangeText={val =>
              handleInputChange('contact', normalizeToE164(val))
            }
            keyboardType="phone-pad"
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Address */}
          <TextField
            label={t('Company Address')}
            placeholder={t('Enter Company Address')}
            value={formData.companyAddress}
            onChangeText={val => handleInputChange('companyAddress', val)}
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Website (optional) */}
          <TextField
            label={t('Company Website (optional)')}
            placeholder={t('Enter Website URL')}
            value={formData.companyWebsite}
            onChangeText={val => handleInputChange('companyWebsite', val)}
            keyboardType="url"
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* KVK Number */}
          <TextField
            label={t('KVK Number')}
            placeholder={t('Enter KVK Number')}
            value={formData.kvknumber}
            onChangeText={val => handleInputChange('kvknumber', val)}
            bgColor={COLORS.white}
            keyboardType="phone-pad"
          />

          <Spacing />

          {/* Passport (optional) */}
          <TextField
            label={t('Passport Number (optional)')}
            placeholder={t('Enter Passport Number')}
            value={formData.passportNumber}
            onChangeText={val => handleInputChange('passportNumber', val)}
            bgColor={COLORS.white}
            keyboardType="default"
          />

          <Spacing />

          {/* Work Type */}
          <CustomPicker
            ref={workTypeRef}
            labelll={t('Your Work Type')}
            label={t('Your Work Type')}
            value={formData.workType}
            listData={[{name: 'Single'}, {name: 'Team'}]}
            name="workType"
            handleSelectValue={handleSelectValue}
            dropdownContainerStyle={{backgroundColor: COLORS.white}}
          />

          {formData.workType === 'Team' && (
            <>
              <Spacing />
              <CustomPicker
                ref={teamSizeRef}
                labelll={t('Team Size')}
                label={t('Team Size')}
                value={formData.teamSize}
                listData={[
                  {name: '1-5'},
                  {name: '11-20'},
                  {name: '21-50'},
                  {name: '51-100'},
                  {name: '101-200'},
                  {name: '201-500'},
                  {name: '501-1000'},
                  {name: '1001-2000'},
                ]}
                name="teamSize"
                handleSelectValue={handleSelectValue}
                dropdownContainerStyle={{backgroundColor: COLORS.white}}
              />
            </>
          )}

          <Spacing />

          {/* Tagline (Dutch, required) */}
          <TextField
            label={t('Tagline (Dutch)')}
            placeholder={t('Add Why Choose Us (Dutch)')}
            value={formData.tagline.nl}
            onChangeText={text => handleLangBasedInput('tagline', 'nl', text)}
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Tagline (English, optional) */}
          <TextField
            label={t('taglineEnglishOptional')}
            placeholder={t('Add Why Choose Us (English)')}
            value={formData.tagline.en}
            onChangeText={text => handleLangBasedInput('tagline', 'en', text)}
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Description (Dutch, required) */}
          <TextField
            label={t('Description (Dutch)')}
            placeholder={t(
              'Focused on creating vibes through immersive sound... (Dutch)',
            )}
            value={formData.description.nl}
            onChangeText={text =>
              handleLangBasedInput('description', 'nl', text)
            }
            bgColor={COLORS.white}
            multiline
            numberOfLines={3}
          />

          <Spacing />

          {/* Description (English, optional) */}
          <TextField
            label={t('descriptionEnglishOptional')}
            placeholder={t(
              'Focused on creating vibes through immersive sound... (English)',
            )}
            value={formData.description.en}
            onChangeText={text =>
              handleLangBasedInput('description', 'en', text)
            }
            bgColor={COLORS.white}
            multiline
            numberOfLines={3}
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <GradientButton
              text={t('back')}
              useGradient
              onPress={onPressBack}
              type="outline"
              gradientColors={GRADIENT_COLORS}
              icon={ICONS.backIcon}
              iconStyle={styles.backIcon}
              styleProps={{flex: 1}}
              outlineButtonStyle={{flex: 1, paddingVertical: 0}}
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

// simple spacing component
const Spacing = () => <View style={{height: 10}} />;

const styles = StyleSheet.create({
  scrollView: {flex: 1},
  titleText: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
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
  backIcon: {
    width: 15,
    height: 15,
  },
});

export default BusinessPersonalInfo;
