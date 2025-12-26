import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const registerUser = params => {
  return Api(endPoints.registerOtp, params, requestType.POST);
};
export const register = params => {
  return Api(endPoints.register, params, requestType.POST);
};
export const vendorRegister = params => {
  return Api(endPoints.vendorRegister, params, requestType.POST);
};

export const loginVendor = params => {
  return Api(endPoints.loginVendor, params, requestType.POST);
};
export const loginClient = params => {
  return Api(endPoints.loginUser, params, requestType.POST);
};

export const forgotUser = params => {
  return Api(endPoints.forgot, params, requestType.POST);
};
export const verifyForgotOtp = params => {
  return Api(endPoints.verifyForgot, params, requestType.POST);
};
export const resetPassword = params => {
  return Api(endPoints.reset, params, requestType.POST);
};
export const socialLogin = params => {
  return Api(endPoints.socialLogin, params, requestType.POST);
};
