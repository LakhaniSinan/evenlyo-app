import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';

const HomeTestScreen = ({navigation}) => {
  const {t} = useTranslation();

  const navigateToScreens = [
    {title: 'Vendor Details', screen: 'VendorDetails'},
    {title: 'Language Demo', screen: 'LanguageDemo'},
    {title: 'Reviews Demo', screen: 'ReviewsDemo'},
    {title: 'Back to Home', screen: 'HomeScreen'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home Stack Navigation Test</Text>
        <Text style={styles.subtitle}>
          Navigate to different screens within Home stack while keeping bottom tabs visible
        </Text>

        <View style={styles.buttonContainer}>
          {navigateToScreens.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navigationButton}
              onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.buttonText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>✅ What's Working:</Text>
          <Text style={styles.infoText}>
            • Bottom tabs remain visible{'\n'}
            • Navigation stays within Home stack{'\n'}
            • Other stacks remain separate{'\n'}
            • Clean navigation structure
          </Text>
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
    padding: width(4),
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
    lineHeight: 22,
  },
  buttonContainer: {
    gap: width(3),
    marginBottom: width(6),
  },
  navigationButton: {
    backgroundColor: COLORS.backgroundLight,
    padding: width(4),
    borderRadius: width(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
  infoContainer: {
    backgroundColor: '#F0F8F0',
    padding: width(4),
    borderRadius: width(3),
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#2E7D32',
    marginBottom: width(2),
  },
  infoText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: '#2E7D32',
    lineHeight: 20,
  },
});

export default HomeTestScreen;
