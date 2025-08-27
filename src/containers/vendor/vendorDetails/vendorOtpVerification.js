import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import Background from '../../../components/background';
import GradientButton from '../../../components/button';
import Header from '../../../components/header';
import OTPInputScreen from '../../../components/otpScreen';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {globalStyles} from '../../../styles/globalStyle';

const VendorOtpVerifications = ({navigation}) => {
  const {t} = useTranslation();
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
            <OTPInputScreen />
            <View style={{marginTop: width(4)}}>
              <GradientButton
                onPress={() => navigation.navigate('OtpVerifySuccess')}
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
    </Background>
  );
};

export default VendorOtpVerifications;
