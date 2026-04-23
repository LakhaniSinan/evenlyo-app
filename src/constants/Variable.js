export const notifications = {};
export const requestType = {
  POST: 'post',
  GET: 'get',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
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
  loginVendor: '/auth/vendor/login',
  loginUser: '/auth/client/login',
  register: '/auth/client/register',
  vendorRegister: '/auth/vendor/register',
  registerOtp: '/auth/send-otp',
  forgot: '/auth/send-forgot-otp',
  verifyForgot: '/auth/verify-forgot-otp',
  reset: '/auth/reset-password',
  socialLogin: '/auth/google',

  //Profile
  profile: '/settings/personal-info',
  categories: '/categories',
  subcategories: '/subcategories/category',
  profilePicture: '/settings/profile-picture',
  vendorsCategories: '/vendor/profile/get-main-category',
  changePassword: '/settings/change-password',
  updateDeliveryFee: '/vendor/profile/update-delivery-charges',
  notificationSetup: '/settings/notifications',

  //Listings
  listings: '/listings',
  vendorListings: '/listings/vendor',
  createBooking: '/booking/request',
  populorItems: '/listings/popular?limit',
  bookingItems: '/listings?categoryId',
  listingsHome: '/listings/homeData',
  vendorDetails: '/vendors',
  vendor: '/vendor/bycategory',
  vendorDetailsById: '/vendor/details',
  booking: '/booking',
  bookingHistory: '/booking/history?status=',
  saleItemHistory: '/sale-item-history',
  addListingToCart: '/cart/add',
  updateCart: '/cart/update',
  addListingToggelCart: '/cart/wishlist',
  removeListingToCart: '/cart/remove',
  getCartListings: '/cart',
  accepetedBookings: '/booking/accepted',
  createSaleItem: '/vendor/items/create',
  updateSaleItem: '/vendor/items/update',
  getSaleItem: '/vendor/items/overview',
  deleteSaleItem: '/vendor/items/delete',
  listingsItems: '/vendor/listings/overview',
  updateOrderStatus: '/update-order-status',
  saveBooking: '/vendor/bookings/on-payment-success',
  searchSubCategories: '/listings/search/subcategories',
  filterListings: '/vendor/listings/listings/filter',

  //Notifications
  notifications: '/notifications',
  vendorNotifications: '/notifications/vendor-notifications',

  //Vendors APIS
  //Dashboard

  updateVendor: '/vendor/profile/update',
  getVendor: '/vendor/profile',

  dashboard: '/vendor/dashboard/analytics',

  //Booking Actions
  rejectBooking: '/vendor/bookings',
  acceptBooking: '/vendor/bookings',
  update: '/vendor/tracking',
  bookingByStatus: '/booking/request-by-status',

  //Analytics
  bookingAnalytics: '/vendor/bookings/analytics',
  analyticsReport: '/vendor/earnings/service/analytics',
  bookingAnalyticsReport: '/vendor/earnings/analytics',
  orderHistory: '/vendor-order-history',
  vendorBookingDetails: '/booking',

  //subCategories by category Ids
  subCategoriesByCategoryIds: '/vendor/profile/get-sub-category-by-categoryIds',

  //CHAT VENDOR CLIENT AND ADMIN
  checkIsChatedBefore: '/conversations/single',
  createConversation: '/conversations',
  //Vendor Listing
  updateStatus: '/vendor/listings',
  updateListing: '/vendor/listings/update',
  createListing: '/vendor/listings/create',
  deleteListing: '/vendor/listings/delete',

  //FAQs
  faqs: '/faqs',

  //Payment
  createPaymentIntent: '/vendor/bookings/create-payment-intent',
  amountToPay: '/vendor/bookings/amount-to-pay',
  buySaleItem: '/sale-item-purchase',

  // Vendor Stripe Connect
  vendorStripeConnect: '/auth/vendor/stripe/connect',
  vendorStripeOnboardingLink: '/auth/vendor/stripe/onboarding-link',
  vendorStripeOnboardingStatus: '/auth/vendor/stripe/onboarding-status',
  payoutOrders: vendorId => `/admin/payments/${vendorId}/payout-orders`,
  disbursePayments: vendorId => `/admin/payments/${vendorId}/disburse-payments`,

  messages: {
    all: (id, userId) => `/messages/${id}/${userId}`,
    delete: (conversationId, userId) => `/messages/${conversationId}/${userId}`,
  },
  conversations: {
    create: '/conversations',
    all: (id, type) => `/conversations/${id}/${type}`,
    single: (userId, vendorId) => `/conversations/single/${userId}/${vendorId}`,
    block: id => `/conversations/block/${id}`,
    unblock: id => `/conversations/unblock/${id}`,
    report: id => `/conversations/report/${id}`,
  },
};
