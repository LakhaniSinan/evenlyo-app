import React from 'react';
import {ActivityIndicator} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { COLORS } from '../../constants';

const Loader = ({isLoading, showContent}) => {
  return (
    <Spinner
      visible={Boolean(isLoading)}
      animation="fade"
      cancelable={false}
      overlayColor="rgba(0,0,0,0.35)"
      customIndicator={
        <ActivityIndicator color={COLORS.primary} size="large" />
      }
      textContent={showContent}
    />
  );
};

export default Loader;
