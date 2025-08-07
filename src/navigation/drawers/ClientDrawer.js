import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Import client containers (these would be created later)
// import ClientHome from '../../containers/client/home/ClientHome';
// import ClientSearch from '../../containers/client/search/ClientSearch';
// import ClientEvents from '../../containers/client/events/ClientEvents';
// import ClientBookings from '../../containers/client/bookings/ClientBookings';
// import ClientProfile from '../../containers/client/profile/ClientProfile';

// Temporary Home Screen
const ClientHome = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Client Home</Text>
    <Text style={styles.subtitle}>Welcome! Browse events and book your favorites!</Text>
  </View>
);

const Stack = createStackNavigator();

const ClientDrawer = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#6C63FF' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={ClientHome}
        options={{ title: 'Event Explorer' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ClientDrawer;
