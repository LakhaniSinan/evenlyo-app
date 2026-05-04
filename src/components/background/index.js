import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SCREEN_BACKGROUND_GRADIENT_COLORS} from '../../constants';

/**
 * Full-screen background gradient. Uses absolute-fill on iOS so the gradient
 * always paints edge-to-edge (stack card + flex quirks were hiding it before).
 */
const Background = ({children, colors}) => {
  const gradientColors = colors?.length
    ? colors
    : SCREEN_BACKGROUND_GRADIENT_COLORS;

  return (
    <View
      style={[styles.root, {backgroundColor: gradientColors[0]}]}
      collapsable={false}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientLayer}
      />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    width: '100%',
  },
});

export default Background;
