import Api from './index';
import {endPoints, requestType} from '../constants/Variable';

export const getDashboard = () => {
  return Api(endPoints.dashboard, null, requestType.GET);
};
