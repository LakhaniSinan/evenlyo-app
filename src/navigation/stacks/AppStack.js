import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth containers
import {
    LoginScreen,
    RegisterScreen,
    ForgotPasswordScreen,
    Onboarding,
} from '../../containers/auth';
import Home from '../../containers/client/app/Home';

const Stack = createStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FFFFFF' },
            }}>
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
};

export default AppStack;
