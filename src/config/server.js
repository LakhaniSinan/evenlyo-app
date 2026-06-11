/**
 * REST + Socket.IO MUST point to the same backend (same DB + FCM tokens).
 *
 * Production example:
 *
 * Local dev tunnel (update host when tunnel URL changes):
 */
// export const API_BASE_URL =
//     'https://evenlyo-backend-20036df510ad.herokuapp.com/api';
export const API_BASE_URL = 'https://tk4c2l16-4040.euw.devtunnels.ms/api';
// export const API_BASE_URL = 'https://0g01d8wd-4040.inc1.devtunnels.ms/api';

/** Socket.IO root URL (no trailing slash, no /api) */
export const SOCKET_BASE_URL = 'https://tk4c2l16-4040.euw.devtunnels.ms/api';
// export const SOCKET_BASE_URL = 'https://0g01d8wd-4040.inc1.devtunnels.ms'
// export const SOCKET_BASE_URL = 'https://evenlyo-backend-20036df510ad.herokuapp.com'
