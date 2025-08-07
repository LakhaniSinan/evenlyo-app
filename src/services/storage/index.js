import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing item with key ${key}:`, error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key ${key}:`, error);
      throw error;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs) {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  async multiGet(keys) {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  }

  async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();