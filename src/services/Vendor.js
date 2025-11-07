import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getVendorDetails = id => {
  return Api(`${endPoints.vendorDetailsById}/${id}`, null, requestType.GET);
};

export const updateVendorDetails = params => {
  return Api(endPoints.updateVendor, params, requestType.PUT);
};

export const updateVendorListing = (id, params) => {
  return Api(`${endPoints.updateListing}/${id}`, params, requestType.PUT);
};

export const createVendorLosting = params => {
  return Api(endPoints.createListing, params, requestType.POST);
};
export const deleteVendorListing = id => {
  return Api(`${endPoints.deleteListing}/${id}`, null, requestType.DELETE);
};
