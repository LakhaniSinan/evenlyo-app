import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Background = ({ children, colors }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#FDE3F0', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}>
        {children}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#d11ca0',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 60,
  },
  clientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
    alignItems: 'center',
  },
  clientText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  vendorButton: {
    borderWidth: 1,
    borderColor: '#d11ca0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  vendorText: {
    color: '#d11ca0',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Background;
