import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {width, height} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {ICONS} from '../../assets';
import {useDispatch, useSelector} from 'react-redux';
import {changeLanguage} from '../../redux/slice/language';
import {useTranslation} from '../../hooks';

const ChangeLanguageModal = ({visible, onClose}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {currentLanguage, availableLanguages} = useSelector(
    state => state.LanguageSlice,
  );

  const handleLanguageSelect = languageCode => {
    dispatch(changeLanguage(languageCode));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('selectLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Language Options */}
          <View style={styles.languageContainer}>
            {availableLanguages.map((language, index) => {
              const isSelected = language.code === currentLanguage;
              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    isSelected && styles.selectedLanguageOption,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}>
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageText,
                        isSelected && styles.selectedLanguageText,
                      ]}>
                      {language.name}
                    </Text>
                    <Text
                      style={[
                        styles.nativeText,
                        isSelected && styles.selectedNativeText,
                      ]}>
                      {language.nativeName}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkContainer}>
                      <Image
                        source={ICONS.checkIcon}
                        style={styles.checkIcon}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width(85),
    maxHeight: height(60),
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  languageContainer: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
  },
  languageInfo: {
    flex: 1,
  },
  languageText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  selectedLanguageText: {
    color: COLORS.primary,
  },
  nativeText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  selectedNativeText: {
    color: COLORS.primary + 'AA',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 14,
    height: 14,
    tintColor: COLORS.white,
  },
});

export default ChangeLanguageModal;
