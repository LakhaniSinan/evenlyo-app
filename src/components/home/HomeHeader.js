import React, {memo, useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const HomeHeader = ({
  city,
  regionState,
  address,
  onNotificationsPress,
  onFilterPress,
}) => {
  const locationLabel = useMemo(() => {
    if (city || regionState) {
      return `${city || ''}${
        regionState ? `${city ? ', ' : ''}${regionState}` : ''
      }`;
    }
    return address || '';
  }, [address, city, regionState]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.locationGroup}>
          <Image source={ICONS.locationIcon} style={styles.icon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionSpacing}
            onPress={onNotificationsPress}>
            <Image source={ICONS.notificationIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onFilterPress}>
            <Image source={ICONS.filters} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  row: {
    paddingVertical: width(2),
    paddingHorizontal: width(2),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationGroup: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    color: COLORS.black,
    fontSize: 12,
    marginLeft: width(3),
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionSpacing: {
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  spacer: {
    height: 10,
  },
});

export default memo(HomeHeader);
