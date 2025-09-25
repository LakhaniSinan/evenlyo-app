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

const PopularCard = ({data, onCardPress}) => {
  const {t} = useTranslation();
  const [isActiveHeart, setIsActiveHeart] = useState(false);
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
            onPress={() => onCardPress(item)}
            style={styles.cardWrapper}>
            <Image
              resizeMode="cover"
              style={styles.image}
              source={item.image}
            />
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
                onPress={() => setIsActiveHeart(!isActiveHeart)}
                style={{
                  height: width(8),
                  width: width(8),
                  borderRadius: 9,
                  backgroundColor: 'rgba(255, 245, 245, 0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={
                    isActiveHeart
                      ? ICONS.activeHeartIocn
                      : ICONS.inactiveHeartIcon
                  }
                  style={{height: width(4), width: width(4)}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.blurContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{flex: 1}}>
                  <Text style={styles.text}>DJ Ray Vibes</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4,
                    }}>
                    <Image
                      source={ICONS.locationWithoutBg}
                      resizeMode="contain"
                      style={{height: 10.89, width: 8.91}}
                    />
                    <Text
                      style={{
                        fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                        color: COLORS.white,
                        fontSize: 10,
                        marginLeft: 5,
                        lineHeight: 12,
                      }}>
                      Los Angeles, CA
                    </Text>
                  </View>
                </View>

                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.text}>$300</Text>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      color: COLORS.white,
                      fontSize: 9,
                      lineHeight: 11,
                      marginTop: 2,
                    }}>
                    {t('perEvent')}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginTop: 10,
    height: 214,
    width: 258,
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
    backgroundColor: 'rgba(255, 245, 245, 0.35)',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    minHeight: 80,
  },

  text: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
    fontSize: 16,
    zIndex: 1,
    textAlign: 'left',
    lineHeight: 20,
  },
  text2: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
    fontSize: 14,
    zIndex: 1,
    marginRight: 10,
  },
});

export default PopularCard;
