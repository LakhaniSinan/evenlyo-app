import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const ProtectOption = ({isChecked, setIsChecked, data}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.checkboxRow}>
      <TouchableOpacity
        onPress={() => setIsChecked(prev => !prev)}
        style={[styles.checkboxBox, isChecked && {borderWidth: 0}]}>
        {isChecked && (
          <Image
            source={ICONS.cheackIcon}
            style={styles.checkboxIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
      <Text style={styles.protectText}>
        {t(
          `Enable Evenlyo Protect (+${data?.paymentPolicy?.evenlyoProtectFeePercent}%)`,
        )}
      </Text>
      <Text
        style={[
          styles.protectText,
          {fontSize: 8, color: COLORS.textLight},
        ]}>
        {t('(Non Refundable)')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: width(5),
    alignItems: 'center',
  },
  checkboxBox: {
    height: width(6),
    width: width(6),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIcon: {height: width(6), width: width(6)},
  protectText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginLeft: width(3),
    color: COLORS.black,
  },
});

export default ProtectOption;
