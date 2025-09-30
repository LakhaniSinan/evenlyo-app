import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getProfile = () => {
  return Api(endPoints.profile, null, requestType.GET);
};
export const updateProfile = parmas => {
  return Api(endPoints.profile, parmas, requestType.PUT);
};
