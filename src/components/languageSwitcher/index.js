import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {changeLanguage} from '../../redux/slice/language';
import useTranslation from '../../hooks/useTranslation';

const LanguageSwitcher = ({style}) => {
  const dispatch = useDispatch();
  const {t, currentLanguage} = useTranslation();

  const languages = [
    {code: 'en', name: t('english'), nativeName: 'English'},
    {code: 'nl', name: t('dutch'), nativeName: 'Nederlands'},
  ];

  const handleLanguageChange = (languageCode) => {
    dispatch(changeLanguage(languageCode));
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>
      <View style={styles.languageButtons}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              currentLanguage === language.code && styles.activeLanguageButton,
            ]}
            onPress={() => handleLanguageChange(language.code)}>
            <Text
              style={[
                styles.languageText,
                currentLanguage === language.code && styles.activeLanguageText,
              ]}>
              {language.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: width(4),
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(3),
    textAlign: 'center',
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: width(2),
  },
  languageButton: {
    flex: 1,
    paddingVertical: width(3),
    paddingHorizontal: width(4),
    borderRadius: width(2),
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
  activeLanguageText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default LanguageSwitcher;
