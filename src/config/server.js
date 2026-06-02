/**
 * REST + Socket.IO MUST point to the same backend (same DB + FCM tokens).
 *
 * Production example:
 *   export const API_BASE_URL = 'https://evenlyo-backend-20036df510ad.herokuapp.com/api';
 *
 * Local dev tunnel (update host when tunnel URL changes):
 */
export const API_BASE_URL =
  'https://tk4c2l16-4040.euw.devtunnels.ms/api';

/** Socket.IO root URL (no trailing slash, no /api) */
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
