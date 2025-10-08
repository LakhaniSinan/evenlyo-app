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
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const bookingsData = [
  {
    id: '1',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'Completed',
    image: IMAGES.backgroundImage,
    category: 'DJ',
  },
  {
    id: '2',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'New Request',
    image: IMAGES.backgroundImage,
    category: 'DJ',
  },
  {
    id: '3',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'In Progress',
    image: IMAGES.backgroundImage,
    category: 'DJ',
  },
  {
    id: '4',
    name: 'Food Truck Express',
    location: 'San Francisco, CA',
    price: '$450',
    status: 'Completed',
    image: IMAGES.backgroundImage,
    category: 'Food',
  },
  {
    id: '5',
    name: 'Party Planner Pro',
    location: 'New York, NY',
    price: '$200',
    status: 'Rejected',
    image: IMAGES.backgroundImage,
    category: 'Event',
  },
  {
    id: '6',
    name: 'Live Band Rock',
    location: 'Chicago, IL',
    price: '$500',
    status: 'In Progress',
    image: IMAGES.backgroundImage,
    category: 'Music',
  },
];

const getStatusColor = (status, t) => {
  switch (status) {
    case t('pending'):
      return '#ffee0027';
    case t('accepted'):
      return '#1e43e92d';
    case t('paid'):
      return '#2e7d321f';
    case t('In Progress'):
      return '#FFF3E0';
    case t('rejected'):
      return '#FFEBEE';
    default:
      return '#F5F5F5';
  }
};

const getStatusTextColor = (status, t) => {
  switch (status) {
    case t('pending'):
      return '#eeff00ff';
    case t('paid'):
      return '#2E7D32';
    case t('accepted'):
      return '#1e43e9ff';
    case t('In Progress'):
      return '#FF9800';
    case t('rejected'):
      return '#D32F2F';
    default:
      return '#666666';
  }
};

const BookingCard = ({item}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  console.log(item, 'askldnlaskndlaskdnlsakd');

  return (
    <View style={styles.card}>
      {/* {item?.images?.length > 0 && ( */}
      <Image source={{uri: item?.vendor?.businessLogo}} style={styles.image} />
      {/* )} */}
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <Text style={styles.tag}>• {item.category}</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(item.status, t)},
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {color: getStatusTextColor(item.status, t)},
                ]}>
                {t(
                  item?.status?.charAt(0).toUpperCase() +
                    item?.status?.slice(1).toLowerCase(),
                )}
              </Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {item?.vendor?.businessName}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item?.eventLocation}
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BookingDetails', {booking: item})
            }
            style={styles.button}>
            <Text style={styles.buttonText}>{t('View Details')}</Text>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.totalPrice}</Text>
            <Text style={styles.perEvent}>{t('/Per Event')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const BookingList = ({bookings, activeTab}) => {
  const {t} = useTranslation();

  console.log(bookings, 'bookingsbookingsbookingsbookingsbookings');

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
    }
    return bookings;
  };

  const filteredData = getFilteredData();

  return (
    <FlatList
      data={filteredData}
      keyExtractor={item => item.id}
      renderItem={({item}) => <BookingCard item={item} />}
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

const styles = StyleSheet.create({
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

export default BookingList;
