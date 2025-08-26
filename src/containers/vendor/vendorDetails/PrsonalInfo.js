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
import GradientText from '../../../components/gradiantText';
import ContactNumberInput from '../../../components/phoneInput';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const PersonalInfo = ({onPressBack, handleNextStep}) => {
  const phoneInput = useRef(null);
  const {t} = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    city: '',
    postalCode: '',
    address: '',
    cnicPassport: '',
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
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('emailAddress')}
            placeholder={t('emailPlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            bgColor={COLORS.white}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />
          <ContactNumberInput
            labelText={t('contactNumber')}
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
            label={t('City')}
            placeholder={t('Enter Your City')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="text"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />

          <TextField
            label={t('Postal Code')}
            placeholder={t('Enter Your Postal Code')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />

          <TextField
            label={t('Address')}
            placeholder={t('Enter Your Address')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="text"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />

          <TextField
            label={t('CNIC / Passport Details')}
            placeholder={t('Enter Your CNIC / Passport Details')}
            bgColor={COLORS.white}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="text"
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
              onPress={() => handleNextStep(formData)}
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
