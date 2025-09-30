import React, {useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import CommonAlert from '../../components/commanAlert';
import Header from '../../components/header';
import Loader from '../../components/loder';
import TextField from '../../components/textInput';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {resetPassword} from '../../services/Auth';
import {globalStyles} from '../../styles/globalStyle';

const ResetPasswordScreen = ({route, navigation}) => {
  const {type} = route.params;
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        const response = await resetPassword({password: password});
        setIsLoading(false);
        if (response?.status == 200 || response?.status == 201) {
          navigation.navigate('AuthSuccess', {
            type: type,
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
        console.log(error, 'errorerrorerrorerror575796563');
      }
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
            }}>
            <Text
              style={[globalStyles.title, {fontSize: 20, textAlign: 'center'}]}>
              {t('resetPass')}
            </Text>

            <View style={{marginTop: 10}}>
              <TextField
                label={t('enterPasswrod')}
                placeholder={t('passwordPlaceholder')}
                keyboardType="default"
                autoCapitalize="none"
                bgColor={COLORS.white}
                value={password}
                onChangeText={setPassword}
              />

              <TextField
                label={t('reEnterPassword')}
                placeholder={t('passwordPlaceholder')}
                keyboardType="default"
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                bgColor={COLORS.white}
              />
            </View>

            <View style={{marginTop: width(4)}}>
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

export default ResetPasswordScreen;
