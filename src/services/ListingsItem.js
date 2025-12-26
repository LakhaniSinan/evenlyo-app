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

export const getAllListingData = () => {
  return Api(endPoints.listings, null, requestType.GET);
};

export const getVendorListingsById = vendorId => {
  return Api(`${endPoints.vendorListings}/${vendorId}`, null, requestType.GET);
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
export const handleUpdateOrderStatus = (Id, params) => {
  return Api(`${endPoints.updateOrderStatus}/${Id}`, params, requestType.POST);
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
export const getAllSaleItems = () => {
  return Api(endPoints.saleItemHistory, null, requestType.GET);
};

export const listingAddToCart = params => {
  return Api(endPoints.addListingToCart, params, requestType.POST);
};

export const getCartListings = () => {
  return Api(endPoints.getCartListings, null, requestType.GET);
};

export const listingRemoveFromCart = id => {
  return Api(
    `${endPoints.removeListingToCart}/${id}`,
    null,
    requestType.DELETE,
  );
};

export const getAccepetedBookings = () => {
  return Api(endPoints.accepetedBookings, null, requestType.GET);
};

export const createSaleItem = params => {
  return Api(endPoints.createSaleItem, params, requestType.POST);
};

export const updateSaleItem = (id, params) => {
  return Api(`${endPoints.updateSaleItem}/${id}`, params, requestType.PUT);
};

export const deleteSaleItem = id => {
  return Api(`${endPoints.deleteSaleItem}/${id}`, null, requestType.DELETE);
};

export const getVendorListings = params => {
  return Api(endPoints.getSaleItem, params, requestType.GET);
};

export const getVendorBookingListings = () => {
  return Api(endPoints.listingsItems, null, requestType.GET);
};

export const toggleStatus = (id, params) => {
  return Api(
    `${endPoints.updateStatus}/${id}/toggle-status`,
    params,
    requestType.PATCH,
  );
};
