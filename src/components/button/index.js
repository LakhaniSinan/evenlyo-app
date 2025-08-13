import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {fontFamly} from '../../constants';
import GradientText from '../gradiantText';

const GradientButton = ({
  text,
  onPress,
  type = 'filled',
  gradientColors = ['#FF295D', '#E31B95', '#C817AE'],
  icon,
  styleProps,
  outlineButtonStyle,
  useGradient,
  textStyle,
}) => {
  if (type === 'filled') {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientContainer}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[styles.buttonBase, {...styleProps}]}>
          {icon && <Image source={icon} style={{width: 24, height: 24}} />}
          <Text style={textStyle ? textStyle : styles.filledText}>{text}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.outlineBorder, {...outlineButtonStyle}]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.outlineButton, {...outlineButtonStyle}]}>
        {icon && (
          <Image
            source={icon}
            style={{width: 19, height: 19}}
            resizeMode="contain"
          />
        )}
        {useGradient ? (
          <GradientText text={text} />
        ) : (
          <Text
            style={{
              fontSize: 13,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 3,
  },
  buttonBase: {
    paddingVertical: width(3),
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  outlineBorder: {
    borderRadius: width(4),
    padding: 2,
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderRadius: width(3.5),
    paddingVertical: width(3),
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  outlineText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333333',
  },
});

export default GradientButton;
