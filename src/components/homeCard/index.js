import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { IMAGES } from '../../assets';
import { COLORS, fontFamly } from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const HomeCard = () => {
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
              source={IMAGES.backgroundImage}
            />
            <View style={styles.blurContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.text}>{t('Book DJs Food Trucks')}</Text>
                <Text style={styles.text2}>
                  {t('Venues Fast Easy')}{' '}
                  <Text style={styles.text}>{t('With Out Hassle')} </Text>
                </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.39)',
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
