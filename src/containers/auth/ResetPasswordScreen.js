import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { width } from 'react-native-dimension';
import { ICONS } from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import CommonAlert from '../../components/commanAlert';
import Header from '../../components/header';
import Loader from '../../components/loder';
import TextField from '../../components/textInput';
import { COLORS, fontFamly } from '../../constants';
import { useTranslation } from '../../hooks';
import { resetPassword } from '../../services/Auth';
import { globalStyles } from '../../styles/globalStyle';

const ResetPasswordScreen = ({ route, navigation }) => {
  console.log(route.params,'route.paramsroute.paramsroute.params');
  
  const { userType, resetToken, email } = route.params;
  const { t, currentLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const handleContinue = async () => {
    if (password == '' || confirmPassword == '') {
      modalRef.current.show({
        status: 'error',
        message: 'Password and confirm password fields are required.',
      });
    } else if (password !== confirmPassword) {
      modalRef.current.show({
        status: 'error',
        message: 'Password and confirm password do not match.',
      });
    } else if (password.length < 8) {
      modalRef.current.show({
        status: 'error',
        message: 'Password must be at least 8 characters long.',
      });
    } else {
      try {
        setIsLoading(true);
        let params = {
          password: password,
          resetToken: resetToken,
          email: email,
        };
        const response = await resetPassword(params);
        setIsLoading(false);
        if (response?.status == 200 || response?.status == 201) {
          navigation.navigate('AuthSuccess', {
            userType,
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
        } else {
          modalRef.current.show({
            status: 'error',
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error, 'errorerrorerrorerror575796563');
      }
    }
  };

  return (
    <Background>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Header languageModal={false} />

          <View
            style={{
              width: '100%',
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(5),
              padding: width(4),
              marginTop: width(12),
              marginBottom: width(10),
            }}>
            <Text
              style={[globalStyles.title, { fontSize: 20, textAlign: 'center' }]}>
              {t('resetPass')}
            </Text>

            <View style={{ marginTop: 10 }}>
              <TextField
                label={t('enterPasswrod')}
                placeholder={t('passwordPlaceholder')}
                keyboardType="default"
                autoCapitalize="none"
                bgColor={COLORS.white}
                value={password}
                onChangeText={setPassword}
                secure={hidePassword}
                passwordToggle
                onEndIconPress={() => setHidePassword(!hidePassword)}
              />

              <View style={{ height: 10 }} />
              <TextField
                label={t('reEnterPassword')}
                placeholder={t('passwordPlaceholder')}
                keyboardType="default"
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                bgColor={COLORS.white}
                secure={hideConfirmPassword}
                passwordToggle
                onEndIconPress={() =>
                  setHideConfirmPassword(!hideConfirmPassword)
                }
              />
            </View>

            <View style={{ marginTop: width(4) }}>
              <GradientButton
                text={t('continue')}
                onPress={handleContinue}
                textStyle={{
                  fontSize: 12,
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: 'white',
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
    </Background>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: width(8),
    paddingBottom: width(10),
  },
  column: {
    width: width(90),
    alignSelf: 'center',
  },
});

export default ResetPasswordScreen;
