import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {COLORS} from '../../constants';

const Loader = ({isLoading, showContent}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
});
