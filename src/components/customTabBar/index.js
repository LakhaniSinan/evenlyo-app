import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {width, height} from 'react-native-dimension';

// Tab footer images - full footer images that change conditionally
const tabFooterImages = {
  Home: require('../../assets/tabBars/activeHome.png'),
  Calendar: require('../../assets/tabBars/activeCalender.png'),
  Messages: require('../../assets/tabBars/activeCart.png'),
  Profile: require('../../assets/tabBars/activeProfile.png'),
};

const CustomTabBar = ({state, descriptors, navigation}) => {
  // Get screen dimensions for responsive design
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  // Get the currently active tab
  const activeTabName = state.routes[state.index].name;

  // Fallback to Home image if tab name not found
  const currentImage = tabFooterImages[activeTabName] || tabFooterImages.Home;

  return (
    <View style={[styles.tabBarWrapper, {height: Math.max(height(12), 80)}]}>
      {/* Full footer image that changes based on active tab */}
      <Image
        source={currentImage}
        resizeMode="contain"
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: screenWidth / Math.max(height(12), 80),
        }}
      />

      {/* Invisible touchable areas for tab navigation */}
      <View style={[styles.touchableContainer, {marginTop: -height(2)}]}>
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
    width: width(100),
    alignSelf: 'center',
    // Remove fixed positioning and height - now handled dynamically
  },
  touchableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    // marginTop now handled dynamically based on screen size
  },
  tabButton: {
    flex: 1,
    height: '100%',
    // Add minimum touch target size for accessibility
    minHeight: 44,
  },
});

export default CustomTabBar;
