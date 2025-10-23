import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import moment from 'moment';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const RecentClientsCard = ({item, index, dataLength}) => {
  const isLastItem = index === dataLength - 1;

  const getInitials = name => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(item?.name);
  const formattedDate = moment(item?.lastBooking).fromNow();

  return (
    <View
      style={[
        styles.card,
        isLastItem && {borderBottomWidth: 0, borderBottomColor: 'transparent'},
      ]}>
      <View style={styles.row}>
        {item?.profileImage ? (
          <Image source={{uri: item.profileImage}} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>⏱ {formattedDate}</Text>
        </View>

        <View style={{alignItems: 'center', justifyContent: 'space-between'}}>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackText}>More Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecentClientsCard;

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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.semiLightText,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
  },
  time: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  trackButton: {
    borderWidth: 1,
    borderColor: COLORS.semiLightText,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trackText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    fontSize: 10,
  },
});
