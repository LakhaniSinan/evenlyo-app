import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import LoginModal from '../../../components/authModal';
import ForgotModal from '../../../components/authModal/ForgotModal';
import RegistrationModal from '../../../components/authModal/RegistrationModal';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import {setUserData} from '../../../redux/slice/auth';
import useProfile from '../../../hooks/getProfileData';
import {setVendorUnreadCount} from '../../../redux/slice/vendorNotificationsCount';
import { setUnreadCount } from '../../../redux/slice/notifications';

const AUTH_MODAL_SWITCH_MS = 480;

const UserLoginPlaceholder = ({onLoginPress}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.placeholderContainer}>
      <Image
        source={IMAGES.avatarIcon}
        style={{width: width(40), height: width(40), marginBottom: 20}}
        resizeMode="contain"
      />
      <Text style={styles.placeholderTitle}>{t('You are not logged in')}</Text>
      <Text style={styles.placeholderSubtitle}>
        {t('Please login to access your profile details')}
      </Text>
      <View style={{marginTop: 30, width: width(75)}}>
        <GradientButton
          text={t('Login Now')}
          onPress={onLoginPress}
          textStyle={styles.loginButtonText}
          styleProps={styles.loginButtonInner}
        />
      </View>
    </View>
  );
};

const AuthModals = ({
  showLogin,
  showForgot,
  showRegister,
  setShowLogin,
  setShowForgot,
  setShowRegister,
  handlePressFun,
}) => (
  <>
    <LoginModal
      isVisible={showLogin}
      onClose={() => setShowLogin(false)}
      handlePressFun={handlePressFun}
    />
    <ForgotModal
      isVisible={showForgot}
      onClose={() => setShowForgot(false)}
      handlePressFun={handlePressFun}
    />
    <RegistrationModal
      isVisible={showRegister}
      onClose={() => setShowRegister(false)}
      handlePressFun={handlePressFun}
    />
  </>
);

const Profile = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const modalRef = useRef(null);
  const {profileData, fetchProfile} = useProfile();
  const {user} = useSelector(state => state.LoginSlice);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const generalOptions = [
    {name: t('Personal Info'), navigate: 'personalInfo', icon: ICONS.userIcon},
    {
      name: t('Security Details'),
      navigate: 'ResetPassword',
      icon: ICONS.security,
    },
    {name: t('Settings'), navigate: 'Settings', icon: ICONS.settings},
    {
      name: t('Chat List'),
      navigate: 'MessagesScreen',
      icon: ICONS.chatIcon,
    },
  ];

  const supportOptions = [
    {
      name: t('Help & Support'),
      navigate: 'HelpAndSupport',
      icon: ICONS.helpSupport,
    },
    {name: t('Logout'), navigate: 'Logout', icon: ICONS.logout},
  ];

  const getParsedToken = async () => {
    const rawToken = await AsyncStorage.getItem('token');
    if (!rawToken) {
      return null;
    }

    try {
      const parsedToken = JSON.parse(rawToken);
      return parsedToken || null;
    } catch (error) {
      return rawToken;
    }
  };

  const checkUserLoggedIn = useCallback(
    async ({showBlockingLoader = true} = {}) => {
      try {
        if (showBlockingLoader) {
          setCheckingAuth(true);
        }
        const token = await getParsedToken();
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log('Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        if (showBlockingLoader) {
          setCheckingAuth(false);
        }
      }
    },
    [],
  );

  const profileFirstFocusRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      const showBlockingLoader = profileFirstFocusRef.current;
      profileFirstFocusRef.current = false;
      void checkUserLoggedIn({showBlockingLoader});

      return undefined;
    }, [checkUserLoggedIn]),
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setCheckingAuth(false);
    }
  }, [user]);

  const closeAllAuthModals = useCallback(() => {
    setShowLogin(false);
    setShowForgot(false);
    setShowRegister(false);
  }, []);

  const handlePressFun = useCallback(
    type => {
      closeAllAuthModals();

      const needsStaggeredOpen =
        type === 'forgot' ||
        type === 'register' ||
        type === 'reset' ||
        type === 'goBackToLogin' ||
        type === 'registeredOTP';

      const openTargetModal = () => {
        if (type === 'forgot') {
          setShowForgot(true);
        } else if (type === 'register') {
          setShowRegister(true);
        } else if (
          type === 'reset' ||
          type === 'goBackToLogin' ||
          type === 'registeredOTP'
        ) {
          setShowLogin(true);
        } else if (type == null || type === '') {
          setIsLoggedIn(true);
        }
      };

      if (needsStaggeredOpen) {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(openTargetModal, AUTH_MODAL_SWITCH_MS);
        });
      } else {
        openTargetModal();
      }

      setTimeout(() => {
        void checkUserLoggedIn({showBlockingLoader: false});
      }, 300);
    },
    [checkUserLoggedIn, closeAllAuthModals],
  );

  const handleOpenLoginModal = useCallback(() => {
    setShowLogin(true);
  }, []);

  const handleNavigate = async navigate => {
    if (navigate === 'Logout') {
      dispatch(setVendorUnreadCount(0));
      dispatch(setUnreadCount(0));
      dispatch(setUserData(null));
      await AsyncStorage.multiRemove(['userData', 'token']);
      setIsLoggedIn(false);
    } else {
      navigation.navigate(navigate);
    }
  };

  const RenderProfileContent = () => (
    <ScrollView>
      <View style={{alignItems: 'center', marginTop: width(4)}}>
        <Image
          style={{height: 100, width: 100, borderRadius: 200}}
          source={
            profileData?.profileImage
              ? {uri: profileData.profileImage}
              : IMAGES.avatarIcon
          }
        />
        <Text style={styles.userName}>
          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'N/A'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
      </View>

      <View style={{marginTop: width(4), marginHorizontal: width(3)}}>
        <Text style={styles.sectionTitle}>{t('General')}</Text>
        {generalOptions.map(item => (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.navigate)}
            style={styles.optionContainer}>
            <Image
              style={styles.optionIcon}
              source={item.icon}
              resizeMode="contain"
            />
            <Text style={styles.optionText}>{item.name}</Text>
            <Image
              style={styles.arrowIcon}
              source={ICONS.arrowRight}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          marginTop: width(4),
          marginHorizontal: width(3),
          marginBottom: 10,
        }}>
        <Text style={styles.sectionTitle}>{t('Help & Support')}</Text>
        {supportOptions.map(item => (
          <TouchableOpacity
            key={item.name}
            onPress={() => handleNavigate(item.navigate)}
            style={styles.optionContainer}>
            <Image
              style={styles.optionIcon}
              source={item.icon}
              resizeMode="contain"
            />
            <Text style={styles.optionText}>{item.name}</Text>
            <Image
              style={styles.arrowIcon}
              source={ICONS.arrowRight}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        headingText={t('Profile')}
        notificationsIcon={true}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {checkingAuth ? (
        <Loader isLoading />
      ) : isLoggedIn ? (
        <RenderProfileContent />
      ) : (
        <UserLoginPlaceholder onLoginPress={handleOpenLoginModal} />
      )}

      <AuthModals
        showLogin={showLogin}
        showForgot={showForgot}
        showRegister={showRegister}
        setShowLogin={setShowLogin}
        setShowForgot={setShowForgot}
        setShowRegister={setShowRegister}
        handlePressFun={handlePressFun}
      />

      <CommonAlert ref={modalRef} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},

  placeholderContainer: {
    flex: 1,
    height: height(80),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width(5),
  },
  placeholderTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  placeholderSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  loginButtonInner: {
    paddingHorizontal: 10,
    paddingVertical: width(2.6),
  },

  loginButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
    textAlign: 'center',
    includeFontPadding: false,
  },

  userName: {
    color: COLORS.black,
    marginTop: 5,
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  userEmail: {
    marginTop: 5,
    color: '#BABABA',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
  },

  optionContainer: {
    borderRadius: 10,
    marginTop: width(4),
    paddingHorizontal: 10,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {width: 16, height: 20},
  optionText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginLeft: 15,
    color: COLORS.black,
    flex: 1,
  },
  arrowIcon: {width: width(3), height: width(3)},

  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
});
