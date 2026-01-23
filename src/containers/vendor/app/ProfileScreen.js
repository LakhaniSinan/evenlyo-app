import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import useProfile from '../../../hooks/getProfileData';
import useTranslation from '../../../hooks/useTranslation';
import {setUserData} from '../../../redux/slice/auth';
import {getVendorDetails, getVendorProfile} from '../../../services/Vendor';

const getProfileMenuData = t => [
  {
    name: t('Profile Management'),
    navigate: 'ProfileManagement',
    icon: ICONS.userIcon,
  },
  {
    name: t('Security Details'),
    navigate: 'ResetPassword',
    icon: ICONS.security,
  },
  {
    name: t('Billing Management'),
    navigate: 'BillingManagement',
    icon: ICONS.wallet,
  },
  {
    name: t('Settings'),
    navigate: 'Settings',
    icon: ICONS.settings,
  },
];

const getHelpSupportMenuData = t => [
  {
    name: t('Help & Support'),
    navigate: 'HelpAndSupport',
    icon: ICONS.helpSupport,
  },
  {
    name: t('Logout'),
    navigate: 'Logout',
    icon: ICONS.logout,
  },
];

const ProfileScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  const {fetchProfile, profileData} = useProfile();
  const [vendorDetails, setVendorDetails] = useState(null);
  console.log(vendorDetails, 'asdalskdnaskdnalsdknalsdkl');

  const [isLoading, setIsLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      getVendorDetailsByID();
    }, []),
  );

  const data = getProfileMenuData(t);
  const data2 = getHelpSupportMenuData(t);

  const handleNavigate = navigate => {
    if (navigate === 'Logout') {
      dispatch(setUserData(null));
      AsyncStorage.removeItem('userData');
      AsyncStorage.removeItem('token');
    } else {
      navigation.navigate(navigate);
    }
  };

  const getVendorDetailsByID = async () => {
    try {
      setIsLoading(true);
      const responce = await getVendorProfile();

      setIsLoading(false);
      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data;
        setVendorDetails(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('errorerrorerrorerrorerrorerror');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView style={styles.container}>
        <AppHeader headingText={t('Profile')} />
        <View style={{alignItems: 'center', marginTop: width(4)}}>
          <Image
            style={{
              height: 100,
              width: 100,
              borderRadius: 200,
            }}
            source={{uri: vendorDetails?.businessLogo}}
          />
          <Text
            style={{
              color: COLORS.black,
              marginTop: 5,
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            <Text>
              {user?.firstName
                ? user.firstName.replace(/\b\w/g, char => char.toUpperCase())
                : ''}
            </Text>
          </Text>
          <Text
            style={{
              marginTop: 5,
              color: COLORS.textLight,
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiMedium,
            }}>
            {user?.email}
          </Text>
        </View>

        <View style={{marginTop: width(4), marginHorizontal: width(3)}}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
            }}>
            {t('General')}
          </Text>
          {data.map(item => {
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(item.navigate, vendorDetails)
                }
                style={{
                  borderRadius: 10,
                  marginTop: width(4),
                  paddingHorizontal: 10,
                  backgroundColor: COLORS.backgroundLight,
                  paddingVertical: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
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
        </View>

        <View
          style={{
            marginTop: width(4),
            marginHorizontal: width(3),
            marginBottom: 10,
          }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
            }}>
            {t('Help & Support')}
          </Text>
          {data2.map(item => {
            return (
              <TouchableOpacity
                onPress={() => handleNavigate(item.navigate)}
                style={{
                  borderRadius: 10,
                  marginTop: width(4),
                  paddingHorizontal: 10,
                  backgroundColor: COLORS.backgroundLight,
                  paddingVertical: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
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
        </View>
      </ScrollView>
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  languageSwitcherContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default ProfileScreen;
