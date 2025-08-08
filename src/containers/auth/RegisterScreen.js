import React, {useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import ContactNumberInput from '../../components/phoneInput';
import TextField from '../../components/textInput';
import {COLORS, SIZES} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import {globalStyles} from '../../styles/globalStyle';

const RegisterScreen = ({navigation}) => {
  const phoneInput = useRef(null);
  const {t} = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedRole, setSelectedRole] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    const {name, email, password, contact, confirmPassword} = formData;

    // Validation
    if (!name || !email || !contact || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    // try {
    //   await dispatch(registerUser({
    //     name,
    //     email,
    //     password,
    //     role: selectedRole,
    //   })).unwrap();
    //   // Navigation will be handled automatically by AppNavigator
    // } catch (error) {
    //   Alert.alert('Registration Failed', error.message || 'Something went wrong');
    // }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Background>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <Header />
        <Text style={globalStyles.title}>{t('registerToAccount')}</Text>

        <View style={styles.form}>
          <TextField
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
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
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />
          <ContactNumberInput
            labelColor={'#000'}
            phoneNumber={formData.contact}
            onChange={value => handleInputChange('contact', value)}
            ref={phoneInput}
          />

          <View style={{height: 10}} />
          <TextField
            label={t('password')}
            placeholder={t('passwordPlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 10}} />

          <TextField
            label={t('confirmPassword')}
            placeholder={t('confirmPasswordPlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{height: 25}} />
          <GradientButton
            text={t('register')}
            onPress={() => navigation.navigate('Home')}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
        <View style={{height: 10}} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <GradientText text={t('signIn')} />
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
    marginBottom: SIZES.xs,
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
});

export default RegisterScreen;
