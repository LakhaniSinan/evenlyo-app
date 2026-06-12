import {navigationRef} from '../navigation/navigationRef';
import store from '../redux';
import {setActiveChat} from '../redux/slice/chat';
import {conversationService} from '../services/Chat';

const formatClientParticipants = participantsData => {
  const participants = {};
  participantsData?.forEach(({role, refPath, userId}) => {
    if (refPath === 'Vendor') {
      participants[role === 'vendor' ? 'vendor' : 'user'] = {
        userId: userId?._id,
        name: userId?.businessName,
        photo: userId?.businessLogo || null,
        email: userId?.businessEmail,
        role: 'vendor',
      };
    } else {
      participants.user = {
        userId: userId?._id,
        name: `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim(),
        photo:
          userId?.profileImage ||
          userId?.businessLogo ||
          userId?.photo ||
          null,
        email: userId?.email,
        role: 'user',
      };
    }
  });
  return participants;
};

const formatVendorParticipants = participantsData => {
  const participants = {};
  participantsData?.forEach(({role, refPath, userId}) => {
    const commonData = {
      userId: userId?._id,
      name:
        refPath === 'Vendor'
          ? userId?.businessName
          : `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim(),
      photo:
        userId?.profileImage || userId?.businessLogo || userId?.photo || null,
      email: userId?.email || userId?.businessEmail,
    };

    participants[role === 'vendor' ? 'vendor' : 'user'] = {
      ...commonData,
      role: role === 'vendor' ? 'vendor' : 'user',
    };
  });
  return participants;
};

const matchesConversation = (conversation, conversationId) => {
  if (!conversation || !conversationId) {
    return false;
  }

  return (
    conversation.conversationId === conversationId ||
    String(conversation._id) === String(conversationId)
  );
};

const runWhenNavigationReady = callback => {
  if (navigationRef.isReady()) {
    callback();
    return;
  }

  let attempts = 0;
  const intervalId = setInterval(() => {
    attempts += 1;
    if (navigationRef.isReady()) {
      clearInterval(intervalId);
      callback();
      return;
    }

    if (attempts >= 50) {
      clearInterval(intervalId);
    }
  }, 100);
};

const navigateToBooking = (bookingId, userType) => {
  const normalizedType = String(userType || '').toLowerCase();
  const bookingParams = {_id: String(bookingId)};

  if (normalizedType === 'client') {
    navigationRef.navigate('MainTabs', {
      screen: 'Calendar',
      params: {
        screen: 'BookingDetails',
        params: bookingParams,
      },
    });
    return;
  }

  if (normalizedType === 'vendor') {
    navigationRef.navigate('MainTabs', {
      screen: 'AllBookingStack',
      params: {
        screen: 'BookingDetails',
        params: bookingParams,
      },
    });
  }
};

const resolveChatParams = async (conversationId, user) => {
  const fallbackParams = {conversationId};
  const normalizedType = String(user?.userType || '').toLowerCase();

  try {
    if (normalizedType === 'client' && user?.id) {
      const response = await conversationService.fetchAllConversations(
        user.id,
        'user',
      );
      const match = response?.data?.find(item =>
        matchesConversation(item, conversationId),
      );

      if (match) {
        return {
          ...match,
          participants: formatClientParticipants(match?.participants),
        };
      }
    }

    if (normalizedType === 'vendor' && user?.vendorId) {
      const response = await conversationService.fetchAllConversations(
        user.vendorId,
        'vendor',
      );
      const match = response?.data?.find(item =>
        matchesConversation(item, conversationId),
      );

      if (match) {
        return {
          ...match,
          participants: formatVendorParticipants(match?.participants),
        };
      }
    }
  } catch (error) {
    console.log('resolveChatParams error:', error);
  }

  return fallbackParams;
};

const navigateToChat = async conversationId => {
  const user = store.getState()?.LoginSlice?.user;
  if (!user || !conversationId) {
    return;
  }

  const chatParams = await resolveChatParams(conversationId, user);
  const normalizedType = String(user?.userType || '').toLowerCase();

  if (normalizedType === 'client') {
    navigationRef.navigate('ChatDetail', chatParams);
    return;
  }

  if (normalizedType === 'vendor') {
    store.dispatch(setActiveChat(chatParams));
    navigationRef.navigate('MainTabs', {
      screen: 'Dashboard',
      params: {
        screen: 'Home',
        params: {
          screen: 'ChatFlow',
          params: {
            screen: 'ChatDetails',
            params: chatParams,
          },
        },
      },
    });
  }
};

export const navigateFromNotificationData = data => {
  if (!data) {
    return;
  }

  const notificationType = String(data?.type || '').toLowerCase();
  const conversationId = data?.conversationId;
  const bookingId = data?.bookingId;

  runWhenNavigationReady(async () => {
    const user = store.getState()?.LoginSlice?.user;
    if (!user) {
      return;
    }

    if (notificationType === 'chat' && conversationId) {
      await navigateToChat(conversationId);
      return;
    }

    if (bookingId) {
      navigateToBooking(bookingId, user?.userType);
    }
  });
};
