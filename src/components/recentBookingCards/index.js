import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import StatusBadge from '../statusComponent';

const RecentBookingCards = ({item, index, dataLength}) => {
  const isLastItem = index === dataLength - 1;
  const navigation = useNavigation();

  // 🟩 Capitalize each word in a name
  const capitalizeWords = text => {
    if (!text) {return '';}
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // 🟦 Get initials for avatar
  const getInitials = name => {
    if (!name) {return '';}
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <View
      style={[
        styles.card,
        isLastItem && {borderBottomWidth: 0, borderBottomColor: 'transparent'},
      ]}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.clientName || item?.customer)}
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={[styles.row, {marginBottom: 4}]}>
            <Text style={styles.name}>{capitalizeWords(item.clientName)}</Text>
            <StatusBadge status={item?.status} />
          </View>

          <Text style={styles.service}>Tracking ID: {item.trackingId}</Text>
          <Text style={styles.location}>📍 {item.location}</Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => navigation.navigate('BookingDetails', item)}>
            <Text style={styles.trackText}>View</Text>
          </TouchableOpacity>
          <Text style={styles.time}>
            ⏱ {moment(item.createdAt).format('hh:mm A')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RecentBookingCards;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: width(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.semiLightText,
    paddingVertical: width(3),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  avatarText: {
    color: COLORS.black,
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
  },
  service: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  location: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackButton: {
    borderWidth: 1,
    borderColor: COLORS.semiLightText,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  trackText: {
    fontWeight: 'bold',
    color: COLORS.black,
    fontSize: 10,
  },
  time: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
