import React, {useState} from 'react';
import {Image, StyleSheet, Switch, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
const EventAndPriceDetails = ({showrating, showDiscount, showSwitch}) => {
  const [emailNotification, setEmailNotification] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: showDiscount ? 'center' : '',
        justifyContent: 'space-between',
        paddingHorizontal: width(3),
      }}>
      <View style={{width: width(50)}}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
            color: COLORS.semiLightText,
            fontSize: 12,
          }}>
          Newyork, USA
        </Text>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.textDark,
            fontSize: 15,
          }}>
          Morning Date at a Hidden Art Gallery
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={ICONS.locationWithoutBg}
            resizeMode="contain"
            style={{height: 10, width: 10}}
            tintColor={COLORS.semiLightText}
          />
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              marginLeft: width(2),
              color: COLORS.semiLightText,
              fontSize: 11,
            }}>
            12.6 Km away
          </Text>
        </View>
        {showrating && (
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Rating ratingCount={5} imageSize={15} style={{}} />
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                fontSize: 12,
                marginLeft: width(2),
                color: COLORS.semiLightText,
              }}>
              5.0
            </Text>
          </View>
        )}
      </View>
      <View style={{}}>
        {showDiscount && (
          <View
            style={{
              backgroundColor: '#04C373',
              borderRadius: 100,
              marginBottom: width(2),
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: '#FFFF',
                fontSize: 12,
              }}>
              20%
            </Text>
          </View>
        )}
        {showSwitch && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: width(2),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.green,
                fontSize: 12,
              }}>
              Live
            </Text>

            <Switch
              value={emailNotification}
              onValueChange={value => setEmailNotification(value)}
              trackColor={{
                false: '#E5E5E5',
                true: COLORS.primary,
              }}
              thumbColor={emailNotification ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E5E5E5"
              style={styles.switch}
            />
          </View>
        )}
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: '#000',
            fontSize: 15,
          }}>
          $ 300
        </Text>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: '#000',
            fontSize: 9,
          }}>
          /Par Event
        </Text>
      </View>
    </View>
  );
};

export default EventAndPriceDetails;

const styles = StyleSheet.create({
  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
  },
});
