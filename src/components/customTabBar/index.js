import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {TAB_BAR_ICONS} from '../../assets';

export default function CustomTabBar({state, descriptors, navigation}) {
  return (
    <View>
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
          <TouchableOpacity key={route.key} onPress={onPress}>
            <Image source={icon} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
