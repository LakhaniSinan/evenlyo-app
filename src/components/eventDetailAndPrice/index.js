import React, {useState} from 'react';
import {Image, StyleSheet, Switch, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {useSelector} from 'react-redux';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {getDistance} from '../../utils';
const EventAndPriceDetails = ({
  data,
  showrating,
  showDiscount,
  showSwitch,
  currentLanguage,
}) => {
  const locationData = useSelector(state => state.LocationSlice);
  const {coords} = locationData;

  const [emailNotification, setEmailNotification] = useState(false);
  const {distance} = getDistance(data?.location?.coordinates, coords);
  console.log(data, 'distancedistancedistancedistancedistance');

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
          {data?.location?.fullAddress || data?.vendor?.businessLocation}
        </Text>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.textDark,
            fontSize: 15,
          }}>
          {currentLanguage == 'en' ? data?.title?.en : data?.title?.nl}
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
            {distance}
          </Text>
        </View>
        {showrating && (
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Rating
              ratingCount={5}
              minValue={data?.rating?.totalReviews}
              readonly={true}
              imageSize={15}
              style={{}}
            />
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                fontSize: 12,
                marginLeft: width(2),
                color: COLORS.semiLightText,
              }}>
              {data?.rating?.average}
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
          $ {data?.pricing?.totalPrice || data?.sellingPrice}
        </Text>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: '#000',
            fontSize: 9,
          }}>
          {data?.pricing?.type && ` /${data?.pricing?.type?.toUpperCase()}`}
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
