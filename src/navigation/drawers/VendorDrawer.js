import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Import vendor containers (these would be created later)
// import VendorDashboard from '../../containers/vendor/dashboard/VendorDashboard';
// import VendorEvents from '../../containers/vendor/events/VendorEvents';
// import VendorBookings from '../../containers/vendor/bookings/VendorBookings';
// import VendorAnalytics from '../../containers/vendor/analytics/VendorAnalytics';
// import VendorProfile from '../../containers/vendor/profile/VendorProfile';

// Temporary Dashboard Screen
const VendorDashboard = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Vendor Dashboard</Text>
    <Text style={styles.subtitle}>Welcome to your vendor panel!</Text>
  </View>
);

const Stack = createStackNavigator();

const VendorDrawer = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#6C63FF' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={VendorDashboard}
        options={{ title: 'Vendor Dashboard' }}
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
  },
});

export default VendorDrawer;
