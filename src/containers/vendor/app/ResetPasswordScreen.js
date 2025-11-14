import React, {useRef, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import OtpModal from '../../../components/modals/OtpModal';
import TextField from '../../../components/textInput';
import {COLORS, SIZES} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import {handleChangePassword} from '../../../services/Settings';

const ResetPassword = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef();

  // 🟢 State for passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 State for showing/hiding passwords
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);

  // 🟢 Handle Reset Password Press
  const handleResetPassword = async () => {
    if (!currentPassword.trim()) {
      return modalRef.current.show({
        status: 'error',
        message: t('Please enter your current password.'),
      });
    }
    if (!newPassword.trim()) {
      return modalRef.current.show({
        status: 'error',
        message: t('Please enter your new password.'),
      });
    }
    if (newPassword.length < 6) {
      return modalRef.current.show({
        status: 'error',
        message: t('New password must be at least 6 characters long.'),
      });
    }
    if (confirmPassword !== newPassword) {
      return modalRef.current.show({
        status: 'error',
        message: t('Passwords do not match.'),
      });
    }
    try {
      setIsLoading(true);
      let params = {
        oldPassword: currentPassword,
        newPassword: newPassword,
      };
      const response = await handleChangePassword(params);
      if (response.status == 200 || response.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message,
          handlePressOk: () => {
            modalRef.current.hide();
            setIsOtpModalVisible(true);
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerror98y89');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonAlert ref={modalRef} />
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={() => navigation.goBack()}
        headingText={t('resetPasswordTitle')}
      />

      <View style={styles.form}>
        <TextField
          label={t('Old Password')}
          placeholder={t('***********')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrent}
          autoCapitalize="none"
          endIcon={showCurrent ? ICONS.eyeIcon : ICONS.eyeIcon}
          onEndIconPress={() => setShowCurrent(!showCurrent)}
        />

        <View style={{height: 10}} />

        <TextField
          label={t('New Password')}
          placeholder={t('***********')}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNew}
          autoCapitalize="none"
          endIcon={showNew ? ICONS.eyeIcon : ICONS.eyeIcon}
          onEndIconPress={() => setShowNew(!showNew)}
        />

        <View style={{height: 10}} />

        <TextField
          label={t('Re-Enter Password')}
          placeholder={t('***********')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          endIcon={showConfirm ? ICONS.eyeIcon : ICONS.eyeIcon}
          onEndIconPress={() => setShowConfirm(!showConfirm)}
        />
      </View>

      <View style={styles.bottom}>
        <GradientButton
          text={t('resetPasswordButton')}
          onPress={handleResetPassword}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  form: {
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: SIZES.lg,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    marginBottom: 10,
  },
});

export default ResetPassword;
