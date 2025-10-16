import React, {useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CustomPicker from '../../../components/customPicker';
import ContactNumberInput from '../../../components/phoneInput';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';
import CommonAlert from '../../../components/commanAlert';

const BusinessPersonalInfo = ({onPressBack, handleNextStep}) => {
  const phoneInput = useRef(null);
  const selecctSizeRef = useRef(null);
  const modalRef = useRef(null);
  const teamWorkRef = useRef(null);
  const {t} = useTranslation();
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    companyEmail: '',
    contact: '',
    companyAddress: '',
    companyWebsite: '',
    selecctSizeRef: '',
    teamWorkRef: '',
  });

  const [selectedRole, setSelectedRole] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    const {name, email, password, contact, confirmPassword} = formData;

    // Validation
    if (!name || !email || !contact || !password || !confirmPassword) {
      Alert.alert(t('Error'), t('Please fill all fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('Error'), t('Passwords do not match'));
      return;
    }

    if (!selectedRole) {
      Alert.alert(t('Error'), t('Please select your role'));
      return;
    }
  };

  const handleOpenWorkTypeModal = params => {
    console.log('handleOpenWorkTypeModal called with:', params);
    if (teamWorkRef?.current) {
      teamWorkRef.current.show(params);
    } else {
      console.warn('main Category ref is not available');
    }
  };

  const handleOpenSelection = params => {
    console.log('handleOpenWorkTypeModal called with:', params);
    if (selecctSizeRef?.current) {
      selecctSizeRef.current.show(params);
    } else {
      console.warn('main Category ref is not available');
    }
  };

  const handleSelectValue = (name, value) => {
    console.log('handleSelectValue called:', name, value);
    if (setFormData && typeof setFormData === 'function') {
      setFormData(prevState => ({
        ...prevState,
        [name]: value?.name || value,
      }));
    }
  };

  const handleContinue = () => {
    // safe string values
    const companyName = String(formData.companyName || '').trim();
    const businessType = String(formData.businessType || '').trim();
    const companyEmail = String(formData.companyEmail || '').trim();
    const contact = String(formData.contact || '').trim();
    const companyAddress = String(formData.companyAddress || '').trim();
    const companyWebsite = String(formData.companyWebsite || '').trim();
    const workType = String(formData.selecctSizeRef || '').trim();
    const teamSize = String(formData.teamWorkRef || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // sequential checks (one-by-one) with modal messages
    if (companyName === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter Company Name.',
      });
    } else if (businessType === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select Business Type.',
      });
    } else if (companyEmail === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter Company Email.',
      });
    } else if (!emailRegex.test(companyEmail)) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter a valid email address.',
      });
    } else if (contact === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter Contact Number.',
      });
    } else if (contact.replace(/\D/g, '').length < 7) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter a valid contact number.',
      });
    } else if (companyAddress === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter Company Address.',
      });
    } else if (companyWebsite === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please enter Company Website.',
      });
    } else if (workType === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select your Work Type.',
      });
    } else if (teamSize === '') {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select your Team Size.',
      });
    } else {
      // all validations passed
      handleNextStep(formData);
    }
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
          Your Business Info
        </Text>
        <KeyboardAvoidingView>
          <TextField
            label={t('Company  Name')}
            placeholder={t('Company Name')}
            bgColor={COLORS.white}
            value={formData.companyName}
            onChangeText={value => handleInputChange('companyName', value)}
            keyboardType="default"
            autoCapitalize="words"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Business type')}
            placeholder={t('Business type')}
            bgColor={COLORS.white}
            value={formData.businessType}
            onChangeText={value => handleInputChange('businessType', value)}
            keyboardType="default"
            autoCapitalize="words"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Company  Email Address')}
            placeholder={t('Company  Email Address')}
            value={formData.companyEmail}
            onChangeText={value => handleInputChange('companyEmail', value)}
            bgColor={COLORS.white}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />
          <ContactNumberInput
            labelText={t('Company Number')}
            labelColor={'#000'}
            phoneNumber={formData.contact}
            onChange={value => handleInputChange('contact', value)}
            ref={phoneInput}
            containerStyle={{
              backgroundColor: COLORS.white,
            }}
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Company Address')}
            placeholder={t('Company Address')}
            bgColor={COLORS.white}
            value={formData.companyAddress}
            onChangeText={value => handleInputChange('companyAddress', value)}
            keyboardType="default"
            autoCapitalize="sentences"
          />
          <View style={{height: 10}} />

          <TextField
            label={t('Company Website')}
            placeholder={t('URL')}
            bgColor={COLORS.white}
            value={formData.companyWebsite}
            onChangeText={value => handleInputChange('companyWebsite', value)}
            keyboardType="url"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />
          <CustomPicker
            ref={selecctSizeRef}
            label="Your Work Type "
            labelll="Your Work Type"
            handleOpenModal={handleOpenSelection}
            value={formData?.selecctSizeRef || ''}
            dropdownContainerStyle={{
              backgroundColor: COLORS.white,
            }}
            listData={[{name: 'Single'}, {name: 'Team'}]}
            name="selecctSizeRef"
            handleSelectValue={handleSelectValue}
          />
          <View style={{height: 15}} />
          <CustomPicker
            ref={teamWorkRef}
            label="Selection"
            labelll="1-5"
            handleOpenModal={handleOpenWorkTypeModal}
            value={formData?.teamWorkRef || ''}
            dropdownContainerStyle={{
              backgroundColor: COLORS.white,
            }}
            listData={[
              {name: "it's Just Me"},
              {name: '1-5'},
              {name: '11-20'},
              {name: '21-50'},
              {name: '51-100'},
              {name: '101-200'},
              {name: '201-500'},
              {name: '501-1000'},
              {name: '1001-2000'},
            ]}
            name="teamWorkRef"
            handleSelectValue={handleSelectValue}
          />
          <View style={{height: 15}} />
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

export default BusinessPersonalInfo;
