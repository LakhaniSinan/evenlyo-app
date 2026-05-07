import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import ChangeLanguageModal from '../../../components/modals/ChangeLanguageModal';
import NotificationPopup from '../../../components/modals/NotificationDetails';
import SaleDeliveryFee from '../../../components/modals/SaleDeliveryFee';
import {COLORS, fontFamly} from '../../../constants';
import {
  getNotificationsSetup,
  udpateNotificationsSetup,
  updateDeliveryFee,
} from '../../../services/Settings';
import {getVendorProfile} from '../../../services/Vendor';

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
  // {
  //   name: t('Sale Delivery Fee Details') || 'Sale Delivery Fee Details',
  //   navigate: 'saleDelivery',
  //   icon: ICONS.globeIcon,
  // },
];

const Settings = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const data = getSettingsData(t);
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [notificationDraft, setNotificationDraft] = useState({
    email: false,
    push: false,
  });

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

  useEffect(() => {
    if (showDeliveryModal) {
      getVendorDetails();
    }
  }, [showDeliveryModal]);

  const getVendorDetails = async () => {
    try {
      const response = await getVendorProfile();
      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data;
        setDeliveryFee(
          data?.deliveryCharges !== null && data?.deliveryCharges !== undefined
            ? String(data.deliveryCharges)
            : '',
        );
      }
    } catch (error) {
      console.log('vendor detail error');
    }
  };

  const handleUpdateDeliveryFee = async amount => {
    try {
      setIsLoading(true);
      const numericAmount = amount ? Number(amount) : 0;

      const response = await updateDeliveryFee({
        deliveryCharges: numericAmount,
      });

      if (response?.status === 200 || response?.status === 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message,
          handlePressOk: () => {
            modalRef.current.hide();
            setShowDeliveryModal(false);
          },
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('delivery fee update error');
    } finally {
      setIsLoading(false);
    }
  };

  const openNotificationPopup = () => {
    setNotificationDraft({
      email: emailNotification,
      push: pushNotification,
    });
    setShowNotificationPopup(true);
  };

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

  const handleItemPress = item => {
    if (item.navigate === 'Language') {
      setShowLanguageModal(true);
    } else if (item.navigate === 'Notifications') {
      openNotificationPopup();
    } else if (item.navigate === 'saleDelivery') {
      setShowDeliveryModal(true);
    } else {
      navigation.navigate(item.navigate);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <CommonAlert ref={modalRef} />

      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Settings')}
        onLeftIconPress={() => navigation.goBack()}
      />

      {data.map((item, index) => (
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
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Image
              style={{width: width(3), height: width(3)}}
              resizeMode="contain"
              source={ICONS.arrowRight}
            />
          </View>
        </TouchableOpacity>
      ))}

      <ChangeLanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(!showLanguageModal)}
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

      <SaleDeliveryFee
        isLoading={isLoading}
        onUpdate={handleUpdateDeliveryFee}
        isVisible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        deliveryFee={deliveryFee}
        setDeliveryFee={setDeliveryFee}
      />
    </SafeAreaView>
  );
};

export default Settings;
