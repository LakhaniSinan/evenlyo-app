import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import StatusBadge from '../statusComponent';

const BookingCard = ({item}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();

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
            {item?.listingDetails?.title?.en}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item?.eventLocation?.address}
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
              $ {item?.listingDetails?.pricing?.amount}
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

const BookingList = ({bookings, activeTab, refreshControl}) => {
  const {t} = useTranslation();

  const getFilteredData = () => {
    if (activeTab === t('All Order')) {
      return bookings;
    } else if (activeTab === t('pending')) {
      return bookings.filter(item => item.status === t('pending'));
    } else if (activeTab === t('accepted')) {
      return bookings.filter(item => item.status === t('accepted'));
    } else if (activeTab === t('completed')) {
      return bookings.filter(item => item.status === t('completed'));
    } else if (activeTab === t('rejected')) {
      return bookings.filter(item => item.status === t('rejected'));
    } else if (activeTab === t('paid')) {
      return bookings.filter(item => item.status === t('paid'));
    } else if (activeTab === t('finished')) {
      return bookings.filter(item => item.status === t('finished'));
    }
    return bookings;
  };

  const filteredData = getFilteredData();

  return (
    <FlatList
      data={filteredData}
      keyExtractor={item => item.id}
      renderItem={({item}) => <BookingCard item={item} />}
      refreshControl={refreshControl}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            No bookings found right now!
          </Text>
        </View>
      }
      contentContainerStyle={{flexGrow: 1, padding: 16}}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default BookingList;
