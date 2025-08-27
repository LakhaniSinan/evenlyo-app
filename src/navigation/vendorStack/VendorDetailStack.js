import {
  createStackNavigator,
  HeaderStyleInterpolators,
  TransitionSpecs,
} from '@react-navigation/stack';
import React from 'react';
import OtpVerifySuccess from '../../containers/vendor/vendorDetails/OtpVerifySuccess';
import VendorOtpVerifications from '../../containers/vendor/vendorDetails/vendorOtpVerification';
import VendorPersonalDetails from '../../containers/vendor/vendorDetails/VendroPersonalDetails';

const Stack = createStackNavigator();
export const MyTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  headerStyleInterpolator: HeaderStyleInterpolators.forFade,
  cardStyleInterpolator: ({current, next, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

const VendorDetailStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="VendorPersonalDetails"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
        ...MyTransition,
      }}>
      <Stack.Screen
        name="VendorPersonalDetails"
        component={VendorPersonalDetails}
      />
      <Stack.Screen
        name="VendorOtpVerifications"
        component={VendorOtpVerifications}
      />
      <Stack.Screen name="OtpVerifySuccess" component={OtpVerifySuccess} />
    </Stack.Navigator>
  );
};

export default VendorDetailStack;
