import React from 'react';
import {StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {BRAND_BUTTON_GRADIENT_COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const GradientText = ({text, customStyles}) => {
  const {t} = useTranslation();
  const displayText = typeof text === 'string' ? t(text) : text;

  return (
    <MaskedView
      style={styles.maskWrapper}
      maskElement={
        <Text
          style={[styles.text, customStyles, {backgroundColor: 'transparent'}]}>
          {displayText}
        </Text>
      }>
      <LinearGradient
        colors={BRAND_BUTTON_GRADIENT_COLORS}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={[styles.text, customStyles, {opacity: 0}]}>
          {displayText}
        </Text>
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
