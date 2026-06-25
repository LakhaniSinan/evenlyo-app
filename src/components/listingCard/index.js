import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {formatPrice} from '../../utils';

const PRICING_TYPE_LABEL_KEYS = {
  perhour: 'Per Hour',
  perday: 'Per Day',
  perevent: 'Per Event',
};

const getPricingTypeLabel = (type, translate) => {
  if (!type) {
    return '';
  }
  const normalized = String(type).toLowerCase().replace(/\s+/g, '');
  const labelKey = PRICING_TYPE_LABEL_KEYS[normalized];
  if (labelKey) {
    return `/${translate(labelKey)}`;
  }
  return `/${String(type).toUpperCase()}`;
};

const ListingCard = ({item, navigation}) => {
  const {t, currentLanguage} = useTranslation();

  console.log(item, 'itemitemitemitemitem');

  const title =
    currentLanguage === 'en'
      ? item?.title?.en || item?.title?.nl || t('Untitled')
      : item?.title?.nl || item?.title?.en || t('Untitled');
  const subtitle =
    currentLanguage === 'en'
      ? item?.subtitle?.en || item?.subtitle?.nl || ''
      : item?.subtitle?.nl || item?.subtitle?.en || '';
  const location = item?.location?.userAddress || t('Unknown');
  const price = item?.pricing?.amount || 0;
  const priceUnit = getPricingTypeLabel(item?.pricing?.type, t);
  const rating = item?.rating?.average || 0;
  const reviews = item?.rating?.totalReviews || 0;
  const vendorName = item?.vendor?.businessName || item?.vendor?.fullName;
  const image = item?.images?.[0];

  return (
    <View
      style={{
        padding: width(2),
        backgroundColor: COLORS.backgroundLight,
        marginTop: width(3),
        borderRadius: width(5),
        marginHorizontal: width(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          height: width(30),
          width: width(30),
          borderRadius: width(4),
          overflow: 'hidden',
          backgroundColor: COLORS.white,
        }}>
        <Image
          source={{uri: image}}
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
      </View>

      <View
        style={{
          width: width(60),
          height: width(30),
          justifyContent: 'space-between',
          paddingHorizontal: width(2),
        }}>
        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 10,
              color: COLORS.green,
              fontFamily: fontFamly.PlusJakartaSansSemiMedium,
            }}>
            {vendorName}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
              }}>
              {rating.toFixed(1)} ({reviews})
            </Text>
            <Rating
              readonly
              startingValue={rating}
              ratingCount={5}
              imageSize={12}
              style={{marginLeft: width(1)}}
            />
          </View>
        </View> */}

        <View>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              color: COLORS.textDark,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              color: COLORS.textLight,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {subtitle}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: width(1.5),
            }}>
            <Image
              style={{width: 10, height: 10}}
              source={ICONS.locationWithoutBg}
              resizeMode="contain"
              tintColor={COLORS.textLight}
            />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 8,
                color: COLORS.textDark,
                marginLeft: width(1),
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
              }}>
              {location}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: width(2),
          }}>
          {/* <TouchableOpacity
            style={{
              height: width(8),
              width: width(8),
              backgroundColor: COLORS.white,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={ICONS.cartIcon}
              style={{height: 20, width: 20}}
              resizeMode="contain"
            />
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => navigation.navigate('EventDetails', item)}
            style={{
              height: width(8),
              width: width(25),
              backgroundColor: COLORS.white,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.textDark,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              {t('Book Now')}
            </Text>
          </TouchableOpacity>

          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textDark,
                fontFamily: fontFamly.PlusJakartaSansBold,
              }}>
              € {formatPrice(price)}
            </Text>
            {priceUnit ? (
              <Text
                style={{
                  fontSize: 9,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {priceUnit}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ListingCard;
