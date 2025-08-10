import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { width } from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import { ICONS } from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import GradientText from '../../components/gradiantText';
import Header from '../../components/header';
import ContactNumberInput from '../../components/phoneInput';
import TextField from '../../components/textInput';
import { COLORS, fontFamly } from '../../constants';
import { useTranslation } from '../../hooks';
import { globalStyles } from '../../styles/globalStyle';

const ForgotPasswordScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' or 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate("ForgotPasswordOtpScreen")
    // if (activeTab === 'phone') {
    //   if (!phoneNumber) {
    //     // Show alert using snackbar component as per user preference
    //     return;
    //   }
    //   // Navigate to OTP verification for phone
    //   navigation.navigate('PhoneOTPVerification', {phoneNumber});
    // } else {
    //   if (!email) {
    //     // Show alert using snackbar component as per user preference
    //     return;
    //   }
    //   // Navigate to email verification
    //   navigation.navigate('EmailVerification', {email});
    // }
  };

  return (
    <Background>
      <ScrollView style={{ flex: 1, width: width(90) }}>
        <View style={{ flex: 1, paddingVertical: width(20) }}>
          <Header languageModal={false} />
          <View
            style={{
              width: width(90),
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(5),
              padding: width(4),
              marginTop: width(20),
              marginBottom: width(10),
              height: width(90),
            }}>
            <Text style={[globalStyles.title, { fontSize: 20, textAlign: 'center' }]}>
              {t('verification')}
            </Text>
            <View style={styles.tabContainer}>
              <LinearGradient
                colors={
                  activeTab == 'phone'
                    ? ['#FF295D', '#E31B95', '#C817AE']
                    : ['#fff', '#fff', '#fff']
                }
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => setActiveTab('phone')}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'phone' && styles.activeTabText,
                    ]}>
                    {t('phoneNumber')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={
                  activeTab == 'email'
                    ? ['#FF295D', '#E31B95', '#C817AE']
                    : ['#fff', '#fff', '#fff']
                }
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => setActiveTab('email')}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'email' && styles.activeTabText,
                    ]}>
                    {t('emailAddress')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
            <View style={{ gap: 10, marginTop: width(1) }}>
              {activeTab === 'phone' ? (
                <ContactNumberInput
                  labelText={t('phoneNumber')}
                  phoneNumber={phoneNumber}
                  onChange={setPhoneNumber}
                  labelColor={COLORS.text}
                />
              ) : (
                <TextField
                  label={t('emailAddress')}
                  placeholder={t('enterYourEmail')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  labelColor={COLORS.text}
                  bgColor={COLORS.white}
                  styleProps={{
                    paddingVertical: width(3),
                  }}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              <GradientButton
                text={<GradientText text={t('back')} />}
                onPress={() => navigation.navigate('Login')}
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
                styleProps={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    padding: width(1),
    marginVertical: width(3),
    backgroundColor: COLORS.white,
    gap: width(1),
  },
  tabGradient: {
    flex: 1,
    borderRadius: width(3),
  },
  tab: {
    paddingHorizontal: width(3),
    paddingVertical: width(3.5),
    borderRadius: width(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: width(12),
  },
  tabText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default ForgotPasswordScreen;
