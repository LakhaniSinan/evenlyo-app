import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const AddNewDataModal = ({
  isVisible,
  onClose,
  selectedOption,
  handleSelect,
}) => {
  const {t} = useTranslation();

  const options = [
    {id: 1, label: t('Add More Category')},
    {id: 2, label: t('Booking Items')},
    {id: 3, label: t('Add New Sale list')},
  ];

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add New')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {options.map(option => {
          const isSelected = selectedOption === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(option.id)}
              style={{marginTop: width(2)}}>
              {isSelected ? (
                <LinearGradient
                  colors={['#FF295D', '#E31B95', '#C817AE']}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  style={styles.selectedButton}>
                  <Text style={styles.selectedText}>{option.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.button}>
                  <Text style={styles.defaultText}>{option.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    height: '40%',
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
  },
  button: {
    height: width(15),
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    height: width(15),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  selectedText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
  },
});

export default AddNewDataModal;
