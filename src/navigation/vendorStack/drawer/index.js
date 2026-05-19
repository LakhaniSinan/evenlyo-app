import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';
import VendorBottomTabStack from '../BottomTabStack';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
} from '../../../constants';
import CustomDrawer from './CustomDrawer';
import ChatDetail from '../../../containers/vendor/app/ChatDetails';
import CreateCustomOffer from '../../../containers/vendor/app/CreateCustomOffre';
import BookingItems from '../../../containers/vendor/app/BookingItems';
import OfferPreviewScreen from '../../../containers/vendor/app/OfferPreviewScreen';
import VendorStripeConnectScreen from '../../../containers/vendor/app/VendorStripeConnectScreen';
import VendorPaymentManagementScreen from '../../../containers/vendor/app/VendorPaymentManagementScreen';
import VendorRoleManagementScreen from '../../../containers/vendor/app/VendorRoleManagementScreen';
import CreateVendorDesignationScreen from '../../../containers/vendor/app/CreateVendorDesignationScreen';
import CreateVendorRoleScreen from '../../../containers/vendor/app/CreateVendorRoleScreen';

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
        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          activeOpacity={0.8}
          style={styles.closeButton}>
          <LinearGradient
            colors={BRAND_BUTTON_GRADIENT_COLORS}
            locations={BRAND_BUTTON_GRADIENT_LOCATIONS}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={StyleSheet.absoluteFillObject}
          />
          <Icon name="close" size={24} color="#FFF" />
        </TouchableOpacity>
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
      <Drawer.Screen name="OfferPreview" component={OfferPreviewScreen} />
      <Drawer.Screen
        name="VendorStripeConnect"
        component={VendorStripeConnectScreen}
      />
      <Drawer.Screen
        name="VendorPaymentManagement"
        component={VendorPaymentManagementScreen}
      />
      <Drawer.Screen
        name="VendorRoleManagement"
        component={VendorRoleManagementScreen}
      />
      <Drawer.Screen
        name="CreateVendorDesignation"
        component={CreateVendorDesignationScreen}
      />
      <Drawer.Screen
        name="CreateVendorRole"
        component={CreateVendorRoleScreen}
      />
    </Drawer.Navigator>
  );
}

export default CustomerDrawer;

const styles = StyleSheet.create({
  closeButton: {
    padding: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
});
