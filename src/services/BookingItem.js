import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const rejectBooking = (bookinID, params) => {
  return Api(
    `${endPoints.rejectBooking}/${bookinID}/reject`,
    params,
    requestType.POST,
  );
};
export const getBookingDetails = bookinID => {
  return Api(`${endPoints.booking}/${bookinID}`, null, requestType.GET);
};
export const cancelBooking = (bookinID, params) => {
  return Api(
    `${endPoints.booking}/${bookinID}/cancel`,
    params,
    requestType.POST,
  );
};
export const acceptBooking = bookinID => {
  return Api(
    `${endPoints.acceptBooking}/${bookinID}/accept`,
    null,
    requestType.POST,
  );
};

export const getBookingAnalytics = () => {
  return Api(endPoints.bookingAnalytics, null, requestType.GET);
};
export const vendorOrderHistory = () => {
  return Api(endPoints.orderHistory, null, requestType.GET);
};

export const getBookingByStatus = params => {
  return Api(endPoints.bookingByStatus, params, requestType.POST);
};
