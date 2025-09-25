export const requestType = {
  POST: 'post',
  GET: 'get',
  PUT: 'put',
  DELETE: 'delete',
};

export const endPoints = {
  //Authentication
  login: '/auth/client/login',
  register: '/auth/client/register',
  registerOtp: '/auth/send-otp',
  forgot: '/auth/send-forgot-otp',

  //Profile
  profile: '/settings/personal-info',
  categories: '/categories',
  subcategories: '/subcategories/category',
};
