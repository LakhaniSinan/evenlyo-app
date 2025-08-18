import React, {useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const CancelBookingModal = ({visible, onClose, onConfirm}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const {t} = useTranslation();

  const reasons = [
    'Change of Plans',
    'Found Another Vendor/Event',
    'Vendor Not Responding',
    'Incorrect Booking Details',
    'Emergency or Health Issue',
  ];

  const handleSelect = reason => {
    setSelectedReason(reason);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('Cancel Booking')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText
                text="✕"
                customStyles={{fontFamily: fontFamly.PlusJakartaSansBold}}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('Please select a reason for Cancel this booking')}
          </Text>

          <FlatList
            data={reasons}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.reasonItem}
                onPress={() => handleSelect(item)}>
                <View style={styles.radioOuter}>
                  {selectedReason === item && (
                    <Image
                      source={ICONS.cheackIcon}
                      style={{
                        width: 18,
                        height: 18,
                        marginTop: -2,
                        marginLeft: -2,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <Text style={styles.reasonText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.buttonContainer}>
            <View style={{width: width(35), marginRight: width(2)}}>
              <GradientButton
                text={t('Cancel')}
                onPress={onClose}
                type="outline"
                useGradient={true}
              />
            </View>
            <View style={{width: width(44), marginLeft: width(2)}}>
              <GradientButton
                text={t('Confirm Cancel')}
                onPress={onConfirm}
                type="filled"
                textStyle={{fontSize: 14, color: COLORS.white}}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: width(6),
    padding: width(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: width(3),
  },
  title: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  closeBtn: {
    fontSize: width(4.5),
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textDark,
    marginVertical: width(2),
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width(2),
  },
  radioOuter: {
    width: 19,
    height: 19,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width(2),
    overflow: 'hidden',
  },
  radioInner: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(5),
  },
  cancelBtn: {
    flex: 1,
    marginRight: width(2),
    paddingVertical: width(3),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(2),
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    marginLeft: width(2),
    paddingVertical: width(3),
    backgroundColor: COLORS.primary,
    borderRadius: width(2),
    alignItems: 'center',
  },
  cancelText: {
    fontSize: width(4),
    color: COLORS.textLight,
  },
  confirmText: {
    fontSize: width(4),
    color: COLORS.white,
  },
});

export default CancelBookingModal;
