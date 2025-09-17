import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const ListingCard = ({item, navigation}) => {
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
          source={item?.image}
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 8,
              color: COLORS.green,
              fontFamily: fontFamly.PlusJakartaSansSemiMedium,
            }}>
            DJ
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
              }}>
              4.9
            </Text>
            <Rating
              ratingCount={1}
              imageSize={15}
              style={{marginLeft: width(2)}}
            />
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textDark,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            DJ Ray Vibes
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: width(2),
            }}>
            <Image
              style={{width: 10, height: 10}}
              source={ICONS.locationWithoutBg}
              resizeMode="contain"
              tintColor={COLORS.textLight}
            />
            <Text
              style={{
                fontSize: 8,
                color: COLORS.textDark,
                marginLeft: width(1),
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
              }}>
              Los Angeles, CA
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
          <TouchableOpacity
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
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EventDetails')}
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
              Book Now
            </Text>
          </TouchableOpacity>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textDark,
                fontFamily: fontFamly.PlusJakartaSansBold,
              }}>
              $300
            </Text>
            {item?.priceUnit && (
              <Text
                style={{
                  fontSize: 9,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                /{item?.priceUnit}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ListingCard;
