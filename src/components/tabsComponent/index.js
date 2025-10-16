import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';

const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];

const TabItem = ({item, isActive, onPress, type}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={{
        marginHorizontal: width(2),
        borderRadius: width(5),
        overflow: 'hidden',
        width: type == 'saleItem' && '45%',
      }}>
      {isActive ? (
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: width(12),
            borderRadius: width(5),
            paddingHorizontal: width(5),
          }}>
          <Image
            source={item.activeIcon}
            style={{
              width: 16,
              height: 16,
              marginRight: 6,
              tintColor: COLORS.white,
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: COLORS.white,
              fontSize: 13,
              fontFamily: fontFamly.PlusJakartaSansMedium,
            }}>
            {item.title}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: width(12),
            backgroundColor: 'transparent',
            borderRadius: width(5),
            paddingHorizontal: width(5),
          }}>
          <Image
            source={item.inactiveIcon}
            style={{
              width: 16,
              height: 16,
              marginRight: 6,
              tintColor: 'black',
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: 'black',
              fontSize: 13,
              fontFamily: fontFamly.PlusJakartaSansMedium,
            }}>
            {item.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TabItem;
