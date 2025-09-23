// BookingFilterPopUp.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import GradientText from '../gradiantText';

const BookingFilterPopUp = ({isVisible, onClose, nestedFilter}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const mainCategory = useRef(null);
  const subCategory = useRef(null);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputVal, setInputVal] = useState({
    mainCategory: '',
    subCategory: '',
  });

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  const handleSelectValue = (name, value) => {
    setInputVal(prev => ({
      ...prev,
      [name]: value?.name || value,
    }));
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView style={{flex: 1}}>
          <CustomPicker
            ref={mainCategory}
            label="Main_Category"
            labelll="Main Category"
            value={inputVal?.mainCategory || ''}
            listData={[
              {name: 'Entertainment & Attractions'},
              {name: 'Food & Drinks'},
              {name: 'Decoration & Styling'},
              {name: 'Locations & Party Tents'},
              {name: 'Staff & Services'},
            ]}
            name="mainCategory"
            handleSelectValue={handleSelectValue}
          />
          <CustomPicker
            ref={subCategory}
            label="Sub_Category"
            labelll="Sub Category"
            value={inputVal?.subCategory || ''}
            listData={[
              {name: 'DJ'},
              {name: 'Live Band'},
              {name: 'Photo Booth'},
            ]}
            name="subCategory"
            handleSelectValue={handleSelectValue}
          />
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            <View style={{width: width(40)}}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.7}>
                <GradientText text={'Reset All'} />
              </TouchableOpacity>
            </View>

            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Apply Filters')}
                onPress={() => {
                  onClose();
                }}
                type="filled"
                textStyle={styles.applyText}
              />
            </View>
          </View>
        )}
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
    height: '50%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  buttonRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: width(100),
    justifyContent: 'space-around',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#666',
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

export default BookingFilterPopUp;
