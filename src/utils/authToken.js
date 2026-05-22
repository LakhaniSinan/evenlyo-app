import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredToken = async () => {
  const raw = await AsyncStorage.getItem('token');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export const requireAuth = async onUnauthenticated => {
  const token = await getStoredToken();
  if (!token) {
    onUnauthenticated?.();
    return false;
  }
  return token;
};
