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

  console.log(data, 'datadatadatadatadatadata123123123');

  const [otp, setOtp] = useState(0);
  const modalRef = useRef(null);
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  console.log(data, 'data data data data data');

  const handleVerifyOtp = async () => {
    try {
      const payload = {...data, otp: otp};

      const vendorPayload = {
        accountType: data?.vendorType,
        firstName: data?.personalInfo?.firstName,
        lastName: data?.personalInfo?.lastName,
        email: data?.personalInfo?.email,
        contactNumber: data?.personalInfo?.contact,
        city: data?.personalInfo?.city,
        postalCode: data?.personalInfo?.postalCode,
        fullAddress: data?.personalInfo?.address,
        passportDetails: data?.personalInfo?.cnicPassport,
        mainCategories: data.categories,
        subCategories: data?.subCategories,
        businessLogo: data?.media?.workImages[0],
        bannerImage: data?.media?.banner,
        password: data?.security?.password,
        confirmPassword: data?.security?.confirmPassword,
        otp: otp,
      };
      setIsLoading(true);

      const response =
        data?.type == 'vendor'
          ? await vendorRegister(vendorPayload)
          : await register(payload);
      setIsLoading(false);

      console.log(response, 'responseresponseresponse');

      if (response?.status == 200 || response?.status == 201) {
        navigation.navigate('AuthSuccess', {
          type: 'register',
          message: response?.data?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerror3452343 ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const response = await registerUser({
        email: data?.type == 'vendor' ? data?.personalInfo?.email : data.email,
      });

      setIsLoading(false);
      if (response?.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response.data?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
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

export default RegistrationOtp;
