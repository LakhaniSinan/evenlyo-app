import React, { useRef, useEffect } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const WaveAnimation = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  // Wave ke liye translateX create karenge
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200], // jitna shift karna hai wave ko
  });

  return (
    <View style={styles.container}>
      <View style={styles.waveWrapper}>
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ translateX }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            {
              position: "absolute",
              top: 0,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", // sky color
    justifyContent: "flex-end",
  },
  waveWrapper: {
    height: 100,
    overflow: "hidden",
  },
  wave: {
    width: 400, // bada rakho taake translateX smooth ho
    height: 100,
    backgroundColor: "#1E90FF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    opacity: 0.8,
  },
});

export default WaveAnimation;
