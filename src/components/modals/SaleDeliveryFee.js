// FilterModal.js
import React, {useEffect, useState} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import TextField from '../textInput';

const SaleDeliveryFee = ({
  isVisible,
  onClose,
  onUpdate,
  isLoading,
  deliveryFee,
  setDeliveryFee,
}) => {
  const {t} = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [localFee, setLocalFee] = useState('');

  useEffect(() => {
    if (isVisible && deliveryFee !== undefined && deliveryFee !== null) {
      setLocalFee(
        typeof deliveryFee === 'number' ? String(deliveryFee) : String(deliveryFee || ''),
      );
    }
  }, [isVisible, deliveryFee]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={{justifyContent: 'space-between'}}>
          <View style={{height: '85%'}}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  {t('Sale Delivery Fee Details')}
                </Text>
                <Text style={styles.subTitleDescription}>
                  {t(
                    'Set your standard delivery fee per kilometer for sale items',
                  )}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextField
              label={t('Sale Delivery Fee Details')}
              placeholder={t('Enter fee per kilometer for sale item')}
              value={localFee}
              onChangeText={val => {
                setLocalFee(val);
                setDeliveryFee(val);
              }}
              keyboardType="numeric"
              autoCapitalize="none"
              labelColor={COLORS.text}
              bgColor={COLORS.white}
            />
          </View>

          {!isKeyboardVisible && (
            <View style={styles.bottom}>
              <GradientButton
                text={t('Update Fee')}
                onPress={() => onUpdate(localFee)}
                loading={isLoading}
              />
            </View>
          )}
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
    height: '55%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
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
    marginBottom: 20,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: width(2),
  },
  title: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitleDescription: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.black,
  },

  bottom: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
});

export default SaleDeliveryFee;
