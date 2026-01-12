import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {ICONS} from '../../assets';

const EventListingCard = ({onEditIconPress, item, onDeleteIconPress}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <TouchableOpacity
      // onPress={() => navigation.navigate('EventDetails', {booking: item})}
      style={styles.card}>
      <Image source={{uri: item.image}} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {moment(item?.date).format('MMM DD,YYYY')}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{marginRight: width(2)}}
                  onPress={() => onDeleteIconPress(item)}>
                  <Image
                    resizeMode="contain"
                    source={ICONS.deleteIcon}
                    style={{height: width(5), width: width(5)}}
                  />
                </TouchableOpacity>
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
          <Text style={styles.name} numberOfLines={2}>
            {item.title?.en}
          </Text>
          <Text style={styles.buttonText}>Available Stock: {item?.Stock}</Text>
          <Text style={styles.buttonText}>
            Purchase Price: {item?.PurchasePrice} /Dar
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.SellingPrice}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
    justifyContent: 'flex-end',
    width: '100%',
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
