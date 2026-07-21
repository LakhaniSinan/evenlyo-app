import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import ChangeLanguageModal from '../../../components/modals/ChangeLanguageModal';
import NotificationPopup from '../../../components/modals/NotificationDetails';
import {COLORS, fontFamly} from '../../../constants';
import {
  getNotificationsSetup,
  udpateNotificationsSetup,
} from '../../../services/Settings';

const getSettingsData = t => [
  {
    name: t('Notification Details') || 'Notification Details',
    navigate: 'Notifications',
    icon: ICONS.bellIcon,
  },
  {
    name: t('changeLanguage') || 'Change Language',
    navigate: 'Language',
    icon: ICONS.globeIcon,
  },
];

const Settings = ({navigation}) => {
  const {t} = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationDraft, setNotificationDraft] = useState({
    email: false,
    push: false,
  });
  const data = getSettingsData(t);

  const handleGetNotificaitonsStatus = async () => {
    try {
      const response = await getNotificationsSetup();

      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.data;

        const email = !!data?.emailNotifications;
        const push = !!data?.pushNotifications;

        setEmailNotification(email);
        setPushNotification(push);

        setNotificationDraft({
          email,
          push,
        });
      }
    } catch (error) {
      console.log('get notification status failed');
    }
  };

  useEffect(() => {
    handleGetNotificaitonsStatus();
  }, []);

  const syncNotificationSettings = async () => {
    try {
      const params = {
        emailNotifications: notificationDraft.email,
        pushNotifications: notificationDraft.push,
      };

      await udpateNotificationsSetup(params);

      setEmailNotification(notificationDraft.email);
      setPushNotification(notificationDraft.push);
    } catch (error) {
      console.log('notification sync failed');
    }
  };

  const openNotificationPopup = () => {
    setNotificationDraft({
      email: emailNotification,
      push: pushNotification,
    });
    setShowNotificationPopup(true);
  };

  const handleItemPress = item => {
    if (item.navigate === 'Language') {
      setShowLanguageModal(true);
    } else if (item.navigate === 'Notifications') {
      openNotificationPopup();
    } else {
      navigation.navigate(item.navigate);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Settings')}
        onLeftIconPress={() => navigation.goBack()}
      />
      {data.map((item, index) => {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleItemPress(item)}
            style={{
              borderRadius: 10,
              marginTop: width(4),
              paddingHorizontal: 10,
              backgroundColor: COLORS.backgroundLight,
              paddingVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: width(2),
            }}>
            <Image
              resizeMode="contain"
              style={{width: 16, height: 20}}
              source={item.icon}
            />
            <Text
              style={{
                color: COLORS.black,
                fontSize: 13,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
                marginLeft: 15,
              }}>
              {item.name}
            </Text>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                flex: 1,
              }}>
              <Image
                style={{
                  width: width(3),
                  height: width(3),
                }}
                resizeMode="contain"
                source={ICONS.arrowRight}
              />
            </View>
          </TouchableOpacity>
        );
      })}
      <ChangeLanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
      <NotificationPopup
        emailNotification={notificationDraft.email}
        pushNotification={notificationDraft.push}
        onChange={(type, val) =>
          setNotificationDraft(prev => ({...prev, [type]: val}))
        }
        isVisible={showNotificationPopup}
        onClose={() => {
          setShowNotificationPopup(false);
          syncNotificationSettings();
        }}
      />
    </SafeAreaView>
  );
};

export default Settings;
