import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import {COLORS, fontFamly} from '../../../constants';

const VendorTypeScreen = ({onSelectType}) => {
  return (
    <View style={{justifyContent: 'space-between'}}>
      <View style={{flex: 1}}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black,
            textAlign: 'center',
          }}>
          Create Your Vendor Account
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: COLORS.textLight,
            }}>
            Welcome to
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
              marginHorizontal: width(1),
            }}>
            Evenloyo
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: COLORS.textLight,
            }}>
            Management, Please
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: COLORS.textLight,
            textAlign: 'center',
          }}>
          Select Your Account Type
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: width(10),
          padding: width(2),
        }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectType('personal')}>
          <View style={styles.iconWrapper}>
            <Image
              source={ICONS.personalIcon}
              style={{width: width(5), height: width(5)}}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardText}>Personal Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectType('business')}>
          <View style={styles.iconWrapper}>
            <Image
              source={ICONS.businessIcon}
              style={{width: width(5), height: width(5)}}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardText}>Business Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  card: {
    height: width(25),
    width: width(36),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconWrapper: {
    padding: width(3),
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
  },
};

export default VendorTypeScreen;
