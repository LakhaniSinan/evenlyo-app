// App constants
export const COLORS = {
  primary: '#E31B95',
  secondary: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FFE66D',
  error: '#FF6B6B',
  text: '#000000',
  textLight: '#718096',
  background: '#FFFFFF',
  backgroundLight: '#F7FAFC',
  border: '#E2E8F0',
  white: '#FFFFFF',
  black: '#000000',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.evenlyo.com',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    UPDATE: '/events',
    DELETE: '/events',
  },
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: '/bookings',
    CANCEL: '/bookings',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@evenlyo_auth_token',
  REFRESH_TOKEN: '@evenlyo_refresh_token',
  USER_DATA: '@evenlyo_user_data',
  USER_ROLE: '@evenlyo_user_role',
};

export const EVENT_CATEGORIES = [
  'Wedding',
  'Corporate',
  'Birthday',
  'Conference',
  'Workshop',
  'Party',
  'Festival',
  'Concert',
  'Exhibition',
  'Sports',
  'Other',
];
