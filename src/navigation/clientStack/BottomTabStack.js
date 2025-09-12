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
import CalendarStack from './BookingStack';
import MessagesStack from './CartStack';
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
            {options.tabBarIcon &&
              options.tabBarIcon({focused: isFocused, color: '', size: 25})}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomTabStack = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 50,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
        },
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? TAB_BAR_ICONS.home : TAB_BAR_ICONS.inActiveHome}
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? TAB_BAR_ICONS.calendar
                  : TAB_BAR_ICONS.inActiveCalendar
              }
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? TAB_BAR_ICONS.messages
                  : TAB_BAR_ICONS.inActiveCessages
              }
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused ? TAB_BAR_ICONS.profile : TAB_BAR_ICONS.inActiveProfile
              }
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabStack;
