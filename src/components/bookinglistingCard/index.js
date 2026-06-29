import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {formatEuro, formatPrice} from '../../utils';
import {useTranslation} from '../../hooks';

const PRICING_TYPE_LABEL_KEYS = {
  perhour: 'Per Hour',
  perday: 'Per Day',
  perevent: 'Per Event',
};

const getPricingTypeLabel = (type, translate) => {
  if (!type) {
    return '';
  }
  const normalized = String(type).toLowerCase().replace(/\s+/g, '');
  const labelKey = PRICING_TYPE_LABEL_KEYS[normalized];
  if (labelKey) {
    return `/${translate(labelKey)}`;
  }
  return `/${String(type).toUpperCase()}`;
};

const BookingListingCard = ({item, onEditIconPress, onDeleteIconPress}) => {
  const navigation = useNavigation();
  const {t, currentLanguage} = useTranslation();
  const pricingTypeLabel = getPricingTypeLabel(item?.pricing?.type, t);

  return (
    <View style={styles.card}>
      <Image source={{uri: item.image}} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {moment(item?.date).format('DD/MM/YYYY')}
              </Text>
              <View style={{flexDirection: 'row'}}>
                {/* <TouchableOpacity
                  style={{marginRight: width(2)}}
                  onPress={() => onDeleteIconPress(item)}>
                  <Image
                    resizeMode="contain"
                    source={ICONS.deleteIcon}
                    style={{height: width(5), width: width(5)}}
                  />
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => onEditIconPress(item)}>
                  <Image
                    resizeMode="contain"
                    source={ICONS.editIcon}
                    style={{height: width(5), width: width(5)}}
                    tintColor={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {currentLanguage === 'en' ? item?.title?.en : item?.title?.nl}
          </Text>
          <Text style={styles.buttonText} numberOfLines={1}>
            {currentLanguage === 'en' ? item?.subtitle?.en : item?.subtitle?.nl}
          </Text>
          <Text style={styles.buttonText} numberOfLines={2}>
            {currentLanguage === 'en'
              ? item?.description?.en
              : item?.description?.nl}
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EventDetails', item)}
            style={styles.button}>
            <Text
              style={[
                styles.buttonText,
                {
                  color: COLORS.black,
                  textAlign: 'center',
                },
              ]}>
              {t('View Details')}
            </Text>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatEuro(item?.pricing?.amount ?? 0, {space: false})}
            </Text>
            <Text style={styles.perEvent}>{pricingTypeLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookingListingCard;
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(8),
    marginBottom: 16,
    overflow: 'hidden',
    marginHorizontal: 2,
    flexDirection: 'row',
    minHeight: 160,
    alignItems: 'center',
    paddingLeft: width(3),
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
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    color: '#06C167',
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textLight,
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
    color: COLORS.semiLightText,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    // justifyContent: 'space-between',
    // alignItems: 'center',
    width: '100%',
    marginTop: width(2),
  },
  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  perEvent: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
});
