import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {useSelector} from 'react-redux';
import AuthStack from './clientStack/AuthStack';
import ClientAppStack from './clientStack/ClientAppStack';
import VendorAppStack from './vendorStack/VendorAppStack';
import VendorDetailStack from './vendorStack/VendorDetailStack';

const AppNavigator = () => {
  const {user} = useSelector(state => state.LoginSlice);
  return (
    <NavigationContainer>
      {/* {!user ? (
        <AuthStack />
      ) : user?.type == 'client' ? (
        <ClientAppStack />
        ) : user?.type == 'vendor' && user?.vendorDetails !== null ? (
          ) : user?.type == 'vendor' && user?.vendorDetails === null ? (
            <VendorDetailStack />
            ) : (
              <AuthStack />
              )} */}
      <ClientAppStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
