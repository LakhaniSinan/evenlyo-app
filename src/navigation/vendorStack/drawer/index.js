import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';
import VendorBottomTabStack from '../BottomTabStack';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import CustomDrawer from './CustomDrawer';
import ChatDetail from '../../../containers/vendor/app/ChatDetails';
import CreateCustomOffer from '../../../containers/vendor/app/CreateCustomOffre';
import BookingItems from '../../../containers/vendor/app/BookingItems';
import VendorDetailStack from '../VendorDetailStack';

const Drawer = createDrawerNavigator();

function ScreenWithAnimation({navigation}) {
  const progress = useDrawerProgress(); // progress between 0 and 1

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.9]);
    const marginTop = interpolate(progress.value, [0, 1], [0, 100]);

    const marginBottom = interpolate(progress.value, [0, 3], [0, 180]);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 20]);

    return {
      transform: [{scale}],
      marginTop,
      marginBottom,
      borderRadius,
    };
  });

  // Close button style (fade in when drawer opens)
  // Close button style (fade in when drawer opens)
  const closeButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.3, 0.5], [0, 1]);
    const translateY = interpolate(progress.value, [0, 1], [-20, 0]);
    const zIndex = progress.value > 0 ? 9999 : -1;

    return {
      opacity,
      transform: [{translateY}],
      zIndex,
    };
  });

  const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];
  return (
    <View style={{backgroundColor: '#fff', flex: 1, position: 'relative'}}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 30,
            left: 15,
          },
          closeButtonStyle,
        ]}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          style={{
            padding: 10,
            borderRadius: 15,
            // elevation: 4,s
          }}>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
      <Animated.View
        style={[
          {
            flex: 1,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,

            elevation: 6,
          },
          animatedStyle,
        ]}>
        {/* Close Button */}
        <VendorBottomTabStack />
      </Animated.View>
    </View>
  );
}

function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: {
          width: 315,
          elevation: 0,
          shadowColor: 'transparent',
          backgroundColor: '#fff',
        },
        sceneContainerStyle: {backgroundColor: 'transparent'},
      }}>
      <Drawer.Screen name="Dashboard" component={ScreenWithAnimation} />
      <Drawer.Screen name="ChatDetails" component={ChatDetail} />
      <Drawer.Screen name="CreateCustomOffer" component={CreateCustomOffer} />
      <Drawer.Screen name="BookingItems" component={BookingItems} />
    </Drawer.Navigator>
  );
}

export default CustomerDrawer;
