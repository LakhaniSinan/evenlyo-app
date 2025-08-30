import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const RecentClientsCard = ({item, index, dataLength}) => {
  const isLastItem = index === dataLength - 1;

  return (
    <View
      style={[
        styles.card,
        isLastItem && {borderBottomWidth: 0, borderBottomColor: 'transparent'},
      ]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.time}>⏱ {item.time}</Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
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
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 10,
    fontWeight: fontFamly.PlusJakartaSansSemiBold,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 8,
    color: COLORS.black,
  },
  service: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },
  location: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 4,
  },
  trackButton: {
    borderWidth: 1,
    borderColor: COLORS.semiLightText,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  trackText: {
    fontWeight: 'bold',
    color: COLORS.black,
    fontSize: 10,
  },
  time: {
    fontSize: 8,
    color: COLORS.textLight,
  },
});
