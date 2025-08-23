import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const CancelBookingModal = ({visible, onClose, onConfirm}) => {
  const {t} = useTranslation();
  const [selectedReason, setSelectedReason] = useState('');
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
      // Animate in
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
      // Animate out
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
  };

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim 
            }
          ]}
        >
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
                onPress={handleConfirm}
                type="filled"
                textStyle={{fontSize: 14, color: COLORS.white}}
                disabled={!selectedReason}
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
