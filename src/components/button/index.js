import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {fontFamly} from '../../constants';
import GradientText from '../gradiantText';

const GradientButton = ({
  text,
  onPress,
  type = 'filled',
  gradientColors = ['#F6F6F6', '#F6F6F6'],
  icon,
  styleProps,
  useGradient,
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
          style={styles.buttonBase}>
          {icon}
          <Text style={styles.filledText}>{text}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Outline button
  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.outlineBorder}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.outlineButton, styleProps]}>
        {icon && (
          <Image
            source={icon}
            style={{width: 24, height: 24}}
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
    marginBottom: 10,
  },
  buttonBase: {
    paddingVertical: 14,
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
    borderRadius: 20,
    padding: 2,
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
  },
  outlineText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333333',
  },
});

export default GradientButton;
