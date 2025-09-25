import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import useProfile from '../hooks/getProfileData';
import AuthStack from './clientStack/AuthStack';
import ClientAppStack from './clientStack/ClientAppStack';
import VendorAppStack from './vendorStack/VendorAppStack';
import VendorDetailStack from './vendorStack/VendorDetailStack';

const AppNavigator = () => {
  const {user} = useSelector(state => state.LoginSlice);
  const {fetchProfile} = useProfile();

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user?.userType == 'client' ? (
        <ClientAppStack />
      ) : user?.userType == 'vendor' && user?.vendorDetails !== null ? (
        <VendorAppStack />
      ) : user?.userType == 'vendor' && user?.vendorDetails === null ? (
        <VendorDetailStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
