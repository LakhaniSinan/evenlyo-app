import api from '.';
import {endPoints, requestType} from '../constants/Variable';

export const createPaymentIntent = params => {
  return api(endPoints.createPaymentIntent, params, requestType.POST);
};
export const buySaleItem = params => {
  return api(endPoints.buySaleItem, params, requestType.POST);
};
