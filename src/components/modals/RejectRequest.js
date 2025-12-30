import React, {useEffect, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const RejectRequestModal = ({visible, onClose, onConfirm}) => {
  const {t} = useTranslation();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const reasons = [
    'I am busy',
    'Your location is too far',
    'My team is busy at that time, sorry',
    'Can you reschedule for another day?',
    'Custom reason',
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = reason => {
    setSelectedReason(reason);
    if (reason !== 'Custom reason') {setCustomReason('');}
  };

  const handleConfirm = () => {
    if (!selectedReason) {
      ToastAndroid.show('Please select a reason first!', ToastAndroid.SHORT);
      return;
    }

    // If custom reason is selected, ensure it's not empty
    if (selectedReason === 'Custom reason' && !customReason.trim()) {
      ToastAndroid.show('Please enter your custom reason!', ToastAndroid.SHORT);
      return;
    }

    onConfirm(
      selectedReason === 'Custom reason' ? customReason.trim() : selectedReason,
    );
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{scale: scaleAnim}],
              opacity: fadeAnim,
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('Reject Booking')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <GradientText
                text="✕"
                customStyles={{fontFamily: fontFamly.PlusJakartaSansBold}}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('Please select a reason for rejecting this booking:')}
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

          {selectedReason === 'Custom reason' && (
            <TextField
              label={t('Enter your reason...')}
              placeholder={t('Enter your reason...')}
              value={customReason}
              onChangeText={text => setCustomReason(text)}
              autoCapitalize="none"
              multiline={true}
            />
          )}

          <View style={styles.buttonContainer}>
            <View style={{width: width(35), marginRight: width(2)}}>
              <GradientButton
                text={t('Cancel')}
                onPress={handleClose}
                type="outline"
                useGradient={true}
              />
            </View>
            <View style={{width: width(44), marginLeft: width(2)}}>
              <GradientButton
                text={t('Confirm Rejection')}
                onPress={handleConfirm}
                type="filled"
                textStyle={{fontSize: 14, color: COLORS.white}}
                disabled={
                  !selectedReason ||
                  (selectedReason === 'Custom reason' && !customReason.trim())
                }
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
  closeButton: {
    padding: 5,
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
  reasonText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginTop: width(2),
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansRegular,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(5),
  },
});

export default RejectRequestModal;
