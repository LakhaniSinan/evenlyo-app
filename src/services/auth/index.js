import { apiService } from '../api';
import { storageService } from '../storage';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../constants';

class AuthService {
  async login(credentials) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Store tokens and user data
      await this.storeAuthData(response);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Store tokens and user data
      await this.storeAuthData(response);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // Call logout endpoint
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      await this.clearAuthData();
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await storageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return null;
      }

      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      // Update stored tokens
      await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      await storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      return response.token;
    } catch (error) {
      // Clear auth data if refresh fails
      await this.clearAuthData();
      return null;
    }
  }

  async getStoredAuthData() {
    try {
      const [token, userData, userRole] = await Promise.all([
        storageService.getItem(STORAGE_KEYS.AUTH_TOKEN),
        storageService.getItem(STORAGE_KEYS.USER_DATA),
        storageService.getItem(STORAGE_KEYS.USER_ROLE),
      ]);

      return {
        token,
        user: userData ? JSON.parse(userData) : null,
        role: userRole,
      };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return { token: null, user: null, role: null };
    }
  }

  async isAuthenticated() {
    const { token } = await this.getStoredAuthData();
    return !!token;
  }

  async storeAuthData(authResponse) {
    await Promise.all([
      storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.token),
      storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken),
      storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user)),
      storageService.setItem(STORAGE_KEYS.USER_ROLE, authResponse.user.role),
    ]);
  }

  async clearAuthData() {
    await Promise.all([
      storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      storageService.removeItem(STORAGE_KEYS.USER_DATA),
      storageService.removeItem(STORAGE_KEYS.USER_ROLE),
    ]);
  }
}

export const authService = new AuthService();