import moment from 'moment';
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const CartCard = ({
  item,
  type = 'requested',
  onEditData,
  onRemoveItemFromCart,
}) => {
  console.log(item, 'itemitemitemitemitemitemitem');

  const {t, currentLanguage} = useTranslation();
  let title = item?.listingId?.title || item?.listingDetails?.title;
  title = currentLanguage == 'en' ? title?.en : title.nl;

  return (
    <View
      style={{
        backgroundColor: '#F6F6F6',
        marginBottom: width(2),
        marginHorizontal: width(3),
        borderRadius: width(3),
        padding: width(2),
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {type == 'requested' && (
            <TouchableOpacity
              style={{
                height: width(5),
                width: width(5),
                borderWidth: 1,
                borderColor: COLORS.primary,
                marginRight: width(2),
                borderRadius: width(1),
              }}>
              <Image
                style={{height: '100%', width: '100%'}}
                source={ICONS.cheackIcon}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              height: width(20),
              width: width(20),
              borderRadius: width(3),
              backgroundColor: COLORS.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              style={{height: '80%', width: '80%'}}
              source={{
                uri:
                  item.listingDetails?.featuredImage ||
                  item?.listingId?.images[0],
              }}
              resizeMode="contain"
            />
          </View>
        </View>
        <View
          style={{
            width: type == 'requested' ? width(60) : width(67),
            marginLeft: width(2),
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 15,
              color: COLORS.black,
            }}>
            {title}
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 12,
                  color: COLORS.textLight,
                }}>
                Active
              </Text>
              <Image
                style={{
                  height: width(4),
                  width: width(4),
                  marginTop: 1,
                  marginLeft: 1,
                }}
                source={ICONS.verifyedIcon}
                resizeMode="contain"
              />
            </View>
            {type !== 'requested' && (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => onEditData(item)}
                  style={{
                    height: width(7),
                    width: width(7),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: width(2),
                  }}>
                  <Image
                    source={ICONS.editGridientIcon}
                    style={{height: '70%', width: '70%'}}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRemoveItemFromCart(item)}
                  style={{
                    height: width(7),
                    width: width(7),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={ICONS.deleteIcon}
                    style={{height: '70%', width: '70%'}}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
            }}>
            <View
              style={{
                height: width(8),
                width: width(8),
                marginRight: width(2),
                borderRadius: width(100),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.white,
              }}>
              <Image
                style={{
                  height: width(5),
                  width: width(5),
                  marginTop: 1,
                  marginLeft: 1,
                }}
                source={ICONS.personalIcon}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              {item?.listingId?.vendor?.fullName || item?.vendorId?.fullName}
            </Text>
          </View>
          {item?.tempDetails?.startDate && (
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              Start Date:{' '}
              {moment(item?.tempDetails?.startDate).format('MM/DD/YYYY')}
            </Text>
          )}
          {item?.tempDetails?.endDate && (
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              End Date:{' '}
              {moment(item?.tempDetails?.endDate).format('MM/DD/YYYY')}
            </Text>
          )}
          {item?.details?.startDate && (
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              Start Date:{' '}
              {moment(item?.details?.startDate).format('MM/DD/YYYY')}
            </Text>
          )}
          {item?.details?.endDate && (
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              End Date: {moment(item?.details?.endDate).format('MM/DD/YYYY')}
            </Text>
          )}
          {type == 'requested' && (
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              Time {item?.details?.startTime}
            </Text>
          )}
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            {item?.details?.eventLocation || item?.vendorId?.fullName}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CartCard;
