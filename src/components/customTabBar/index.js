import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {TAB_BAR_ICONS} from '../../assets';
import {COLORS} from '../../constants';

const {width} = Dimensions.get('window');

export default function CustomTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const tabWidth = width / state.routes.length;

  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }).start();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [state.index]);

  // Don't render if keyboard is visible
  if (isKeyboardVisible) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{backgroundColor: 'transparent', overflow: 'hidden'}}>
      <Animated.View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 90 + insets.bottom,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                width: tabWidth,
                transform: [
                  {translateX: Animated.add(translateX, (tabWidth - 409) / 2)},
                ],
              },
            ]}>
            <View style={styles.curve}>
              <View style={styles.dot} />
            </View>
          </Animated.View>

          {state.routes.map((route, index) => {
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

            // Icons mapping
            let icon;
            switch (route.name) {
              case 'Home':
                icon = isFocused
                  ? TAB_BAR_ICONS.home
                  : TAB_BAR_ICONS.inActiveHome;
                break;
              case 'Calendar':
                icon = isFocused
                  ? TAB_BAR_ICONS.calendar
                  : TAB_BAR_ICONS.inActiveCalendar;
                break;
              case 'Messages':
                icon = isFocused
                  ? TAB_BAR_ICONS.messages
                  : TAB_BAR_ICONS.inActiveCessages;
                break;
              case 'Profile':
                icon = isFocused
                  ? TAB_BAR_ICONS.profile
                  : TAB_BAR_ICONS.inActiveProfile;
                break;
              default:
                icon = TAB_BAR_ICONS.inActiveHome;
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={1}>
                <Image source={icon} style={styles.tabIcon} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
    // marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  tabIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  activeIndicator: {
    position: 'absolute',
    top: -25,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  curve: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    top: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
  },
});
