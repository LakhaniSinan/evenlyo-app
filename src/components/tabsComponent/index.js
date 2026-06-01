import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';

const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];

const TabItem = ({item, isActive, onPress, type}) => {
  const isSaleItem = type === 'saleItem';

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={[
        styles.tabTouchable,
        isSaleItem ? styles.saleTab : styles.flexTab,
      ]}>
      {isActive ? (
        <View style={[styles.activeTab, isSaleItem && styles.saleTabInner]}>
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
          <Text style={styles.textActive} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      ) : (
        <View style={[styles.inactiveTab, isSaleItem && styles.saleTabInner]}>
          <Image
            source={item.inactiveIcon}
            style={styles.iconInactive}
            resizeMode="contain"
          />
          <Text
            style={styles.textInactive}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabTouchable: {
    borderRadius: width(5),
    overflow: 'hidden',
  },
  flexTab: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: width(1),
  },
  saleTab: {
    width: '45%',
    marginHorizontal: width(1),
  },
  saleTabInner: {
    paddingHorizontal: width(3),
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: width(12),
    borderRadius: width(5),
    paddingHorizontal: width(2),
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
    paddingHorizontal: width(2),
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
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  textInactive: {
    flexShrink: 1,
    color: COLORS.black,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

export default TabItem;
