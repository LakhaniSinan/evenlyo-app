// SelectedRequestModal.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const SelectedRequestModal = ({isVisible, onSave, onClose, type}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [isSecurityFees, setIsSecurityFees] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

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

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={[styles.container, {height: type == 1 ? '90%' : '75%'}]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Elegant Vase')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Pricing Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{t('Pricing Section')}</Text>

          <View style={styles.section}>
            <TextField
              label={'Cost'}
              placeholder={t('Enter Cost')}
              bgColor={COLORS.white}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <TextField
              label={'Discount'}
              placeholder={t('30%')}
              bgColor={COLORS.white}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <TextField
              label={'New calculated price'}
              placeholder={t('$140')}
              bgColor={COLORS.white}
              keyboardType="numeric"
            />
          </View>

          {/* Previous Date Checkbox */}
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
              {isChecked ? (
                <Image
                  source={ICONS.cheackIcon}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.uncheckedBox} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>{t('Previous Date')}</Text>
          </View>

          {/* Date & Time Inputs */}
          {isChecked && (
            <>
              <View style={styles.section}>
                <TextField
                  label={'Date'}
                  placeholder={date.toLocaleDateString() || t('DD/MM/YYYY')}
                  bgColor={COLORS.white}
                  editable={false}
                  endIcon={ICONS.calenderIcon}
                  onEndIconPress={() => setOpenDate(true)}
                />
              </View>
              {type == 1 && (
                <View style={styles.section}>
                  <TextField
                    label={'Time'}
                    placeholder={time.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    bgColor={COLORS.white}
                    editable={false}
                    endIcon={ICONS.clockIcon}
                    onEndIconPress={() => setOpenTime(true)}
                  />
                </View>
              )}
            </>
          )}
          {type == 1 && (
            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setIsSecurityFees(!isChecked)}>
                {isSecurityFees ? (
                  <Image
                    source={ICONS.cheackIcon}
                    style={styles.checkIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.uncheckedBox} />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                {t('Security Fee (Non-living things only)')}
              </Text>
            </View>
          )}
        </View>

        {/* Date Picker Modal */}
        <DatePicker
          modal
          open={openDate}
          date={date}
          mode="date"
          onConfirm={d => {
            setOpenDate(false);
            setDate(d);
          }}
          onCancel={() => setOpenDate(false)}
        />

        {/* Time Picker Modal */}
        <DatePicker
          modal
          open={openTime}
          date={time}
          mode="time"
          onConfirm={t => {
            setOpenTime(false);
            setTime(t);
          }}
          onCancel={() => setOpenTime(false)}
        />

        {/* Footer Buttons */}
        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            <View style={{width: width(40)}}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.7}>
                <GradientText text={t('Cancel')} />
              </TouchableOpacity>
            </View>

            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Save & Continue')}
                onPress={onSave}
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
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: '700'},
  divider: {borderTopColor: COLORS.border, borderTopWidth: 1},
  sectionBox: {
    backgroundColor: COLORS.backgroundLight,
    padding: width(3),
    borderRadius: 10,
    marginTop: width(2),
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  section: {marginTop: width(2)},
  checkboxRow: {
    marginTop: width(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {height: width(4), width: width(4)},
  uncheckedBox: {
    height: width(4),
    width: width(4),
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 11,
    color: COLORS.textDark,
    marginLeft: width(2),
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
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

export default SelectedRequestModal;
