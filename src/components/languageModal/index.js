import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, SIZES} from '../../constants';
import {useDispatch, useSelector} from 'react-redux';
import {changeLanguage} from '../../redux/slice/language';
import useTranslation from '../../hooks/useTranslation';

const LanguageModal = ({visible, onClose}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {currentLanguage, availableLanguages} = useSelector(
    state => state.LanguageSlice,
  );

  const handleLanguageSelect = languageCode => {
    dispatch(changeLanguage(languageCode));
    onClose();
  };

  const renderLanguageItem = ({item}) => {
    const isSelected = item.code === currentLanguage;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(item.code)}>
        <Text
          style={[
            styles.languageText,
            isSelected && styles.selectedLanguageText,
          ]}>
          {t(item.code === 'en' ? 'english' : 'dutch')}
        </Text>
        <Text
          style={[
            styles.nativeText,
            isSelected && styles.selectedNativeText,
          ]}>
          {item.nativeName}
        </Text>
      </TouchableOpacity>
    );
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
        <View style={styles.modal}>
          <Text style={styles.title}>{t('selectLanguage') || 'Select Language'}</Text>
          <FlatList
            data={availableLanguages}
            renderItem={renderLanguageItem}
            keyExtractor={item => item.code}
            style={styles.list}
          />
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
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: width(80),
    maxHeight: 300,
    padding: SIZES.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  list: {
    maxHeight: 200,
  },
  languageItem: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    borderRadius: 8,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLanguageItem: {
    backgroundColor: COLORS.primary + '10',
  },
  languageText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  nativeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  selectedNativeText: {
    color: COLORS.primary,
  },
});

export default LanguageModal;
