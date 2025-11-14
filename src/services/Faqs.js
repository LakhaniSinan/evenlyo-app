import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getFaqs = () => {
  return Api(endPoints.faqs, null, requestType.GET);
};
