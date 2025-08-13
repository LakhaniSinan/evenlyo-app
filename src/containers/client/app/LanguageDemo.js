import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/languageSwitcher';

const LanguageDemo = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
      <ScrollView style={{flex: 1, padding: width(4)}}>
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        <View style={{marginTop: width(6)}}>
          <Text style={styles.demoTitle}>Translation Demo</Text>
          
          {/* Home Screen Translations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Screen:</Text>
            <Text style={styles.demoText}>• {t('popular')} {t('nearYou')}</Text>
            <Text style={styles.demoText}>• {t('relevant')} {t('vendors')}</Text>
            <Text style={styles.demoText}>• {t('searchEvent')}</Text>
          </View>

          {/* Home Card Translations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Card:</Text>
            <Text style={styles.demoText}>• {t('bookDJsFoodTrucks')}</Text>
            <Text style={styles.demoText}>• {t('venuesFastEasy')} {t('withoutHassle')}</Text>
          </View>

          {/* Auth Translations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auth Screens:</Text>
            <Text style={styles.demoText}>• {t('loginToAccount')}</Text>
            <Text style={styles.demoText}>• {t('registerToAccount')}</Text>
            <Text style={styles.demoText}>• {t('forgotPassword')}</Text>
            <Text style={styles.demoText}>• {t('successfullyChanged')}</Text>
          </View>

          {/* Common Elements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Elements:</Text>
            <Text style={styles.demoText}>• {t('email')} / {t('password')}</Text>
            <Text style={styles.demoText}>• {t('login')} / {t('register')}</Text>
            <Text style={styles.demoText}>• {t('continue')} / {t('back')}</Text>
            <Text style={styles.demoText}>• 20{t('percentOff')}</Text>
            <Text style={styles.demoText}>• 127 {t('reviews')}</Text>
            <Text style={styles.demoText}>• {t('perEvent')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  demoTitle: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: width(4),
  },
  section: {
    marginBottom: width(4),
    padding: width(3),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(2),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(2),
  },
  demoText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    marginBottom: width(1),
    paddingLeft: width(2),
  },
};

export default LanguageDemo;
