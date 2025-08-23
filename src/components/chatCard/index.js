import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {width} from 'react-native-dimension';

const ChatCard = ({
  style,
  children,
  gradientColors = ['#FF295D', '#E31B95', '#C817AE'],
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={[styles.chatCard, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  chatCard: {
    padding: width(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChatCard;
