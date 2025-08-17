import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, fontFamly } from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/languageSwitcher';
import AppHeader from '../../../components/appHeader';
import { ICONS, IMAGES } from '../../../assets';
import { width } from 'react-native-dimension';

let data = [
  {
    name: 'Personal Info',
    navigation: "personalInfo",
    icon: ICONS.userIcon
  },
  {
    name: 'Security Details',
    navigation: "personalInfo",
    icon: ICONS.security
  },
  {
    name: 'Payment Method',
    navigation: "personalInfo",
    icon: ICONS.wallet
  },
  {
    name: 'Settings',
    navigation: "personalInfo",
    icon: ICONS.settings
  }
]

let data2 = [
  {
    name: 'Help & Support',
    navigation: "personalInfo",
    icon: ICONS.helpSupport
  },
  {
    name: 'Log Out',
    navigation: "personalInfo",
    icon: ICONS.logout
  },
]
const Profile = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
      >
        <AppHeader
          headingText={"Profile"}
        />
        <View style={{ marginTop: width(4), alignItems: "center", }}>
          <Image
            style={{ height: 100, width: 100, borderRadius: 200 }}
            source={IMAGES.backgroundImage} />
          <Text style={{ marginTop: 5, fontSize: 15, fontFamily: fontFamly.PlusJakartaSansSemiBold }}>Esther Howard</Text>
          <Text style={{ marginTop: 5, color: "#BABABA", fontSize: 12, fontFamily: fontFamly.PlusJakartaSansSemiMedium }}>@estherhoward</Text>
        </View>

        <View style={{ marginTop: width(4), marginHorizontal: width(3) }}
        >
          <Text style={{
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black
          }}>General</Text>
          {data.map(item => {
            return (
              <TouchableOpacity style={{
                borderRadius: 10,
                marginTop: width(4),
                paddingHorizontal: 10,
                backgroundColor: COLORS.backgroundLight,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Image
                  resizeMode='contain'
                  style={{ width: 16, height: 20 }} source={item.icon} />
                <Text style={{
                  fontSize: 13,
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  marginLeft: 15
                }}>{item.name}</Text>
                <View style={{
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flex: 1
                }}>
                  <Image
                    style={{
                      width: width(3),
                      height: width(3)
                    }}
                    resizeMode='contain'
                    source={ICONS.arrowRight} />
                </View>

              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ marginTop: width(4), marginHorizontal: width(3) }}
        >
          <Text style={{
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black
          }}>General</Text>
          {data2.map(item => {
            return (
              <TouchableOpacity style={{
                borderRadius: 10,
                marginTop: width(4),
                paddingHorizontal: 10,
                backgroundColor: COLORS.backgroundLight,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Image
                  resizeMode='contain'
                  style={{ width: 16, height: 20 }} source={item.icon} />
                <Text style={{
                  fontSize: 13,
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  marginLeft: 15
                }}>{item.name}</Text>
                <View style={{
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flex: 1
                }}>
                  <Image
                    style={{
                      width: width(3),
                      height: width(3)
                    }}
                    resizeMode='contain'
                    source={ICONS.arrowRight} />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
