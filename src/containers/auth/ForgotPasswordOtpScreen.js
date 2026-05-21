import React, {useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import CommonAlert from '../../components/commanAlert';
import Header from '../../components/header';
import Loader from '../../components/loder';
import OTPInputScreen from '../../components/otpScreen';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {forgotUser, verifyForgotOtp} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

const ForgotPasswordOtpScreen = ({route, navigation}) => {
  const data = route.params;
  const [otp, setOtp] = useState(0);
  const modalRef = useRef(null);
  const {t, currentLanguage} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    try {
      const payload = {...data, otp: otp};
      setIsLoading(true);
      const response = await verifyForgotOtp(payload);
      console.log(response, 'responseresponseresponseresponse');

      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message?.en
            ? currentLanguage == 'en'
              ? response?.data?.message?.en
              : response?.data?.message?.nl
            : response?.data?.message,
          handlePressOk: () => {
            modalRef.current.hide();
            navigation.navigate('ResetPasswordScreen', {
              userType: data?.userType,
              email: data?.email,
              resetToken: response?.data?.resetToken,
            });
          },
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
      console.log(error, 'errorerrorerrorerror3452343');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const response = await forgotUser({email: data.email});
      console.log(response, 'responseresponseresponseresponseresponse');

      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
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
      console.log(error, 'errorerrorerrorerrorerror123123234');
    } finally {
      setIsLoading(false);
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
              minHeight: width(90),
            }}>
            <Text
              style={[globalStyles.title, {fontSize: 20, textAlign: 'center'}]}>
              {t('enterCode')}
            </Text>
            <OTPInputScreen onResendPress={handleResendCode} setOtp={setOtp} />
            <View style={{marginTop: width(4)}}>
              <GradientButton
                onPress={handleVerifyOtp}
                text={t('Verify OTP')}
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
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </Background>
  );
};

const styles = {
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
};

export default ForgotPasswordOtpScreen;

// navigation.navigate('AuthSuccess', {
//           type: 'forgot',
//           message: response?.data?.message,
//         });
