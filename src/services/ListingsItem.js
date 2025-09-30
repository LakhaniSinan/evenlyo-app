import Api from './index';
import {endPoints, requestType} from '../constants/Variable';

export const getPopulorItems = limit => {
  return Api(`${endPoints.populorItems}=${limit}`, null, requestType.GET);
};
