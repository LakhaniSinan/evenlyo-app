import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const EventCard = ({navigation}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Calendar', {
          screen: 'VendorDetails',
        })
      }>
      <View
        style={{
          height: width(30),
          width: width(30),
          borderRadius: width(4),
          overflow: 'hidden',
          backgroundColor: COLORS.backgroundLight,
        }}>
        <Image
          source={IMAGES.coverImage1}
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <View
        style={{
          height: width(30),
          width: width(60),
          padding: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textDark,
              fontSize: 16,
              width: '60%',
            }}>
            Pulse Events & Entertainment
          </Text>
          <View
            style={{
              borderRadius: 100,
              backgroundColor: 'rgba(4, 195, 115, 0.1)',
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.green,
                fontSize: 10,
                paddingHorizontal: width(5),
                paddingVertical: width(2),
              }}>
              20%{t('Off')}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: COLORS.textLight,
            fontSize: 12,
          }}>
          Greater Los Angeles, Orange County
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Rating
            count={5}
            defaultRating={4}
            imageSize={12}
            selectedColor={'#FCAD38'}
            isDisabled={true}
            readonly={true}
            style={{marginRight: 5, marginTop: 5}}
            ratingContainerStyle={{marginRight: 5}}
          />
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: COLORS.textLight,
              fontSize: 12,
              marginLeft: 5,
            }}>
            4.5 (127 {t('reviews')})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: width(3),
    elevation: 5,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.black,
  },
  location: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    color: '#888',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  badge: {
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#00A86B',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default EventCard;
