import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const registerUser = params => {
  return Api(endPoints.registerOtp, params, requestType.POST);
};
export const register = params => {
  return Api(endPoints.register, params, requestType.POST);
};

export const loginUser = params => {
  return Api(endPoints.login, params, requestType.POST);
};
export const forgotUser = params => {
  return Api(endPoints.forgot, params, requestType.POST);
};
