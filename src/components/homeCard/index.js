import {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
const HomeCard = ({data, onBookingCardPress, handleAddToWishList}) => {
  const {t, currentLanguage} = useTranslation();
  const [isActiveHeart, setIsActiveHeart] = useState(
    data?.isFavourite || false,
  );

  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal: 10}}
      showsHorizontalScrollIndicator={false}
      renderItem={({item, index}) => {
        return (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => onBookingCardPress(item)}>
            {item?.images?.length > 0 ? (
              <Image
                resizeMode="cover"
                style={styles.image}
                source={{uri: item?.images[0]}}
              />
            ) : (
              <Image
                resizeMode="cover"
                style={styles.image}
                source={{uri: item?.featuredImage}}
              />
            )}
            <View
              style={{
                height: width(10),
                width: '100%',
                position: 'absolute',
                zIndex: 99,
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: width(4),
                marginTop: width(3),
              }}>
              <View
                style={{
                  height: width(5),
                  borderRadius: 10,
                  flexDirection: 'row',
                  backgroundColor: '#04c37448',
                  alignItems: 'center',
                  paddingHorizontal: width(2),
                }}>
                <View
                  style={{
                    borderRadius: 100,
                    padding: width(0.5),
                    backgroundColor: '#04c374ff',
                    marginRight: width(1),
                    marginTop: width(0.5),
                  }}
                />
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    fontSize: 8,
                    color: COLORS.green,
                  }}>
                  Available
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAddToWishList(item?._id)}
                style={{
                  height: width(8),
                  width: width(8),
                  borderRadius: 9,
                  backgroundColor: 'hsla(0, 0%, 0%, 0.45)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={
                    item?.isFavourite
                      ? ICONS.activeHeartIocn
                      : ICONS.inactiveHeartIcon
                  }
                  style={{height: width(4), width: width(4)}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.blurContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  {t(
                    `${
                      currentLanguage == 'en'
                        ? item?.title?.en
                        : item?.title?.nl
                    }`,
                  )}
                </Text>
                <Text style={styles.text2}>
                  {t(
                    `${
                      currentLanguage == 'en'
                        ? item?.description?.en
                        : item?.description?.nl
                    }`,
                  )}{' '}
                  <Text style={styles.text}>
                    {t(
                      `${
                        currentLanguage == 'en'
                          ? item?.subtitle?.en
                          : item?.subtitle?.nl
                      }`,
                    )}
                  </Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={() => (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: width(100),
            height: width(10),
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            No Relevant Vendors Found!
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginTop: 10,
    backgroundColor: COLORS.backgroundLight,
    height: 214,
    width: 318,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  blurContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'hsla(0, 0%, 0%, 0.45)',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    minHeight: 60,
  },

  text: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
    fontSize: 12,
    zIndex: 1,
    textAlign: 'left',
    lineHeight: 18,
  },
  text2: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
    fontSize: 12,
    zIndex: 1,
    marginRight: 10,
    lineHeight: 18,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default HomeCard;
