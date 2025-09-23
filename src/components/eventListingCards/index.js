import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const EventListingCard = ({item}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetails', {booking: item})}
      style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            {item.category && <Text style={styles.tag}>• {item.category}</Text>}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>2024-06-24</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={2}>
            With over 7 years of event experience, DJ Ray...
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>{t('View Details')}</Text>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.perEvent}>/Dar</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventListingCard;
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
