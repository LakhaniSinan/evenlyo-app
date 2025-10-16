export const requestType = {
  POST: 'post',
  GET: 'get',
  PUT: 'put',
  DELETE: 'delete',
};

export const apiHeaders = {
  contentType: 'Content-Type',
  application_json: 'application/json',
  multipart_data: 'multipart/form-data',
  language: 'LANG',
  authorization: 'Authorization',
};

export const endPoints = {
  //Authentication
  login: '/auth/client/login',
  loginVendor: '/auth/vendor/login',
  register: '/auth/client/register',
  registerOtp: '/auth/send-otp',
  forgot: '/auth/send-forgot-otp',
  verifyForgot: '/auth/verify-forgot-otp',
  reset: '/auth/reset-password',

  //Profile
  profile: '/settings/personal-info',
  categories: '/categories',
  subcategories: '/subcategories/category',
  profilePicture: '/settings/profile-picture',

  //Listings
  listings: '/listings',
  createBooking: '/booking/request',
  populorItems: '/listings/popular?limit',
  bookingItems: '/listings?categoryId',
  listingsHome: '/listings/home?categoryId=',
  vendorDetails: '/vendors',
  vendor: '/vendor/bycategory',
  vendorDetailsById: '/vendor/details',
  booking: '/bookings',
  bookingHistory: '/booking/history?status=',
  addListingToCart: '/cart/add',
  removeListingToCart: '/cart/remove',
  getCartListings: '/cart',

  //Notifications
  notifications: '/notifications',
};
