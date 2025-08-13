import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';

// Tab footer images - full footer images that change conditionally
const tabFooterImages = {
  Home: require('../../assets/tabBars/activeHome.png'),
  Calendar: require('../../assets/tabBars/activeCalender.png'),
  Messages: require('../../assets/tabBars/activeCart.png'),
  Profile: require('../../assets/tabBars/activeProfile.png'),
};

const CustomTabBar = ({state, descriptors, navigation}) => {
  // Get the currently active tab
  const activeTabName = state.routes[state.index].name;

  // Fallback to Home image if tab name not found
  const currentImage = tabFooterImages[activeTabName] || tabFooterImages.Home;

  return (
    <View style={styles.tabBarWrapper}>
      {/* Full footer image that changes based on active tab */}
      <Image
        source={currentImage}
        style={styles.footerImage}
        resizeMode="cover"
      />

      {/* Invisible touchable areas for tab navigation */}
      <View style={styles.touchableContainer}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'relative',
    bottom: -30,
    width: width(100),
    height: width(20),
  },
  footerImage: {
    width: 'auto',
    height: width(46),
    marginTop: -width(26.5),
  },
  touchableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    marginTop: -width(5),
  },
  tabButton: {
    flex: 1,
    height: '100%',
  },
});

export default CustomTabBar;
