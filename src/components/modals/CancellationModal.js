import React, {useEffect, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
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
  const {t} = useTranslation();

  const [selectedReason, setSelectedReason] = useState('');
  const [otherNote, setOtherNote] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const reasons = [
    'Change of plans',
    'Found better option',
    'Budget constraints',
    'Date conflict',
    'Other reason',
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

      // RESET STATE
      setSelectedReason('');
      setOtherNote('');
    }
  }, [visible]);

  const handleSelect = reason => {
    setSelectedReason(reason);

    if (reason !== 'Other reason') {
      setOtherNote('');
    }
  };

  const handleConfirm = () => {
    if (!selectedReason) return;

    onConfirm({
      reason: selectedReason,
      note: selectedReason === 'Other reason' ? otherNote : '',
    });
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
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('Cancel Booking')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <GradientText
                text="✕"
                customStyles={{fontFamily: fontFamly.PlusJakartaSansBold}}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('Please select a reason for Cancel this booking')}
          </Text>

          {/* REASONS */}
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
                      style={styles.checkIcon}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <Text style={styles.reasonText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* OTHER REASON INPUT */}
          {selectedReason === 'Other reason' && (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={t('Please write your reason')}
                value={otherNote}
                onChangeText={setOtherNote}
                multiline
                style={styles.input}
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          )}

          {/* BUTTONS */}
          <View style={styles.buttonContainer}>
            <View style={{width: width(35)}}>
              <GradientButton
                text={t('Cancel')}
                onPress={onClose}
                type="outline"
                useGradient
              />
            </View>

            <View style={{width: width(44)}}>
              <GradientButton
                text={t('Confirm Cancel')}
                onPress={handleConfirm}
                type="filled"
                textStyle={{fontSize: 14, color: COLORS.white}}
                disabled={
                  !selectedReason ||
                  (selectedReason === 'Other reason' && !otherNote.trim())
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
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  checkIcon: {
    width: 18,
    height: 18,
    marginTop: -2,
    marginLeft: -2,
  },
  reasonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  inputContainer: {
    marginTop: width(2),
  },
  input: {
    minHeight: width(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: width(2),
    padding: width(3),
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(5),
  },
});

export default CancelBookingModal;
