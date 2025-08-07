import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../constants';
import { storageService } from '../storage';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_ENDPOINTS.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response.data;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          // Redirect to login or refresh token logic
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Generic API methods
  async get(url, params) {
    return this.api.get(url, { params });
  }

  async post(url, data) {
    return this.api.post(url, data);
  }

  async put(url, data) {
    return this.api.put(url, data);
  }

  async patch(url, data) {
    return this.api.patch(url, data);
  }

  async delete(url) {
    return this.api.delete(url);
  }
}

export const apiService = new ApiService();

// Event service
export const eventService = {
  getEvents: (filters) => apiService.get(API_ENDPOINTS.EVENTS.LIST, filters),
  getEvent: (id) => apiService.get(`${API_ENDPOINTS.EVENTS.LIST}/${id}`),
  createEvent: (data) => apiService.post(API_ENDPOINTS.EVENTS.CREATE, data),
  updateEvent: (id, data) => apiService.put(`${API_ENDPOINTS.EVENTS.UPDATE}/${id}`, data),
  deleteEvent: (id) => apiService.delete(`${API_ENDPOINTS.EVENTS.DELETE}/${id}`),
};

// Booking service
export const bookingService = {
  getBookings: () => apiService.get(API_ENDPOINTS.BOOKINGS.LIST),
  getBooking: (id) => apiService.get(`${API_ENDPOINTS.BOOKINGS.LIST}/${id}`),
  createBooking: (data) => apiService.post(API_ENDPOINTS.BOOKINGS.CREATE, data),
  updateBookingStatus: (id, status) => 
    apiService.patch(`${API_ENDPOINTS.BOOKINGS.UPDATE}/${id}`, { status }),
  cancelBooking: (id) => 
    apiService.patch(`${API_ENDPOINTS.BOOKINGS.CANCEL}/${id}`, { status: 'cancelled' }),
};

// User service
export const userService = {
  getProfile: () => apiService.get(API_ENDPOINTS.USERS.PROFILE),
  updateProfile: (data) => apiService.put(API_ENDPOINTS.USERS.UPDATE, data),
};