import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const getPayoutOrders = vendorId => {
  return Api(endPoints.payoutOrders(vendorId), null, requestType.GET);
};

export const disburseVendorPayments = (vendorId, payload) => {
  return Api(endPoints.disbursePayments(vendorId), payload, requestType.POST);
};
