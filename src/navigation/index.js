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
  const normalizedUserType = user?.userType?.toLowerCase();
  const isClient = normalizedUserType === 'client';
  const isVendor = normalizedUserType === 'vendor';
  const isVendorRoleUser = Array.isArray(user?.pages);
  const shouldOpenVendorDetails = isVendor && user?.vendorDetails == null && !isVendorRoleUser;

  useEffect(() => {
    user && fetchProfile();
  }, []);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : isClient ? (
        <ClientAppStack />
      ) : shouldOpenVendorDetails ? (
        <VendorDetailStack />
      ) : isVendor || isVendorRoleUser ? (
        <VendorAppStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
