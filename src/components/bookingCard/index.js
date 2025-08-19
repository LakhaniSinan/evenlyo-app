import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { width } from 'react-native-dimension';
import { COLORS, fontFamly } from '../../constants';
import { useNavigation } from '@react-navigation/native';

const bookingsData = [
  {
    id: '1',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    category: 'DJ',
  },
  {
    id: '2',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'New Request',
    image: 'https://images.unsplash.com/photo-1502767089025-6572583495b0',
    category: 'DJ',
  },
  {
    id: '3',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'In Progress',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    category: 'DJ',
  },
  {
    id: '4',
    name: 'Food Truck Express',
    location: 'San Francisco, CA',
    price: '$450',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    category: 'Food',
  },
  {
    id: '5',
    name: 'Party Planner Pro',
    location: 'New York, NY',
    price: '$200',
    status: 'New Request',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
    category: 'Event',
  },
  {
    id: '6',
    name: 'Live Band Rock',
    location: 'Chicago, IL',
    price: '$500',
    status: 'In Progress',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    category: 'Music',
  },
];

const getStatusColor = status => {
  switch (status) {
    case 'Completed':
      return '#E8F5E8';
    case 'New Request':
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
    case 'New Request':
      return '#E91E63';
    case 'In Progress':
      return '#FF9800';
    default:
      return '#666666';
  }
};

const BookingCard = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
      style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <Text style={styles.tag}>• {item.category}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusTextColor(item.status) },
                ]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location}
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.perEvent}>/Per Event</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BookingList = ({ activeTab }) => {
  // Filter data based on active tab
  const getFilteredData = () => {
    if (activeTab === 'All Order') {
      return bookingsData;
    } else if (activeTab === 'New Requests') {
      return bookingsData.filter(item => item.status === 'New Request');
    } else if (activeTab === 'In Progress') {
      return bookingsData.filter(item => item.status === 'In Progress');
    }
    return bookingsData;
  };

  const filteredData = getFilteredData();

  return (
    <FlatList
      data={filteredData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <BookingCard item={item} />}
      contentContainerStyle={{ padding: 16 }}
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

export default BookingList;
