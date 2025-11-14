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
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const BusinessPersonalInfo = ({businessInfo, onPressBack, handleNextStep}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const workTypeRef = useRef(null);
  const teamSizeRef = useRef(null);

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
        contact: businessInfo?.contact || '',
        companyAddress: businessInfo?.companyAddress || '',
        companyWebsite: businessInfo?.companyWebsite || '',
        passportNumber: businessInfo?.passportNumber || '',
        kvknumber: businessInfo?.kvknumber || '',
        workType: businessInfo?.workType || '',
        teamSize: businessInfo?.teamSize || '',
        tagline: businessInfo?.tagline || {en: '', nl: ''},
        description: businessInfo?.description || {en: '', nl: ''},
      });
    }
  }, [businessInfo]);

  // generic text handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  // language-based tagline & description handler
  const handleLangBasedInput = (field, text) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [currentLanguage]: text,
      },
    }));
  };

  // select value handler for dropdowns
  const handleSelectValue = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value?.name || value,
    }));
  };

  // validation and next
  const handleContinue = () => {
    const {
      companyName,
      companyEmail,
      contact,
      companyAddress,
      companyWebsite,
      workType,
      teamSize,
    } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const showError = message =>
      modalRef.current?.show({status: 'error', message});

    if (!companyName) return showError('Please enter Company Name.');
    if (!companyEmail) return showError('Please enter Company Email.');
    if (!emailRegex.test(companyEmail))
      return showError('Please enter a valid email address.');
    if (!contact) return showError('Please enter Contact Number.');
    if (contact.replace(/\D/g, '').length < 7)
      return showError('Please enter a valid contact number.');
    if (!companyAddress) return showError('Please enter Company Address.');
    if (!companyWebsite) return showError('Please enter Company Website.');
    if (!workType) return showError('Please select your Work Type.');
    if (!teamSize) return showError('Please select your Team Size.');

    handleNextStep(formData);
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.titleText}>Your Business Info</Text>

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
            placeholder={t('0000*****')}
            value={formData.contact}
            onChangeText={val => handleInputChange('contact', val)}
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

          {/* Website */}
          <TextField
            label={t('Company Website')}
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

          {/* Passport */}
          <TextField
            label={t('Passport Number')}
            placeholder={t('Enter Passport Number')}
            value={formData.passportNumber}
            onChangeText={val => handleInputChange('passportNumber', val)}
            bgColor={COLORS.white}
            keyboardType="phone-pad"
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

          <Spacing />

          {/* Team Size */}
          <CustomPicker
            ref={teamSizeRef}
            labelll={t('Team Size')}
            label={t('Team Size')}
            value={formData.teamSize}
            listData={[
              {name: "It's Just Me"},
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
            disable={formData.workType === 'Single'}
            dropdownContainerStyle={{backgroundColor: COLORS.white}}
          />

          <Spacing />

          {/* Tagline */}
          <TextField
            label={t('Tagline')}
            placeholder={t('Add Why Choose Us')}
            value={
              currentLanguage === 'en'
                ? formData.tagline.en
                : formData.tagline.nl
            }
            onChangeText={text => handleLangBasedInput('tagline', text)}
            bgColor={COLORS.white}
          />

          <Spacing />

          {/* Description */}
          <TextField
            label={t('Description')}
            placeholder={t(
              'Focused on creating vibes through immersive sound...',
            )}
            value={
              currentLanguage === 'en'
                ? formData.description.en
                : formData.description.nl
            }
            onChangeText={text => handleLangBasedInput('description', text)}
            bgColor={COLORS.white}
            multiline
            numberOfLines={3}
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <GradientButton
              text={t('Back')}
              onPress={onPressBack}
              type="outline"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              icon={ICONS.backIcon}
              styleProps={{paddingVertical: 14}}
            />
            <GradientButton
              text={t('Continue')}
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

// simple spacing component
const Spacing = () => <View style={{height: 10}} />;

const styles = StyleSheet.create({
  scrollView: {flex: 1},
  form: {marginBottom: SIZES.lg, marginTop: 20},
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
});

export default BusinessPersonalInfo;
