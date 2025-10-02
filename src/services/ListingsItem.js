import Api from './index';
import {endPoints, requestType} from '../constants/Variable';

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
