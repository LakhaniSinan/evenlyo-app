import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getNotifications = () => {
  return Api(endPoints.notifications, null, requestType.GET);
};

export const getVendorNotifications = () => {
  return Api(endPoints.vendorNotifications, null, requestType.GET);
};

export const markVendorNotificationAsRead = notificationId => {
  return Api(
    endPoints.markVendorNotificationRead(notificationId),
    null,
    requestType.PATCH,
  );
};

export const markClientNotificationAsRead = notificationId => {
  return Api(
    endPoints.markClientNotificationRead(notificationId),
    null,
    requestType.PATCH,
  );
};
