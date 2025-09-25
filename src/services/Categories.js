import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getCategories = () => {
  return Api(endPoints.categories, null, requestType.GET);
};
export const getSubCategories = id => {
  return Api(`${endPoints.subcategories}/${id}`, null, requestType.GET);
};
