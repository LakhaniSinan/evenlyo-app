import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/nl';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {useTranslation} from '../../../hooks';
import {setActiveChat} from '../../../redux/slice/chat';
import {checkIsChatedBefore, conversationService} from '../../../services/Chat';

const Messages = ({navigation}) => {
  const {t, currentLanguage} = useTranslation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  const {activeChat} = useSelector(state => state.activeChat);
  const {socket} = useContext(SocketContext);
  const [refreshing, setRefreshing] = useState(false);
  const [allConversations, setAllConversations] = useState([]);

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Format participants efficiently
  const formatedParticipants = useCallback(data => {
    const participants = {};
    data?.forEach(({role, refPath, userId}) => {
      const commonData = {
        userId: userId?._id,
        name:
          refPath === 'Vendor'
            ? userId?.businessName
            : `${userId?.firstName} ${userId?.lastName}`,
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
  }, []);

  const fetchAllConversations = useCallback(
    async (isRefreshing = false) => {
      try {
        if (!isRefreshing) {
          setIsLoading(true);
        }
        setIsError(false);

        const response = await conversationService.fetchAllConversations(
          user?.vendorId,
          'vendor',
        );

        if (response?.success && Array.isArray(response?.data)) {
          const formattedData = response.data.map(item => ({
            ...item,
            participants: formatedParticipants(item?.participants),
          }));
          setAllConversations(formattedData);
        } else {
          setIsError(true);
        }
      } catch {
        setIsError(true);
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        }
        if (!isRefreshing) {
          setIsLoading(false);
        }
      }
    },
    [user?.vendorId, formatedParticipants],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllConversations(true);
  }, [fetchAllConversations]);

  // ✅ Check if already chated before
  const handleCheckIsChatedBefore = useCallback(async () => {
    if (!activeChat?._id || !user?.vendorId) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await checkIsChatedBefore(user.vendorId, activeChat._id);

      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.data;
        if (data) {
          setChatData({
            ...data,
            participants: formatedParticipants(data?.participants),
          });
        }
      }
    } catch (error) {
      console.log('Error checking previous chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeChat, user, formatedParticipants]);

  // ✅ Update conversation utility
  const updateConversations = useCallback(
    (prevConversations, data) => {
      const index = prevConversations.findIndex(
        item => item.conversationId === data.conversationId,
      );

      if (index === -1) {
        return [
          {...data, participants: formatedParticipants(data?.participants)},
          ...prevConversations,
        ];
      }

      const updatedConversation = {
        ...prevConversations[index],
        unreadMessagesCount: data?.unreadMessagesCount,
        lastMessage: data?.lastMessage,
        lastUpdated: data?.isListUpdated
          ? prevConversations[index].lastUpdated
          : Date.now(),
      };

      const updatedList = [...prevConversations];
      updatedList.splice(index, 1);

      return data?.isListUpdated
        ? [...updatedList, updatedConversation]
        : [updatedConversation, ...updatedList];
    },
    [formatedParticipants],
  );

  // ✅ Handle socket updates (blocked/unblocked)
  const handleEmitBlockedConversation = useCallback(
    data => {
      const finalObject = {
        isBlocked: true,
        blockedBy: data?.blockedBy,
        blockedByRefrence: data?.blockedByRefrence,
        ...(data?.isReported && {
          isReported: true,
          reportedBy: data?.reportedBy,
          reportedByRefrence: data?.reportedByRefrence,
        }),
      };

      setAllConversations(prev =>
        prev.map(item =>
          item._id === data._id ? {...item, ...finalObject} : item,
        ),
      );

      if (activeChat?._id === data._id) {
        dispatch(setActiveChat({...activeChat, ...finalObject}));
      }
    },
    [activeChat, dispatch],
  );

  const handleEmitUnblockedConversation = useCallback(
    data => {
      const finalObject = {
        isBlocked: false,
        blockedBy: null,
        blockedByRefrence: null,
        isReported: false,
        reportedBy: null,
        reportedByRefrence: null,
      };

      setAllConversations(prev =>
        prev.map(item =>
          item._id === data._id ? {...item, ...finalObject} : item,
        ),
      );

      if (activeChat?._id === data._id) {
        dispatch(setActiveChat({...activeChat, ...finalObject}));
      }
    },
    [activeChat, dispatch],
  );

  // ✅ Socket event listeners
  useEffect(() => {
    if (!socket || !user?.vendorId) {
      return;
    }

    socket.emit('vendor_connected', {vendorId: user.vendorId});
    const handleEmitNewConversation = data =>
      setAllConversations(prev => updateConversations(prev, data));

    socket.on('new_conversation', handleEmitNewConversation);
    socket.on('conversation_blocked', handleEmitBlockedConversation);
    socket.on('conversation_unblocked', handleEmitUnblockedConversation);

    return () => {
      socket.off('new_conversation', handleEmitNewConversation);
      socket.off('conversation_blocked', handleEmitBlockedConversation);
      socket.off('conversation_unblocked', handleEmitUnblockedConversation);
    };
  }, [
    socket,
    user?.vendorId,
    updateConversations,
    handleEmitBlockedConversation,
    handleEmitUnblockedConversation,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchAllConversations();
      }
    }, [user, fetchAllConversations]),
  );

  useEffect(() => {
    if (activeChat) {
      handleCheckIsChatedBefore();
    }
  }, [activeChat, handleCheckIsChatedBefore]);

  // ✅ Filtered chats
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allConversations;
    }

    return allConversations.filter(
      chat =>
        chat?.participants?.user?.name?.toLowerCase().includes(query) ||
        chat?.lastMessage?.toLowerCase()?.includes(query),
    );
  }, [allConversations, searchQuery]);

  // ✅ Relative time helper
  const getRelativeTime = useCallback(
    timestamp => {
      if (!timestamp) {
        return '';
      }
      const locale = currentLanguage === 'nl' ? 'nl' : 'en';
      const now = moment();
      const time = moment(timestamp).locale(locale);

      const diffInMinutes = now.diff(time, 'minutes');
      const diffInHours = now.diff(time, 'hours');
      const diffInDays = now.diff(time, 'days');

      if (diffInMinutes < 1) {
        return t('timeRelativeJustNow');
      }
      if (diffInMinutes < 60) {
        return t('timeRelativeMinutesAgo', {count: diffInMinutes});
      }
      if (diffInHours < 24) {
        return t('timeRelativeHoursAgo', {count: diffInHours});
      }
      if (diffInDays === 1) {
        return t('timeRelativeYesterday');
      }
      if (diffInDays < 7) {
        return t('timeRelativeDaysAgo', {count: diffInDays});
      }
      return time.format('MMM D, YYYY');
    },
    [currentLanguage, t],
  );

  // ✅ Select chat
  const handleSelectChat = useCallback(
    item => {
      dispatch(setActiveChat(item));
      navigation.navigate('ChatFlow', {
        screen: 'ChatDetails',
        params: item,
      });
    },
    [dispatch, navigation],
  );

  // ✅ Render chat item (stable unread badge fix)
  const renderChatItem = ({item}) => {
    const chats = item?.participants?.user;
    const unreadCount = item?.unreadMessagesCount[user?.vendorId] || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleSelectChat(item)}>
        {/* Profile Image */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                chats?.photo ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.avatar}
          />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>
              {chats?.name || t('messagesUnknownUser')}
            </Text>

            <View style={styles.rightSection}>
              <Text style={styles.timeText}>
                {getRelativeTime(item?.lastUpdated)}
              </Text>

              <View
                style={[
                  styles.unreadBadgeContainer,
                  unreadCount > 0 ? styles.visibleBadge : styles.hiddenBadge,
                ]}>
                {unreadCount > 0 && (
                  <Text style={styles.unreadText}>{unreadCount}</Text>
                )}
              </View>
            </View>
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {(item?.lastMessage || '').trim() || t('messagesNoMessagesYet')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={t('Messages')}
          onLeftIconPress={() => navigation.goBack()}
          showSearchbar
        />
        <View style={styles.searchContainer}>
          <TextField
            startIcon={ICONS.search}
            bgColor={COLORS.white}
            placeholder={t('Search')}
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item?._id?.toString()}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076503.png',
              }}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>{t('messagesEmptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('messagesEmptySubtitle')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  headerWrapper: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomLeftRadius: width(10),
    borderBottomRightRadius: width(10),
  },
  searchContainer: {
    paddingHorizontal: width(5),
    paddingVertical: height(2),
  },
  chatList: {flex: 1},
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(5),
    paddingVertical: height(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    minHeight: height(9),
  },
  avatarContainer: {position: 'relative', marginRight: width(3)},
  avatar: {width: width(12), height: width(12), borderRadius: width(6)},
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width(3),
    height: width(3),
    borderRadius: width(1.5),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatContent: {flex: 1, justifyContent: 'center'},
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height(0.5),
  },
  chatName: {
    fontSize: screenWidth > 400 ? 16 : 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    flex: 1,
  },
  rightSection: {alignItems: 'flex-end', minWidth: width(15)},
  timeText: {
    fontSize: screenWidth > 400 ? 12 : 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginBottom: height(0.3),
  },
  unreadBadgeContainer: {
    width: width(5.5),
    height: width(5.5),
    borderRadius: width(2.75),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width(1),
  },
  visibleBadge: {
    backgroundColor: COLORS.primary,
  },
  hiddenBadge: {
    backgroundColor: 'transparent',
  },
  unreadText: {
    fontSize: screenWidth > 400 ? 11 : 9,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
  },
  lastMessage: {
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginTop: height(0.3),
    lineHeight: screenWidth > 400 ? 18 : 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: COLORS.white,
  },
  emptyImage: {width: 120, height: 120, marginBottom: 20, opacity: 0.8},
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    width: '80%',
  },
});

export default Messages;
