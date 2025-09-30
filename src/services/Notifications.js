import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getNotifications = () => {
  return Api(endPoints.notifications, null, requestType.GET);
};
