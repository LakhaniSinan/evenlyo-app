// FilterModal.js
import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const NotificationPopup = ({isVisible, onClose}) => {
  const {t} = useTranslation();
  const [emailNotification, setEmailNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Notification Settings')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginBottom: width(5),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            paddingBottom: width(5),
          }}>
          <View style={{}}>
            <Text style={styles.subTitle}>{t('Email Notification')}</Text>
            <Text style={styles.subTitleDescription}>
              {t('Get notified when orders are completed')}
            </Text>
          </View>
          <Switch
            value={emailNotification}
            onValueChange={setEmailNotification}
            trackColor={{
              false: '#E5E5E5',
              true: COLORS.primary,
            }}
            thumbColor={emailNotification ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E5E5"
            style={styles.switch}
          />
        </View>
        <View
          style={{
            marginBottom: width(5),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            paddingBottom: width(5),
          }}>
          <View style={{}}>
            <Text style={styles.subTitle}>{t('Push notification')}</Text>
            <Text style={styles.subTitleDescription}>
              {t('Notifications for new user registrations')}
            </Text>
          </View>
          <Switch
            value={pushNotification}
            onValueChange={setPushNotification}
            trackColor={{
              false: '#E5E5E5',
              true: COLORS.primary,
            }}
            thumbColor={pushNotification ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E5E5"
            style={styles.switch}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
  },
  container: {
    height: '55%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: width(5),
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitleDescription: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textGray,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
  },
});

export default NotificationPopup;
