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
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const PopularCard = ({data, onCardPress, type, handleAddToCart}) => {
  const {currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    inStock: isDutch ? 'Op voorraad' : 'In Stock',
    buyNow: isDutch ? 'Koop nu' : 'Buy Now',
    noProductFound: isDutch ? 'Geen producten gevonden.' : 'No Product Found.',
  };
  const [activeHeart, setActiveHeart] = useState(null);

  const renderItem = ({item, index}) => {
    const imageUri = item?.images?.length > 0 ? item.images[0] : item?.image;

    return (
      <View
        activeOpacity={0.9}
        // onPress={() => onCardPress({...item, type})}
        style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{uri: imageUri}} style={styles.image} />

          <View style={styles.stockBadge}>
            <View style={styles.dot} />
            <Text style={styles.stockText}>{localizedText.inStock}</Text>
          </View>

          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() =>
              setActiveHeart(activeHeart === index ? null : index)
            }>
            <Image
              source={
                activeHeart === index
                  ? ICONS.activeHeartIocn
                  : ICONS.inactiveHeartIcon
              }
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.title}>
            {currentLanguage === 'en' ? item?.title?.en : item?.title?.nl}
          </Text>

          <Text style={styles.price}>
            ${item?.pricing?.totalPrice || item?.sellingPrice || 0}
          </Text>

          <TouchableOpacity onPress={() => handleAddToCart(item)}>
            <LinearGradient
              colors={['#ff2d95', '#c800c8']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buyBtn}>
              <Text style={styles.buyText}>{localizedText.buyNow}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 10}}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            width: width(100),
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textLight,
              textAlign: 'center',
            }}>
            {localizedText.noProductFound}
          </Text>
        </View>
      }
    />
  );
};

export default PopularCard;

const styles = StyleSheet.create({
  card: {
    width: width(60),
    marginVertical: width(2),
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  imageWrapper: {
    height: width(45),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#E9FFF2',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },

  stockText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: '#22c55e',
  },

  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heartIcon: {
    height: 18,
    width: 18,
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: 8,
  },

  price: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#d100c9',
    marginBottom: 14,
  },

  buyBtn: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },

  buyText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});
