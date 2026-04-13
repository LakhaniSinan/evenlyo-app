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
import {register, registerUser, vendorRegister} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

const RegistrationOtp = ({route, navigation}) => {
  const data = route.params;
  console.log(data, 'datadatadatadatadatadata');

  const modalRef = useRef(null);
  const {t, currentLanguage} = useTranslation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    try {
      const vendorPersonalPayload = {
        accountType: data?.vendorType,
        firstName: data?.personalInfo?.firstName,
        lastName: data?.personalInfo?.lastName,
        email: data?.personalInfo?.email,
        contactNumber: data?.personalInfo?.contact,
        city: data?.personalInfo?.city,
        postalCode: data?.personalInfo?.postalCode,
        fullAddress: data?.personalInfo?.address,
        passportDetails: data?.personalInfo?.cnicPassport,
        mainCategories: data?.categories,
        subCategories: data?.subCategories,
        businessLogo: data?.media?.workImages,
        businessImage: data?.media?.banner,
        description: data?.personalInfo?.description,
        tagline: data?.personalInfo?.tagline,
        password: data?.security?.password,
        confirmPassword: data?.security?.confirmPassword,
        otp,
      };

      const vendorBusinessPayload = {
        accountType: data?.vendorType,
        businessName: data?.businessInfo?.companyName,
        teamType: data?.businessInfo?.workType,
        businessNumber: data?.businessInfo?.contact,
        businessWebsite: data?.businessInfo?.companyWebsite,
        teamSize: data?.businessInfo?.teamSize,
        businessEmail: data?.businessInfo?.companyEmail,
        businessLogo: data?.media?.workImages,
        businessImage: data?.media?.banner,
        mainCategories: data?.categories,
        subCategories: data?.subCategories,
        city: data?.businessInfo?.companyAddress,
        fullAddress: data?.businessInfo?.companyAddress,
        description: data?.businessInfo?.description,
        tagline: data?.businessInfo?.tagline,
        kvkNumber: data?.businessInfo?.kvknumber,
        passportDetails: data?.businessInfo?.passportNumber,
        postalCode: data?.businessInfo?.postalCode || '0000',
        password: data?.security?.password,
        confirmPassword: data?.security?.password,
        otp,
      };

      const vendorPayload =
        data?.vendorType == 'business'
          ? vendorBusinessPayload
          : vendorPersonalPayload;

      const params = {
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        address: data?.address,
        contactNumber: data?.contactNumber,
        password: data?.password,
        confirmPassword: data?.confirmPassword,
        type: data?.type,
        otp,
      };

      setIsLoading(true);

      const response =
        data?.type == 'client'
          ? await register(params)
          : await vendorRegister(vendorPayload);

      setIsLoading(false);

      if (response?.status === 200 || response?.status === 201) {
        navigation.navigate('AuthSuccess', {
          type: data?.type == 'vendor' ? 'register' : data?.type,
          message:
            currentLanguage == 'en'
              ? response.data?.message.en
              : response.data?.message.nl,
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message:
            currentLanguage == 'en'
              ? response.data?.message.en
              : response.data?.message.nl,
        });
      }
    } catch (error) {
      console.log('Registration error:', error);
      modalRef.current?.show({
        status: 'error',
        message:
          currentLanguage == 'en'
            ? 'Something went wrong, please try again.'
            : 'Iets is misgegaan, probeer het opnieuw.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const email =
        data?.type !== 'vendor'
          ? data?.personalInfo?.email
          : data?.businessInfo?.companyEmail;
      const response = await registerUser({email});
      setIsLoading(false);

      modalRef.current?.show({
        status:
          response?.status === 200 || response?.status === 201 ? 'ok' : 'error',
        message:
          currentLanguage == 'en'
            ? response.data?.message.en
            : response.data?.message.nl,
      });
    } catch (error) {
      console.log('Resend code error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Background>
      <ScrollView style={{flex: 1, width: width(90)}}>
        <View style={{flex: 1, paddingVertical: width(20)}}>
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
                  color: COLORS.white,
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

export default RegistrationOtp;
