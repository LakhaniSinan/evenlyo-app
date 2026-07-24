import {
  createStackNavigator,
  HeaderStyleInterpolators,
  TransitionSpecs,
} from '@react-navigation/stack';
import React from 'react';
import {
  ForgotPasswordScreen,
  LoginScreen,
  Onboarding,
  RegisterScreen,
} from '../../containers/auth';
import AuthSuccess from '../../containers/auth/AuthSuccess';
import ForgotPasswordOtpScreen from '../../containers/auth/ForgotPasswordOtpScreen';
import RegistrationOtp from '../../containers/auth/RegistrationOtp';
import ResetPasswordScreen from '../../containers/auth/ResetPasswordScreen';
import VendorDetailStack from '../vendorStack/VendorDetailStack';

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

const AuthStack = ({authFlow}) => {
  return (
    <Stack.Navigator
      initialRouteName={authFlow === 'vendorLogin' ? 'Login' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        // Let each screen (e.g. Background + LinearGradient) own the color; white card hid iOS gradients.
        cardStyle: {backgroundColor: 'transparent'},
        ...MyTransition,
      }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={{
          type: authFlow === 'vendorLogin' ? 'vendor' : 'client',
        }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="ForgotPasswordOtpScreen"
        component={ForgotPasswordOtpScreen}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <Stack.Screen name="AuthSuccess" component={AuthSuccess} />
      <Stack.Screen name="RegistrationOtp" component={RegistrationOtp} />
      <Stack.Screen name="VendorDetailStack" component={VendorDetailStack} />
    </Stack.Navigator>
  );
};

export default AuthStack;
