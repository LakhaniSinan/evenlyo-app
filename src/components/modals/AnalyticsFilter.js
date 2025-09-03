import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomCalendar from '../customCalendar';
import GradientText from '../gradiantText';

const AnalyticsFilter = ({isVisible, onClose}) => {
  const {t} = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateSelect = () => {};
  const [startDate, setStartDate] = useState('');

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={{}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.black,
            }}>
{t('Start Date')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            style={{
              marginTop: width(2),
              height: width(13),
              borderRadius: 12,
              backgroundColor: COLORS.backgroundLight,
              justifyContent: 'center',
              paddingHorizontal: width(4),
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
              paddingHorizontal: width(3),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: COLORS.textLight,
              }}>
{t('DD/MM/YYYY')}
            </Text>
            <Image
              source={ICONS.calenderIcon}
              style={{height: 20, width: 20}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={{}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.black,
            }}>
{t('End Date')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            style={{
              marginTop: width(2),
              height: width(13),
              borderRadius: 12,
              backgroundColor: COLORS.backgroundLight,
              justifyContent: 'center',
              paddingHorizontal: width(4),
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
              paddingHorizontal: width(3),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: COLORS.textLight,
              }}>
{t('DD/MM/YYYY')}
            </Text>
            <Image
              source={ICONS.calenderIcon}
              style={{height: 20, width: 20}}
              resizeMode="contain"
            />
          </TouchableOpacity>
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
              <GradientText text={t('Reset All')} />
            </TouchableOpacity>
          </View>
          <View style={{width: width(40)}}>
            <GradientButton
              text={t('Apply Filters')}
              onPress={() => {
                onClose();
              }}
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
      <CustomCalendar
        isVisible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedStartDate={startDate}
        selectedEndDate={null}
        mode="single"
        title={t('selectDate') || 'Select Date'}
      />
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
    height: '80%',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default AnalyticsFilter;
