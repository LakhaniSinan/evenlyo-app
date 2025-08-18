import {useTranslation} from 'react-i18next';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import ChangeLanguageModal from '../../../components/modals/ChangeLanguageModal';
import NotificationPopup from '../../../components/modals/NotificationDetails';
import {COLORS, fontFamly} from '../../../constants';
import {useState} from 'react';

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
  {
    name: t('Help & Support') || 'Help & Support',
    navigate: 'HelpAndSupport',
    icon: ICONS.helpSupport,
  },
];

const Settings = ({navigation}) => {
  const {t} = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const data = getSettingsData(t);

  const handleItemPress = item => {
    if (item.navigate === 'Language') {
      setShowLanguageModal(true);
    } else {
      if (item.navigate === 'Notifications') {
        setShowNotificationPopup(true);
      } else {
        navigation.navigate(item.navigate);
      }
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
        isVisible={showNotificationPopup}
        onClose={() => setShowNotificationPopup(false)}
      />
    </SafeAreaView>
  );
};

export default Settings;
