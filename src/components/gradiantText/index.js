import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {fontFamly} from '../../constants';

const GradientText = ({text, customStyles}) => {
  return (
    <MaskedView
      maskElement={
        <Text
          style={[styles.text, customStyles, {backgroundColor: 'transparent'}]}>
          {text}
        </Text>
      }>
      <LinearGradient
        colors={['#FF295D', '#E31B95', '#C817AE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={[styles.text, {opacity: 0}]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

export default GradientText;
