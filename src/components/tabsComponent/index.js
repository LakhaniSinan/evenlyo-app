import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';

const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];

const TabItem = ({item, isActive, onPress, type}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={[styles.tabTouchable, type === 'saleItem' ? styles.saleTab : null]}>
      {isActive ? (
        <View style={styles.activeTab}>
          <LinearGradient
            colors={gradientColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.activeGradient}
          />
          <Image
            source={item.activeIcon}
            style={styles.iconActive}
            resizeMode="contain"
          />
          <Text style={styles.textActive}>{item.title}</Text>
        </View>
      ) : (
        <View style={styles.inactiveTab}>
          <Image
            source={item.inactiveIcon}
            style={styles.iconInactive}
            resizeMode="contain"
          />
          <Text style={styles.textInactive}>{item.title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabTouchable: {
    marginHorizontal: width(2),
    borderRadius: width(5),
    overflow: 'hidden',
  },
  saleTab: {
    width: '45%',
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: width(12),
    borderRadius: width(5),
    paddingHorizontal: width(5),
    overflow: 'hidden',
  },
  activeGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width(5),
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: width(12),
    backgroundColor: 'transparent',
    borderRadius: width(5),
    paddingHorizontal: width(5),
  },
  iconActive: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: COLORS.white,
  },
  iconInactive: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: COLORS.black,
  },
  textActive: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  textInactive: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

export default TabItem;
