import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TAB_BAR_ICONS} from '../../assets';

export default function CustomTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
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
            icon = isFocused ? TAB_BAR_ICONS.home : TAB_BAR_ICONS.inActiveHome;
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
            activeOpacity={0.7}>
            <Image source={icon} style={styles.tabIcon} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
});
