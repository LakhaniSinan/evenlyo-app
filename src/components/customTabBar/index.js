// components/CustomTabBar.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets(); // <- read device bottom inset

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, 10), // ensure visible above navbar
            height: 60 + insets.bottom,                 // grow bar to include inset
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity key={route.key} style={styles.tab} onPress={() => navigation.navigate(route.name)}>
              <Icon name="home" size={28} color={isFocused ? '#E91E63' : '#B0B0B0'} />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
