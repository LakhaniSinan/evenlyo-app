import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const PopularCard = () => {
  const {t} = useTranslation();
  const data = ['', ''];
  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal: 10}}
      showsHorizontalScrollIndicator={false}
      renderItem={({item, index}) => {
        return (
          <View style={styles.cardWrapper}>
            <Image
              resizeMode="cover"
              style={styles.image}
              source={IMAGES.backgroundImage2}
            />
            <View style={styles.blurContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{flex: 1}}>
                  <Text style={styles.text}>DJ Ray Vibes</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
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
          </View>
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
