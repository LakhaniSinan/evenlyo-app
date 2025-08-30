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
    status: 'New Requests',
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
    status: 'New Requests',
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

// Status color helpers
const getStatusColor = status => {
  switch (status) {
    case 'Completed':
      return '#E8F5E8';
    case 'New Requests':
      return '#FFE8F0';
    case 'In Progress':
      return '#FFF3E0';
    default:
      return '#F5F5F5';
  }
};

const getStatusTextColor = status => {
  switch (status) {
    case 'Completed':
      return '#2E7D32';
    case 'New Requests':
      return '#E91E63';
    case 'In Progress':
      return '#FF9800';
    default:
      return '#666666';
  }
};

// Card Component
const BookingCard = ({item}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('BookingDetails', item)}
      style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <Text style={styles.tag}>{item.category}</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(item.status)},
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {color: getStatusTextColor(item.status)},
                ]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            Booking ID: 112233
          </Text>
          <Text style={styles.location} numberOfLines={2}>
            With over 7 years of event experience, DJ Ray...
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.buttonText}>Date: 03/15/2025</Text>
            <Text style={styles.price}>Time: 10:00PM</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const BookingHistoryCard = ({status}) => {
  // Normalize the status (trim + lowercase)
  console.log(status, 'statusstatusstatus');

  const normalizedStatus = status?.trim().toLowerCase();

  const getFilteredData = () => {
    if (!normalizedStatus || normalizedStatus === 'all') {
      return bookingsData;
    }
    return bookingsData.filter(
      item => item.status.trim().toLowerCase() === normalizedStatus,
    );
  };

  const filteredData = getFilteredData();

  return (
    <FlatList
      data={filteredData}
      keyExtractor={item => item.id}
      renderItem={({item}) => <BookingCard item={item} />}
      contentContainerStyle={{padding: 16}}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No bookings found for "{status}"</Text>
      }
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
    color: COLORS.textLight,
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
    color: COLORS.textLight,
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
  buttonText: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  price: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textLight,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

export default BookingHistoryCard;
