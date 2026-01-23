import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getAnalyticsReport = () => {
  return Api(endPoints.analyticsReport, null, requestType.GET);
};

export const getBookingAnalytic = () => {
  return Api(endPoints.bookingAnalyticsReport, null, requestType.GET);
};
