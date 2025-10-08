import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getPopulorItems = limit => {
  return Api(`${endPoints.populorItems}=${limit}`, null, requestType.GET);
};
export const getBookingItems = (catID, subCatId) => {
  return Api(
    `${endPoints.bookingItems}=${catID}&subCategoryId=${subCatId}`,
    null,
    requestType.GET,
  );
};
export const getHomeData = (catID, subCatId) => {
  return Api(
    `${endPoints.listingsHome}${catID}&subcategoryId=${subCatId}`,
    null,
    requestType.GET,
  );
};
export const getVendorsBySubCategory = subCatId => {
  return Api(
    `${endPoints.vendor}?subcategory=${subCatId}`,
    null,
    requestType.GET,
  );
};
export const getBookingDetails = Id => {
  return Api(`${endPoints.listings}/${Id}`, null, requestType.GET);
};
export const sendBookingRequest = params => {
  return Api(endPoints.createBooking, params, requestType.POST);
};
export const getAllBookingHistory = (status, page, limit) => {
  return Api(
    `${endPoints.bookingHistory}${status}&page=${page}&limit=${limit}`,
    null,
    requestType.GET,
  );
};
