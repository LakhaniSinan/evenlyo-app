import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import auth containers
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  Onboarding,
} from '../../containers/auth';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
