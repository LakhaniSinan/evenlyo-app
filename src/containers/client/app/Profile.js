import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/languageSwitcher';

const Profile = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile')}</Text>
        <Text style={styles.subtitle}>Profile screen content will go here</Text>
        
        {/* Language Switcher in Profile */}
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher />
        </View>
      </View>
    </SafeAreaView>
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
