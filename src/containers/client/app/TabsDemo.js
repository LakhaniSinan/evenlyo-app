import React from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/languageSwitcher';

const TabsDemo = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>🎉 Bottom Tabs Demo</Text>
          <Text style={styles.subtitle}>
            Your custom bottom tabs are now working with dual language support!
          </Text>

          {/* Language Switcher */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language Switcher:</Text>
            <LanguageSwitcher />
          </View>

          {/* Tab Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Features:</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>
                • Custom gradient active tab design
              </Text>
              <Text style={styles.featureItem}>
                • Full image change on tab selection
              </Text>
              <Text style={styles.featureItem}>
                • Dual language support (English/Dutch)
              </Text>
              <Text style={styles.featureItem}>
                • Smooth animations and transitions
              </Text>
              <Text style={styles.featureItem}>
                • Professional styling with shadows
              </Text>
            </View>
          </View>

          {/* Tab Labels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Tab Labels:</Text>
            <View style={styles.tabLabels}>
              <View style={styles.tabLabelItem}>
                <Text style={styles.tabLabelText}>🏠 {t('home')}</Text>
              </View>
              <View style={styles.tabLabelItem}>
                <Text style={styles.tabLabelText}>📅 {t('calendar')}</Text>
              </View>
              <View style={styles.tabLabelItem}>
                <Text style={styles.tabLabelText}>💬 {t('messages')}</Text>
              </View>
              <View style={styles.tabLabelItem}>
                <Text style={styles.tabLabelText}>👤 {t('profile')}</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 How to Use:</Text>
            <Text style={styles.instructionText}>
              1. Tap any tab at the bottom to switch between screens{'\n'}
              2. The active tab will show a beautiful gradient background{'\n'}
              3. Switch languages and see tab labels update automatically{'\n'}
              4. All navigation works seamlessly with your existing screens
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bottom tabs are now fully integrated with your app! 🚀
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: width(4),
    paddingBottom: width(8),
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: width(2),
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: width(6),
    lineHeight: 24,
  },
  section: {
    marginBottom: width(6),
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(3),
  },
  featureList: {
    paddingLeft: width(2),
  },
  featureItem: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    marginBottom: width(1),
    lineHeight: 20,
  },
  tabLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width(2),
  },
  tabLabelItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: width(3),
    paddingVertical: width(2),
    borderRadius: width(2),
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
  },
  tabLabelText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  footer: {
    marginTop: width(4),
    padding: width(4),
    backgroundColor: '#E8F5E8',
    borderRadius: width(3),
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#2D5A2D',
    textAlign: 'center',
  },
});

export default TabsDemo;
