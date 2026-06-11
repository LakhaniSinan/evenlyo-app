import {endPoints, requestType} from '../constants/Variable';
import Api from './index';

export const checkIsChatedBefore = (clientId, vendorId) => {
  return Api(
    `${endPoints.checkIsChatedBefore}/${clientId}/${vendorId}`,
    null,
    requestType.GET,
  );
};
export const createConnection = params => {
  return Api(endPoints.createConversation, params, requestType.POST);
};

export const messageService = {
  getAllMessages: async (id, userId, preferredLanguage = 'en') => {
    const lang = preferredLanguage === 'nl' ? 'nl' : 'en';
    const response = await Api(
      `${endPoints.messages.all(id, userId)}?preferredLanguage=${lang}`,
      null,
      requestType.GET,
    );
    return response.data;
  },

  deleteMessage: async (conversationId, userId) => {
    const response = await Api(
      endPoints.messages.delete(conversationId, userId),
      null,
      requestType.DELETE,
    );
    return response.data;
  },
};

export const conversationService = {
  fetchAllConversations: async (id, type) => {
    const response = await Api(
      endPoints.conversations.all(id, type),
      null,
      requestType.GET,
    );
    return response.data;
  },

  blockConversation: async (id, payload) => {
    const response = await Api(
      endPoints.conversations.block(id),
      payload,
      requestType.PATCH,
    );
    return response.data;
  },

  unblockConversation: async id => {
    const response = await Api(
      endPoints.conversations.unblock(id),
      null,
      requestType.PATCH,
    );
    return response.data;
  },

  reportConversation: async (id, payload) => {
    const response = await Api(
      endPoints.conversations.report(id),
      payload,
      requestType.PATCH,
    );
    return response.data;
  },
};
