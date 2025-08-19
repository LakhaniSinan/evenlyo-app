import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import OtpModal from '../../../components/modals/OtpModal';
import TextField from '../../../components/textInput';
import {COLORS, SIZES} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';

const ResetPassword = ({navigation}) => {
  const {t} = useTranslation();
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={() => navigation.goBack()}
        headingText={t('resetPasswordTitle')}
      />

      <View style={styles.form}>
        <TextField
          label={t('Old Password')}
          placeholder={t('***********')}
          // value={currentPassword}
          // onChangeText={setCurrentPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <View style={{height: 10}} />
        <TextField
          label={t('New Password')}
          placeholder={t('***********')}
          // value={newPassword}
          // onChangeText={setNewPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <View style={{height: 10}} />
        <TextField
          label={t('Re-Enter Password')}
          placeholder={t('***********')}
          // value={confirmPassword}
          // onChangeText={setConfirmPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />
        <View style={{height: 10}} />
      </View>
      <View
        style={{
          marginHorizontal: 10,
          flex: 1,
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}>
        <GradientButton
          text={t('resetPasswordButton')}
          onPress={() => setIsOtpModalVisible(true)}
        />
      </View>
      <OtpModal
        visible={isOtpModalVisible}
        onClose={() => setIsOtpModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
    marginTop: 20,
    marginHorizontal: 10,
  },
});

export default ResetPassword;
