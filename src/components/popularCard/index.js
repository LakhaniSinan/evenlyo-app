import {BlurView} from '@react-native-community/blur';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const PopularCard = () => {
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
            <BlurView
              style={styles.blurContainer}
              blurType="dark"
              blurAmount={3}>
              <View style={styles.tint} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{}}>
                  <Text style={styles.text}>DJ Ray Vibes</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={ICONS.locationWithoutBg}
                      resizeMode="contain"
                      style={{height: 10.89, width: 8.91, marginTop: width(1)}}
                    />
                    <Text
                      style={{
                        fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                        color: COLORS.white,
                        fontSize: 10,
                        marginLeft: 5,
                      }}>
                      Los Angeles, CA
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.text}>$300</Text>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      color: COLORS.white,
                      fontSize: 9,
                      marginLeft: 5,
                    }}>
                    /Par Event
                  </Text>
                </View>
              </View>
            </BlurView>
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
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
    padding: 15,
    justifyContent: 'center',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 16,
  },

  text: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
    fontSize: 16,
    zIndex: 1,
    textAlign: 'left',
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
