import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';

const getProfileMenuData = t => [
  {
    name: t('Personal Info'),
    navigate: 'personalInfo',
    icon: ICONS.userIcon,
  },
  {
    name: t('Security Details'),
    navigate: 'ResetPassword',
    icon: ICONS.security,
  },
  // {
  //   name: t('Payment Method'),
  //   navigate: 'personalInfo',
  //   icon: ICONS.wallet,
  // },
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

const Profile = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const data = getProfileMenuData(t);
  const data2 = getHelpSupportMenuData(t);

  return (
    <ScrollView style={styles.container}>
      <AppHeader headingText={t('Profile')} />
      <View style={{alignItems: 'center', marginTop: width(4)}}>
        <Image
          style={{
            height: 100,
            width: 100,
            borderRadius: 200,
          }}
          source={IMAGES.backgroundImage}
        />
        <Text
          style={{
            marginTop: 5,
            fontSize: 15,
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
          }}>
          Esther Howard
        </Text>
        <Text
          style={{
            marginTop: 5,
            color: '#BABABA',
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansSemiMedium,
          }}>
          @estherhoward
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
              onPress={() => navigation.navigate(item.navigate)}
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
              onPress={() => navigation.navigate(item.navigate)}
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

export default Profile;
