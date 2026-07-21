import React, {memo, useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useSelector} from 'react-redux';

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

  const {unreadCount} = useSelector(state => state.notification);

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
            style={styles.notificationButton}
            onPress={onNotificationsPress}>
            <Image source={ICONS.notificationIcon} style={styles.icon} />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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

  notificationButton: {
    marginRight: 10,
    position: 'relative',
  },

  icon: {
    width: 40,
    height: 40,
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundLight,
    zIndex: 999,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Agar font available ho to ye use kar sakte ho:
    // fontFamily: fontFamly.PlusJakartaSansBold,
  },

  spacer: {
    height: 10,
  },
});

export default memo(HomeHeader);
