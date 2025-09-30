import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const updateProfilePicture = params => {
  return Api(endPoints.profile, params, requestType.PUT);
};
