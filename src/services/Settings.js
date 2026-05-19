import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getProfile = () => {
  return Api(endPoints.profile, null, requestType.GET);
};
export const updateProfile = parmas => {
  return Api(endPoints.profile, parmas, requestType.PUT);
};
export const handleChangePassword = parmas => {
  return Api(endPoints.changePassword, parmas, requestType.PUT);
};
export const updateDeliveryFee = parmas => {
  return Api(endPoints.updateDeliveryFee, parmas, requestType.PUT);
};
export const udpateNotificationsSetup = parmas => {
  return Api(endPoints.notificationSetup, parmas, requestType.PUT);
};
export const getNotificationsSetup = parmas => {
  return Api(endPoints.notificationSetup, parmas, requestType.GET);
};
export const getSettings = () => {
  return Api(endPoints.settings, null, requestType.GET);
};