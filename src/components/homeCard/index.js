import {BlurView} from '@react-native-community/blur';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const HomeCard = () => {
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
              source={IMAGES.backgroundImage}
            />
            <BlurView
              style={styles.blurContainer}
              blurType="dark"
              blurAmount={3}>
              <View style={styles.tint} />
              <Text style={styles.text}>Book DJs, Food Trucks &</Text>
              <Text style={styles.text2}>
                Venues Fast, Easy{' '}
                <Text style={styles.text}>& Without Hassle </Text>
              </Text>
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
    fontSize: 14,
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

export default HomeCard;
