import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { width } from 'react-native-dimension';
import { ICONS, IMAGES } from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import TextField from '../../components/textInput';
import { COLORS, fontFamly, SIZES } from '../../constants';
import { globalStyles } from '../../styles/globalStyle';
import LinearGradient from 'react-native-linear-gradient';
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../store/slice/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToHome = () => {
    dispatch(setUserData({
      name: "Sinan"
    }))
  }

  return (
    <Background>
      <ScrollView style={{ flex: 1, width: width(90), }}>
        <Header />
        <Text style={globalStyles.title}>Login in to your Account</Text>
        <View style={styles.form}>
          <TextField
            label={'Email'}
            placeholder="Enter Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{ height: 10 }} />
          <TextField
            label={'Password'}
            placeholder="Enter Your Password"
            value={password}
            onChangeText={setPassword}
            keyboardType="default"
            autoCapitalize="none"
          />
          <View style={{ height: 10 }} />
          <TouchableOpacity>
            <GradientText customStyles={{
              fontSize: 12,
              textAlign: "right"
            }} text={"Forgot Password ?"} />
            {/* <Text
                style={{
                  fontSize: 12,
                  // fontWeight: 'bold',
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  textAlign: 'right',
                  color: COLORS.primary,
                }}>
                Forgot Password?
              </Text> */}
            {/* </GradientText> */}

          </TouchableOpacity>
          <View style={{ height: 25 }} />
          <GradientButton
            text="Login"
            onPress={navigateToHome}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: width(45),
              height: width(0.5),
              backgroundColor: COLORS.border,
            }}
          />
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.text }}>
            OR
          </Text>
          <View
            style={{
              width: width(45),
              height: width(0.5),
              backgroundColor: COLORS.border,
            }}
          />
        </View>
        <View style={{ paddingHorizontal: SIZES.lg }}>
          <View style={{ height: 25 }} />
          <GradientButton
            text="Continue with Google"
            onPress={() => navigation.navigate('Home')}
            type="outline"
            gradientColors={['#F6F6F6', '#F6F6F6']}
            styleProps={{ backgroundColor: '#F6F6F6' }}
            icon={ICONS.googleIcon}
            iconPosition="left"
          />
          <View style={{ height: 10 }} />
          <GradientButton
            text="Continue with Linkedin"
            onPress={() => navigation.navigate('Home')}
            type="outline"
            gradientColors={['#F6F6F6', '#F6F6F6']}
            styleProps={{ backgroundColor: '#F6F6F6' }}
            icon={ICONS.linkedInIcon}
            iconPosition="left"
          />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <GradientText text={"Sign Up"} />
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
    fontFamily: fontFamly.PlusJakartaSansMedium
  },
  signUpText: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    // fontWeight: '600',
  },
});

export default LoginScreen;
