import Api from './index';
import {endPoints, requestType} from '../constants/Variable';

export const getVendorDetails = id => {
  return Api(`${endPoints.vendorDetailsById}/${id}`, null, requestType.GET);
};
