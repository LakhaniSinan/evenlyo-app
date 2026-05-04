import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { width } from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../constants';
import GradientText from '../gradiantText';

const OUTLINE_RING_PX = 2;
const OUTLINE_OUTER_RADIUS = width(4);
const OUTLINE_INNER_RADIUS = Math.max(0, OUTLINE_OUTER_RADIUS - OUTLINE_RING_PX);

const GradientButton = ({
  text,
  onPress,
  type = 'filled',
  gradientColors = BRAND_BUTTON_GRADIENT_COLORS,
  icon,
  styleProps,
  outlineButtonStyle,
  iconTintColor,
  useGradient,
  textStyle,
  styleContainer,
}) => {
  const threeStopLocations =
    gradientColors.length === 3 ? BRAND_BUTTON_GRADIENT_LOCATIONS : undefined;

  if (type === 'filled') {
    return (
      <LinearGradient
        colors={gradientColors}
        locations={threeStopLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientContainer, styleContainer]}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[styles.buttonBase, styleProps]}>
          {icon && (
            <Image
              tintColor={iconTintColor ? iconTintColor : null}
              source={icon}
              style={{ width: 19, height: 19, marginRight: width(2) }}
            />
          )}
          {React.isValidElement(text) ? (
            text
          ) : useGradient ? (
            <GradientText text={text} customStyles={textStyle} />
          ) : (
            <Text style={textStyle ? textStyle : styles.filledText}>{text}</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // iOS: padding + child width:100% on LinearGradient often draws a wrong left stripe;
  // absolute-fill gradient + inner margin gives an even ring (same look as Android).
  return (
    <View style={[styles.outlineOuter, styleContainer]}>
      <LinearGradient
        colors={gradientColors}
        locations={threeStopLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.outlineButton,
          {
            margin: OUTLINE_RING_PX,
            borderRadius: OUTLINE_INNER_RADIUS,
          },
          outlineButtonStyle,
          styleProps,
        ]}>
        {icon && (
          <Image
            source={icon}
            style={{ width: 19, height: 19 }}
            resizeMode="contain"
          />
        )}
        {React.isValidElement(text) ? (
          text
        ) : useGradient ? (
          <GradientText text={text} customStyles={textStyle} />
        ) : (
          <Text
            style={[
              {
                color: COLORS.black,
                fontSize: 13,
                fontFamily: fontFamly.PlusJakartaSansBold,
              },
              textStyle,
            ]}>
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
    height: width(11)
  },
  buttonBase: {
    paddingVertical: width(3),
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  filledText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  outlineOuter: {
    borderRadius: OUTLINE_OUTER_RADIUS,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
  },
  outlineButton: {
    backgroundColor: '#fff',
    paddingVertical: width(3),
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  outlineText: {
    fontWeight: '600',
    fontSize: 16,
    color: COLORS.text,
  },
});

export default GradientButton;
