import { NavigationContainer } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import useProfile from '../hooks/getProfileData';
import AuthStack from './clientStack/AuthStack';
import ClientAppStack from './clientStack/ClientAppStack';
import VendorAppStack from './vendorStack/VendorAppStack';
import VendorDetailStack from './vendorStack/VendorDetailStack';
import UpdatePopUp from '../components/updatePopup';
import { getSettings } from '../services/Settings';

const AppNavigator = () => {
  const { user } = useSelector(state => state.LoginSlice);
  const { fetchProfile } = useProfile();
  const normalizedUserType = user?.userType?.toLowerCase();
  const isClient = normalizedUserType === 'client';
  const isVendor = normalizedUserType === 'vendor';
  const isVendorRoleUser = Array.isArray(user?.pages);
  const shouldOpenVendorDetails = isVendor && user?.vendorDetails == null && !isVendorRoleUser;
  const updateVar = useRef(null);

  const checkAppVersion = useCallback(apiRes => {
    if (!apiRes) {
      return;
    }

    const buildNumber = DeviceInfo.getBuildNumber();

    if (Platform.OS === 'android') {
      if (
        Number(buildNumber) !== Number(apiRes.androidVersion) &&
        apiRes.isAndroidPopUpShow
      ) {
        updateVar.current?.isVisible();
      }
    } else if (
      Number(buildNumber) !== Number(apiRes.iosVersion) &&
      apiRes.isIosPopUpShow
    ) {
      setTimeout(() => updateVar.current?.isVisible(), 2000);
    }
  }, []);

  const getAdminSettings = useCallback(async () => {
    try {
      const response = await getSettings();
      const data = response?.data?.data;
      if (response?.status === 200 || response?.status === 201) {
        checkAppVersion(data);
      }
    } catch (error) {
      console.log('Settings error:', error);
    }
  }, [checkAppVersion]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    getAdminSettings();
  }, [user, fetchProfile, getAdminSettings]);

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
      <UpdatePopUp ref={updateVar} />
    </NavigationContainer>
  );
};

export default AppNavigator;
