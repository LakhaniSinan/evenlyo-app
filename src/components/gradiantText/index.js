import React from 'react';
import {StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {BRAND_BUTTON_GRADIENT_COLORS, fontFamly} from '../../constants';

const GradientText = ({text, customStyles}) => {
  return (
    <MaskedView
      style={styles.maskWrapper}
      maskElement={
        <Text
          style={[styles.text, customStyles, {backgroundColor: 'transparent'}]}>
          {text}
        </Text>
      }>
      <LinearGradient
        colors={BRAND_BUTTON_GRADIENT_COLORS}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={[styles.text, customStyles, {opacity: 0}]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  maskWrapper: {
    flexShrink: 0,
    alignSelf: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

export default GradientText;
