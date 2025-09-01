import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const AddMoreCategory = ({
  isVisible,
  onClose,
  selectedOption,
  handleSelect,
  handleNext,
}) => {
  const {t} = useTranslation();

  const options = [
    {id: 1, label: 'Entertainment & Attractions'},
    {id: 2, label: 'Food & Drinks'},
    {id: 3, label: 'Decoration & Styling'},
    {id: 4, label: 'Locations & Party Tents'},
    {id: 5, label: 'Staff & Services'},
  ];

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add More Category')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subTitle}>Main Category</Text>

        {/* Options List */}
        <View style={styles.optionWrapper}>
          {options.map(opt => {
            const isSelected = selectedOption?.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={styles.optionRow}
                onPress={() => handleSelect(opt.id)}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && {backgroundColor: COLORS.primary},
                  ]}>
                  {isSelected && (
                    <Icon name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: '100%',
          }}>
          <View style={{width: width(43)}}>
            <TouchableOpacity
              onPress={() => onClose()}
              style={{
                backgroundColor: COLORS.backgroundLight,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}>
              <GradientText text={'Cancel'} />
            </TouchableOpacity>
          </View>
          <View style={{width: width(40)}}>
            <GradientButton
              text={t('Next')}
              onPress={() => handleNext(4)}
              type="filled"
              textStyle={{
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: 'white',
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
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
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    marginBottom: 10,
  },
  optionWrapper: {
    marginTop: width(2),
    backgroundColor: COLORS.backgroundLight,
    padding: width(4),
    borderRadius: width(4),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 5,
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
});

export default AddMoreCategory;
