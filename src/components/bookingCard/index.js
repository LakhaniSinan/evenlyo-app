import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {formatPrice} from '../../utils';
import StatusBadge from '../statusComponent';

const getLocalizedField = (field, currentLanguage) => {
  if (!field) {
    return '';
  }
  if (typeof field === 'string') {
    return field;
  }
  return currentLanguage === 'en'
    ? field.en || field.nl || ''
    : field.nl || field.en || '';
};

const BookingCard = ({item}) => {
  const navigation = useNavigation();
  const {t, currentLanguage} = useTranslation();

  return (
    <View style={styles.card}>
      <Image
        source={{uri: item?.listingDetails?.featuredImage}}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <StatusBadge status={item?.status} />
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {getLocalizedField(item?.listingDetails?.title, currentLanguage)}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item?.eventLocation}
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('BookingDetails', item)}
            style={styles.button}>
            <Text style={styles.buttonText}>{t('View Details')}</Text>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              € {formatPrice(item?.listingDetails?.pricing?.amount)}
            </Text>
            <Text style={styles.perEvent}>
              /{item?.pricingBreakdown?.pricingType?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const BookingList = ({
  bookings,
  refreshControl,
  onEndReached,
  onEndReachedThreshold = 0.4,
  loadingMore = false,
}) => {
  const {t} = useTranslation();

  return (
    <FlatList
      data={bookings}
      keyExtractor={item => String(item?._id || item?.id)}
      renderItem={({item}) => <BookingCard item={item} />}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <Text style={styles.footerLoaderText}>{t('Loading more...')}</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('No bookings found right now!')}
          </Text>
        </View>
      }
      contentContainerStyle={{flexGrow: 1, padding: 16}}
      showsVerticalScrollIndicator={false}
    />
  );
};

export {BookingCard};
export default BookingList;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textLight,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerLoaderText: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 12,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    padding: width(3),
    borderRadius: width(8),
    marginBottom: 16,
    overflow: 'hidden',
    marginHorizontal: 2,
    flexDirection: 'row',
    minHeight: 160,
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: width(5),
    backgroundColor: COLORS.backgroundLight,
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    color: '#06C167',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  name: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 20,
  },
  location: {
    color: COLORS.textDark,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  perEvent: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
});
