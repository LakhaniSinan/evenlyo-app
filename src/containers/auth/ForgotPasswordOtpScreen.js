import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import Background from '../../components/background';
import Header from '../../components/header';
import {COLORS, fontFamly} from '../../constants';
import {width} from 'react-native-dimension';
import {useTranslation} from '../../hooks';
import {globalStyles} from '../../styles/globalStyle';
import OTPInputScreen from '../../components/otpScreen';
import GradientButton from '../../components/button';

const ForgotPasswordOtpScreen = ({navigation}) => {
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
                onPress={() => navigation.navigate('ResetPasswordScreen')}
                text={t('confirmOTP')}
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

export default ForgotPasswordOtpScreen;
