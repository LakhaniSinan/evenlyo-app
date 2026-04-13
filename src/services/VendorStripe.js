import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const vendorStripeConnect = () => {
  return Api(endPoints.vendorStripeConnect, {}, requestType.POST);
};

export const vendorStripeOnboardingLink = () => {
  return Api(endPoints.vendorStripeOnboardingLink, {}, requestType.GET);
};

export const vendorStripeOnboardingStatus = () => {
  return Api(endPoints.vendorStripeOnboardingStatus, null, requestType.GET);
};
