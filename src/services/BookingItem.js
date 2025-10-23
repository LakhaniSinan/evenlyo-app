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
