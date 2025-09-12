import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Dimensions, Image, TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import {TAB_BAR_ICONS} from '../../assets';
import {COLORS} from '../../constants';
import AllBookingStack from './AllBookingStack';
import EventListStack from './EventListStack';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();
const {width} = Dimensions.get('window');
const TAB_WIDTH = width / 4;

const TabBackground = ({translateX}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: withTiming(translateX.value, {duration: 300})}],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -20,
          left: 0,
          width: TAB_WIDTH,
          height: 70, // thoda zyada taake curve show ho
          alignItems: 'center',
        },
        animatedStyle,
      ]}>
      {/* Curve shape */}
      <Svg width={TAB_WIDTH} height="40" style={{backgroundColor: '#fff'}}>
        <Path
          d={`
      M0,0
      Q0,20 10,20
      L${TAB_WIDTH * 0.25},20
      Q${TAB_WIDTH / 2},55 ${TAB_WIDTH * 0.75},20  
      L${TAB_WIDTH - 10},20
      Q${TAB_WIDTH},20 ${TAB_WIDTH},0 
      Z
    `}
          fill={COLORS.backgroundLight}
        />
      </Svg>

      {/* Pink dot inside curve */}
      <View
        style={{
          position: 'absolute',
          top: 22, // curve ke andar centre approx
          left: TAB_WIDTH / 2 - 6,
          width: 12,
          height: 12,
          borderRadius: 8,
          backgroundColor: '#E31B95',
          borderColor: '#FFF',
        }}
      />
    </Animated.View>
  );
};

const CustomTabBar = ({state, descriptors, navigation}) => {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = state.index * TAB_WIDTH;
  }, [state.index]);

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#FFF',
        elevation: 5,
        overflow: 'hidden',
      }}>
      <TabBackground translateX={translateX} />

      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <Image
              resizeMode="contain"
              source={
                isFocused
                  ? options.tabBarIcon.active
                  : options.tabBarIcon.inActive
              }
              style={{
                width: 25,
                height: 25,
                tintColor: isFocused ? '#E31B95' : '#BEBEBE',
              }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const VendorBottomTabStack = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: {
            active: TAB_BAR_ICONS.home,
            inActive: TAB_BAR_ICONS.inActiveHome,
          },
        }}
      />
      <Tab.Screen
        name="EventList"
        component={EventListStack}
        options={{
          tabBarIcon: {
            active: TAB_BAR_ICONS.activeListIcon,
            inActive: TAB_BAR_ICONS.inActiveListIcon,
          },
        }}
      />
      <Tab.Screen
        name="AllBookingStack"
        component={AllBookingStack}
        options={{
          tabBarIcon: {
            active: TAB_BAR_ICONS.calendar,
            inActive: TAB_BAR_ICONS.inActiveCalendar,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: {
            active: TAB_BAR_ICONS.profile,
            inActive: TAB_BAR_ICONS.inActiveProfile,
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default VendorBottomTabStack;
