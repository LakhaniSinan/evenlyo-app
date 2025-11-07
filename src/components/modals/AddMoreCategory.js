import React, {useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import useCategories from '../../hooks/getCategories';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import Loader from '../loder';

const AddMoreCategory = ({
  isVisible,
  onClose,
  selectedOption = [],
  handleSelect,
  handleNext,
}) => {
  const {t, currentLanguage} = useTranslation();
  const {categories, loading, fetchCategories} = useCategories();

  useEffect(() => {
    if (isVisible) fetchCategories();
  }, [isVisible]);

  // ✅ Function to check if category is selected
  const isCategorySelected = id => {
    // selectedOption could be array of objects or IDs
    return selectedOption.some(item =>
      typeof item === 'string' ? item === id : item?._id === id,
    );
  };

  // ✅ Render category option
  const renderCategoryOption = opt => {
    const isSelected = isCategorySelected(opt._id);
    const categoryName =
      currentLanguage === 'en' ? opt?.name?.en : opt?.name?.nl;

    return (
      <TouchableOpacity
        key={opt._id}
        style={styles.optionRow}
        onPress={() => handleSelect(opt)}>
        <View
          style={[
            styles.checkbox,
            isSelected && {
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            },
          ]}>
          {isSelected && (
            <Icon name="checkmark" size={16} color={COLORS.white} />
          )}
        </View>
        <Text style={styles.optionLabel}>{categoryName?.trim()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      style={styles.modal}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add More Category')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Icon name="close" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subTitle}>{t('Main Category')}</Text>

        {/* Category List */}
        <View style={styles.optionWrapper}>
          {categories?.length > 0 ? (
            categories.map(renderCategoryOption)
          ) : (
            <Text style={styles.emptyText}>{t('No categories available')}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}
            activeOpacity={0.7}>
            <GradientText text={t('Cancel')} />
          </TouchableOpacity>

          <GradientButton
            text={t('Next')}
            onPress={() => handleNext(4)}
            type="filled"
            textStyle={styles.nextText}
            styleProps={{width: width(40)}}
          />
        </View>
      </View>
      <Loader isLoading={loading} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width(4),
  },
  title: {
    fontSize: 20,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    marginBottom: width(2),
    color: COLORS.textDark,
  },
  optionWrapper: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    paddingVertical: width(2),
    paddingHorizontal: width(3),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width(2),
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 14,
    color: COLORS.black,
  },
  emptyText: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: width(4),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: width(43),
  },
  nextText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

export default AddMoreCategory;
