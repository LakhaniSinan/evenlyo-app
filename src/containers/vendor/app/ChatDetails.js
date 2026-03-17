import {pick, types} from '@react-native-documents/picker';
import moment from 'moment';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import RNFS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import EmojiPickerPopup from '../../../components/emojiModal';
import ReportUserModal from '../../../components/reportClient';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {setActiveChat} from '../../../redux/slice/chat';
import {conversationService, messageService} from '../../../services/Chat';
import RNFetchBlob from 'rn-fetch-blob';

const commonEmojis = [
  '😊',
  '😂',
  '👍',
  '❤️',
  '🔥',
  '💯',
  '🎉',
  '👏',
  '🙏',
  '💪',
];

const ChatDetail = ({navigation, route}) => {
  const data = route?.params || {};
  const dispatch = useDispatch();
  const {socket} = useContext(SocketContext);
  const {user} = useSelector(state => state.LoginSlice);
  const {activeChat} = useSelector(state => state.activeChat);
  const {t} = useTranslation();
  const modalRef = useRef();
  const [attachedFile, setAttachedFile] = useState(null);
  console.log(
    attachedFile,
    'attachedFileattachedFileattachedFileattachedFileasdasd',
  );

  const [isError, setIsError] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // refs
  const flatListRef = useRef(null);
  const allMessagesRef = useRef([]);
  const isMountedRef = useRef(true);
  const lastConversationIdRef = useRef(data?.conversationId);

  // keep ref synced
  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelectEmoji = emoji => {
    setMessageText(prev => prev + emoji);
  };

  /** ---------- helpers ---------- **/
  const formatedParticipants = useCallback(participantsData => {
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
  }, []);

  const updateConversations = useCallback(
    (prevConversations, payload) => {
      const idx = prevConversations.findIndex(
        it => it.conversationId === payload.conversationId,
      );

      if (idx === -1) {
        return [
          {
            ...payload,
            participants: formatedParticipants(payload?.participants),
          },
          ...prevConversations,
        ];
      }

      const updatedConversation = {
        ...prevConversations[idx],
        unreadMessagesCount: payload?.unreadMessagesCount,
        lastMessage: payload?.lastMessage,
        lastUpdated:
          payload?.isListUpdated === undefined
            ? Date.now()
            : prevConversations[idx].lastUpdated,
      };

      const copy = [...prevConversations];
      copy.splice(idx, 1);

      if (payload?.isListUpdated === undefined) {
        return [updatedConversation, ...copy];
      } else {
        copy.splice(idx, 0, updatedConversation);
        return copy;
      }
    },
    [formatedParticipants],
  );

  const handleEmitBlockedConversation = useCallback(
    payload => {
      const finalObject = {
        isBlocked: true,
        blockedBy: payload?.blockedBy,
        blockedByRefrence: payload?.blockedByRefrence,
        ...(payload?.isReported && {
          isReported: true,
          reportedBy: payload?.reportedBy,
          reportedByRefrence: payload?.reportedByRefrence,
        }),
      };

      setAllConversations(prev =>
        prev.map(it => (it._id === payload._id ? {...it, ...finalObject} : it)),
      );

      if (activeChat?._id === payload._id) {
        dispatch(setActiveChat({...activeChat, ...finalObject}));
      }
    },
    [activeChat, dispatch],
  );

  const handleEmitUnblockedConversation = useCallback(
    payload => {
      const finalObject = {
        isBlocked: false,
        blockedBy: null,
        blockedByRefrence: null,
        isReported: false,
        reportedBy: null,
        reportedByRefrence: null,
      };

      setAllConversations(prev =>
        prev.map(it => (it._id === payload._id ? {...it, ...finalObject} : it)),
      );

      if (activeChat?._id === payload._id) {
        dispatch(setActiveChat({...activeChat, ...finalObject}));
      }
    },
    [activeChat, dispatch],
  );

  useEffect(() => {
    if (!socket || !user?.vendorId) {
      return;
    }

    socket.emit('user_connected', {userId: user.vendorId});

    const handleEmitNewConversation = payload =>
      setAllConversations(prev => updateConversations(prev, payload));

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

  const scrollToBottom = useCallback(() => {
    if (!flatListRef.current || !allMessagesRef.current.length) {
      return;
    }
    const lastIndex = allMessagesRef.current.length - 1;
    try {
      flatListRef.current.scrollToIndex({index: lastIndex, animated: true});
    } catch (err) {
      // If the list hasn't measured its layout yet, scroll to the end instead of the top
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, []);
  const fetchAllMessages = useCallback(
    async (isRefreshing = false) => {
      if (!data?.conversationId || !user?.vendorId) {
        return;
      }

      try {
        if (!isRefreshing) {
          setIsLoading(true);
        }
        const response = await messageService.getAllMessages(
          data.conversationId,
          user.vendorId,
        );
        if (response?.success) {
          if (isMountedRef.current) {
            setAllMessages(response.data || []);
            setTimeout(scrollToBottom, 100);
          }
        } else {
          if (isMountedRef.current) {
            setIsError(true);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setIsError(true);
        }
      } finally {
        if (isMountedRef.current) {
          if (isRefreshing) {
            setRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [data?.conversationId, user?.vendorId, scrollToBottom],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllMessages(true);
  }, [fetchAllMessages]);

  useEffect(() => {
    if (user && data?.conversationId) {
      fetchAllMessages();
    }
  }, [user, data?.conversationId, fetchAllMessages]);

  // Reset unread on mount / when conversation changes
  useEffect(() => {
    if (!socket || !user?.vendorId || !activeChat) {
      return;
    }
    socket.emit('reset_unread_count', {
      conversationId: activeChat.conversationId || data?.conversationId,
      userType: 'user',
      userId: user.vendorId,
    });
  }, [socket, user?.vendorId, activeChat, data?.conversationId]);

  // receive message handler
  const handleReceiveMessage = useCallback(
    newMessage => {
      setIsTyping(false);
      if (
        newMessage?.conversationId ===
        (data?.conversationId || activeChat?.conversationId)
      ) {
        setAllMessages(prev => {
          const next = [...prev, newMessage];
          allMessagesRef.current = next;
          return next;
        });
        setTimeout(scrollToBottom, 100);
      }
    },
    [data?.conversationId, activeChat?.conversationId, scrollToBottom],
  );

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    const joinConvId = data?.conversationId || activeChat?.conversationId;
    if (!joinConvId) {
      return;
    }

    socket.emit('join_conversation_room', {conversationId: joinConvId});
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [
    socket,
    user,
    data?.conversationId,
    activeChat?.conversationId,
    handleReceiveMessage,
  ]);

  // offer accepted & typing events
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onOfferAccepted = payload => {
      // caller may update messages; keep behavior same
      const idx = allMessagesRef.current.findIndex(
        m => m?.offerObject?.uniqueId === payload?.offerObject?.uniqueId,
      );
      if (idx !== -1) {
        const clone = [...allMessagesRef.current];
        clone[idx] = payload;
        if (isMountedRef.current) {
          setAllMessages(clone);
        }
      }
      setIsAcceptingOffer(false);
    };

    const onOfferError = () => setIsAcceptingOffer(false);

    const onUserTyping = () => {
      setIsTyping(true);
      setTimeout(() => {
        // keep typing flag for short duration, ui handles it
        setIsTyping(false);
      }, 2000);
      setTimeout(scrollToBottom, 100);
    };

    socket.on('offer_accepted', onOfferAccepted);
    socket.on('accept_offer_error', onOfferError);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('offer_accepted', onOfferAccepted);
      socket.off('accept_offer_error', onOfferError);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', () => setIsTyping(false));
    };
  }, [socket, scrollToBottom]);

  /** ---------- time formatting ---------- **/
  const getMessageTime = useCallback(timestamp => {
    if (!timestamp) {
      return '';
    }
    const messageTime = moment(timestamp);
    const now = moment();

    if (messageTime.isSame(now, 'day')) {
      return `Today at ${messageTime.format('hh:mm A')}`;
    }
    if (messageTime.isSame(moment().subtract(1, 'day'), 'day')) {
      return `Yesterday at ${messageTime.format('hh:mm A')}`;
    }
    if (messageTime.isAfter(moment().subtract(7, 'days'))) {
      return `${messageTime.format('dddd')} at ${messageTime.format(
        'hh:mm A',
      )}`;
    }
    return messageTime.format('MMM DD, YYYY [at] hh:mm A');
  }, []);

  /** ---------- send message ---------- **/
  const handleSend = useCallback(
    async e => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (isError) {
        return;
      }
      if (!messageText.trim() && !attachedFile) {
        return;
      }

      const receiverId =
        activeChat?.participants?.vendor?.userId ||
        data?.participants?.vendor?.userId;
      const conversationType = 'vender-to-user';
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage = {
        _id: tempId,
        conversationId: activeChat?.conversationId || data?.conversationId,
        senderId: user?.vendorId,
        receiverId,
        senderRole: 'user',
        receiverRole: 'vendor',
        senderRefrence: 'User',
        receiverRefrence: 'Vendor',
        message: messageText || '',
        conversationType,
        timestamp: new Date().toISOString(),
        isPending: true,
        ...(attachedFile && {
          attachment: {name: attachedFile.name || attachedFile},
        }),
      };

      // optimistic UI
      setAllMessages(prev => {
        const next = [...prev, tempMessage];
        allMessagesRef.current = next;
        return next;
      });
      setMessageText('');
      setAttachedFile(null);
      setTimeout(scrollToBottom, 100);

      try {
        let fileUrl = null;
        if (attachedFile) {
          const uploadRes = await helper.uploadMediaToCloudinary(attachedFile);
          if (uploadRes && (uploadRes.url || uploadRes.secure_url)) {
            fileUrl = {
              url: uploadRes.url || uploadRes.secure_url,
              format:
                uploadRes.format ||
                (uploadRes.url && uploadRes.url.split('.').pop()),
              name: uploadRes.name || uploadRes.original_filename || 'file',
              size: uploadRes.size || null,
            };
          }
        }

        const finalMessage = {
          ...tempMessage,
          attachment: fileUrl
            ? {
                url: fileUrl?.url,
                type: fileUrl?.format === 'pdf' ? 'file' : 'image',
                name: fileUrl?.name,
                size: fileUrl?.size,
              }
            : undefined,
          isPending: false,
        };

        // emit socket
        socket?.emit?.('send_message', finalMessage);

        // replace temp with final
        setAllMessages(prev => {
          const next = prev.map(m => (m._id === tempId ? finalMessage : m));
          allMessagesRef.current = next;
          return next;
        });
      } catch (err) {
        // mark failed
        setAllMessages(prev => {
          const next = prev.map(m =>
            m._id === tempId ? {...m, isPending: false, error: true} : m,
          );
          allMessagesRef.current = next;
          return next;
        });
      }
    },
    [
      attachedFile,
      activeChat,
      data?.conversationId,
      messageText,
      scrollToBottom,
      socket,
      user?.vendorId,
      isError,
    ],
  );

  /** ---------- upload helpers ---------- **/
  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to select media',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const handleUpload = useCallback(async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response?.didCancel) {
        return;
      }
      if (response?.errorCode) {
        Alert.alert('Error', response?.errorMessage || 'Image picker error');
        return;
      }

      const asset = response?.assets?.[0];
      if (!asset) {
        return;
      }

      const file = {
        uri: asset.uri,
        type: asset.type,
        name:
          asset.fileName ||
          `upload.${(asset.type || '').split('/')[1] || 'jpg'}`,
      };

      // Just store locally for now
      setAttachedFile(file);
    });
  }, [requestStoragePermission]);

  /** ---------- render single message ---------- **/

  const renderMessage = useCallback(
    ({item}) => {
      const isOwn = item?.senderId === user?.vendorId;

      const imageUri = !isOwn
        ? data?.participants?.user?.photo ||
          'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        : data?.participants?.vendor?.photo || '';

      const isSending = item?.isPending && item?.attachment;
      const isImage =
        item?.attachment?.type === 'image' ||
        item?.attachment?.url?.endsWith('.jpg') ||
        item?.attachment?.url?.endsWith('.png');
      const isPDF =
        item?.attachment?.type === 'file' ||
        item?.attachment?.url?.endsWith('.pdf');

      // ✅ Replaced with RNFS-based download from URL
      const handleDownloadPDF = async (url, name = 'Document') => {
        try {
          if (!url) {
            Alert.alert('Error', 'No PDF URL found.');
            return;
          }

          const timeStamp = moment().format('YYYYMMDD_HHmmss');
          const pdfFileName = `${name}_${timeStamp}.pdf`;

          const isAndroid = Platform.OS === 'android';
          const folderPath = isAndroid
            ? RNFetchBlob.fs.dirs.DownloadDir
            : RNFetchBlob.fs.dirs.DocumentDir;
          const destinationPath = `${folderPath}/${pdfFileName}`;

          console.log('📂 Saving to:', destinationPath);

          // ✅ Use RNFetchBlob internal download — not Android DownloadManager
          const res = await RNFetchBlob.config({
            trusty: true, // allows HTTPS
            path: destinationPath,
            fileCache: true,
            appendExt: 'pdf',
          }).fetch('GET', url);

          const status = res.info().status;

          if (status === 200 || status === 302) {
            if (isAndroid) {
              Alert.alert(
                'Download Complete',
                `Saved to Downloads/${pdfFileName}`,
              );
            } else {
              await Share.share({
                url: `file://${destinationPath}`,
                type: 'application/pdf',
                title: 'Share PDF Document',
              });
            }

            console.log('✅ PDF saved successfully:', destinationPath);
          } else {
            console.log('❌ Unexpected status:', status);
            Alert.alert('Error', 'Failed to download PDF.');
          }
        } catch (error) {
          console.log('❌ PDF Download Error:', error);
          Alert.alert('Error', 'Something went wrong while downloading PDF.');
        }
      };

      return (
        <>
          <View
            style={[
              styles.messageContainer,
              isOwn ? styles.myMessageContainer : styles.otherMessageContainer,
            ]}>
            {!isOwn && (
              <Image
                resizeMode="cover"
                source={{uri: imageUri}}
                style={styles.messageAvatar}
              />
            )}

            {isOwn ? (
              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.myMessageBubble,
                  {maxWidth: width(80), alignSelf: 'flex-end'},
                ]}>
                {isSending ? (
                  <Text style={styles.sendingText}>Sending...</Text>
                ) : isImage ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setPreviewImage(item?.attachment?.url);
                      setPreviewVisible(true);
                    }}>
                    <Image
                      source={{uri: item?.attachment?.url}}
                      resizeMode="contain"
                      style={{
                        height: 300,
                        width: '100%',
                        borderRadius: width(5),
                      }}
                    />
                    {item?.message ? (
                      <Text style={[styles.messageText, styles.myMessageText]}>
                        {item?.message}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ) : isPDF ? (
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: width(2),
                      padding: width(3),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="file-pdf-box" size={32} color="#FF0000" />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontWeight: 'bold',
                          color: '#000',
                          maxWidth: width(45),
                        }}
                        numberOfLines={1}>
                        {item?.attachment?.name || 'PDF Document'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDownloadPDF(
                          item?.attachment?.url,
                          item?.attachment?.name,
                        )
                      }>
                      <Icon name="download" size={28} color="#E31B95" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[styles.messageText, styles.myMessageText]}>
                    {item?.message}
                  </Text>
                )}
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.otherMessageBubble,
                  {maxWidth: width(80), alignSelf: 'flex-start'},
                ]}>
                {isImage ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setPreviewImage(item?.attachment?.url);
                      setPreviewVisible(true);
                    }}>
                    <Image
                      source={{uri: item?.attachment?.url}}
                      style={{
                        height: 180,
                        width: width(60),
                        borderRadius: width(3),
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : isPDF ? (
                  <View
                    style={{
                      backgroundColor: '#f4f4f4',
                      borderRadius: width(2),
                      padding: width(3),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="file-pdf-box" size={32} color="#FF0000" />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontWeight: 'bold',
                          color: '#000',
                          maxWidth: width(45),
                        }}
                        numberOfLines={1}>
                        {item?.attachment?.name || 'PDF Document'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDownloadPDF(
                          item?.attachment?.url,
                          item?.attachment?.name,
                        )
                      }>
                      <Icon name="download" size={28} color="#E31B95" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[styles.messageText, styles.otherMessageText]}>
                    {item?.message}
                  </Text>
                )}
              </View>
            )}

            {isOwn && (
              <Image
                resizeMode="cover"
                source={{uri: imageUri}}
                style={styles.messageAvatar}
              />
            )}
          </View>

          <Text
            style={[
              styles.messageTime,
              isOwn ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
            {getMessageTime(item?.timestamp)}
          </Text>
        </>
      );
    },
    [user?.vendorId, data?.participants, getMessageTime],
  );

  // keyExtractor (safety if messages generated as temp)
  const keyExtractor = useCallback(
    item =>
      item?._id?.toString
        ? item._id.toString()
        : String(item?._id || Math.random()),
    [],
  );

  const isBlockedByMe =
    activeChat?.blockedBy && activeChat?.blockedByRefrence === 'Vendor';

  const menuContent = [
    {icon: ICONS.deleteIcon, title: 'Delete Chat'},
    {
      icon: ICONS.viewIcon,
      title: isBlockedByMe ? 'Unblock Client' : 'Block Client',
    },
    {icon: ICONS.editGridientIcon, title: 'Report Client'},
  ];

  const [commentType, setCommentType] = useState('');

  // Update the handleSelectOption function

  const handleSelectOption = type => {
    if (type === 'Delete Chat') {
      modalRef.current.show({
        status: 'alert',
        message:
          'Are you sure you want to delete this chat? All messages in this conversation will be permanently deleted and cannot be recovered.',
        handlePressOk: () => {
          modalRef.current.hide();
          handleDeleteChat();
        },
      });
    } else if (type === 'Block Client') {
      modalRef.current.show({
        status: 'alert',
        message:
          'Are you sure you want to block this user? You will no longer be able to send or receive messages from them until you unblock.',
        handlePressOk: () => {
          modalRef.current.hide();
          handleBlockConversation();
        },
      });
    } else if (type === 'Unblock Client') {
      modalRef.current.show({
        status: 'alert',
        message:
          'Do you want to unblock this user? You will be able to send and receive messages again.',
        handlePressOk: () => {
          modalRef.current.hide();
          handleUnblockConversation();
        },
      });
    } else if (type == 'Report Client') {
      setVisible(true);
    }
  };

  const handleUnblockConversation = async () => {
    try {
      setRefreshing(true);
      const response = await conversationService.unblockConversation(
        activeChat?._id,
      );

      console.log(response, 'responseresponseresponseresponseresponseas444faf');

      if (response?.success) {
        modalRef.current.show({
          status: 'ok',
          message: response?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorerror4567877');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBlockConversation = async () => {
    try {
      setRefreshing(true);
      const response = await conversationService.blockConversation(
        activeChat?._id,
        {userId: user?.vendorId, userType: 'Vendor'},
      );
      if (response?.success) {
        modalRef.current.show({
          status: 'ok',
          message: response?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerror14256');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteChat = async () => {
    try {
      setRefreshing(true);
      const response = await messageService.deleteMessage(
        activeChat?.conversationId,
        user?.vendorId,
      );

      if (response?.success) {
        fetchAllMessages();
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorerror99987');
    } finally {
      setRefreshing(false);
    }
  };
  const handleReport = async reason => {
    try {
      setRefreshing(true);
      const response = await conversationService.reportConversation(
        activeChat?._id,
        {
          userId: user?.vendorId,
          userType: 'Vendor',
          reportReason: reason,
          reporter: activeChat?.participants?.vendor?.name,
          reportedPerson: activeChat?.participants?.user?.name,
        },
      );
      if (response?.success) {
        modalRef.current.show({
          status: 'ok',
          message: response?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.message,
        });
      }
    } catch (error) {
      console.log(error, 'lakbflasflkasbdkasb;lasljbds;kajd');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectFile = useCallback(async () => {
    try {
      // Show loader if needed
      // setIsLoading(true);

      const [file] = await pick({
        type: [types.pdf],
      });

      if (file) {
        const selectedFile = {
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'document.pdf',
          size: file.size,
        };

        setAttachedFile(selectedFile);
        Alert.alert('File Selected', selectedFile.name);
      }

      // setIsLoading(false);
    } catch (error) {
      // setIsLoading(false);
      if (error?.message?.includes('canceled')) {
        return; // user cancelled selection
      }
      console.log('Document Picker Error:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          onLeftIconPress={() => navigation.goBack()}
          menuContent={menuContent}
          setCommentType={setCommentType}
          commentType={commentType}
          isMenu={true}
          handleSelectOption={handleSelectOption}
          isShowMenuIcon={true}
          rightIcon={ICONS.menuIcon}
          onRightIconPress={() => {}}
          chatHeaderData={{
            Icon:
              data?.participants?.user?.photo ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            name: data?.participants?.user?.name,
            lastSeen: 'Thanks for the quick res....',
          }}
        />

        <FlatList
          ref={flatListRef}
          data={allMessages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
          contentContainerStyle={{padding: width(2), paddingBottom: width(20)}}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListFooterComponent={
            data?.offreShow && (
              <View style={styles.offerCard}>
                <Text style={styles.offerTitle}>New Offer Send</Text>
                <Text style={styles.offerSubtitle}>
                  With over 7 years of event experience, DJ Ray...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: width(1),
                  }}>
                  <Text style={styles.offerPrice}>$300</Text>
                  <Text style={styles.offerPer}>/Day</Text>
                </View>
              </View>
            )
          }
        />

        {isBlockedByMe ? (
          <View
            style={{
              padding: width(3),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.backgroundLight,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}>
            <Text
              style={{
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 13,
              }}>
              You have blocked this user. You can’t send messages.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateCustomOffer')}
              style={{
                height: width(10),
                width: width(10),
                borderRadius: 12,
                position: 'absolute',
                bottom: width(25),
                right: width(3),
              }}>
              <Image
                source={ICONS.plusIcon}
                resizeMode="contain"
                style={{height: '100%', width: '100%'}}
              />
            </TouchableOpacity>

            <View style={[styles.inputWrapper, {flexDirection: 'column'}]}>
              {attachedFile && !attachedFile?.name && (
                <View style={styles.previewContainer}>
                  <Image
                    source={{uri: attachedFile?.uri}}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setAttachedFile(null)}
                    style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {attachedFile && attachedFile?.name && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 10,
                    padding: 10,
                    marginHorizontal: 10,
                    marginVertical: width(2),
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{flex: 1, color: COLORS.textLight}}>
                    {attachedFile.name}
                  </Text>
                  <TouchableOpacity onPress={() => setAttachedFile(null)}>
                    <Text style={{color: 'red'}}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: width(2),
                }}>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={handleSelectFile}>
                  <Image
                    resizeMode="contain"
                    source={ICONS.plusIcon}
                    style={{height: 22, width: 22}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => setShowEmojiPicker(true)}>
                  <Text style={{fontSize: 19}}>😊</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => handleUpload(setAttachedFile)}>
                  <Image
                    source={ICONS.attachmentIcon}
                    style={{height: width(4), width: width(4)}}
                  />
                </TouchableOpacity>

                <View style={styles.inputInner}>
                  <TextInput
                    placeholder={t('Reply to Sarah here...')}
                    placeholderTextColor={COLORS.textLight}
                    value={messageText}
                    onChangeText={setMessageText}
                    maxLength={500}
                    style={styles.textInput}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    style={[
                      styles.emojiButton,
                      {
                        backgroundColor: COLORS.primary,
                        borderWidth: 0,
                        height: width(10),
                        width: width(10),
                        marginRight: width(1),
                      },
                    ]}>
                    <Image
                      source={ICONS.sendIcon}
                      style={{height: width(10), width: width(10)}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
      <CommonAlert ref={modalRef} />
      <ReportUserModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSubmit={handleReport}
        userName="Peaky Blinders"
      />
      <EmojiPickerPopup
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        emojis={commonEmojis}
        onSelectEmoji={handleSelectEmoji}
      />
      {/* Image Preview Modal */}
      {previewVisible && (
        <View style={styles.fullScreenModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewVisible(false)}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Image
            source={{uri: previewImage}}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  messagesList: {flex: 1},
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  fullScreenImage: {
    width: '100%',
    height: '100%',
  },

  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10000,
  },

  closeText: {
    color: '#5f5c5cff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  sendingText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: width(1.5),
    paddingHorizontal: width(2),
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: width(8),
    height: width(8),
    marginHorizontal: width(2),
    borderRadius: 100,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: width(3),
    padding: width(2.5),
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderRadius: width(3),
    padding: width(2.5),
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageText: {
    fontSize: 14,
    flexShrink: 1, // allows auto-width adjustment
  },
  messageAvatar: {
    height: width(8),
    width: width(8),
    borderRadius: width(4),
    marginHorizontal: width(2),
  },
  messageTime: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    width: width(72),
    alignSelf: 'center',
  },
  myMessageTime: {textAlign: 'right', marginRight: width(1)},
  otherMessageTime: {
    textAlign: 'left',
    marginLeft: width(1),
    marginTop: height(0.5),
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: width(3),
    height: width(12),
    width: width(8),
    borderWidth: 1,
    borderColor: COLORS.textLight,
    marginRight: width(2),
  },
  emojiText: {fontSize: 12},
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: width(3),
    overflow: 'hidden',
    flex: 1,
    margin: width(2),
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    paddingHorizontal: width(4),
  },

  previewContainer: {
    marginTop: width(2),
    position: 'relative',
    alignSelf: 'flex-start',
    marginLeft: width(3),
  },
  previewImage: {
    width: width(50),
    height: 130,
    borderRadius: width(2),
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  offerCard: {
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    margin: width(3),
    borderRadius: 14,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offerTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textDark,
  },
  offerSubtitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: width(1),
  },
  offerPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  offerPer: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
});

export default ChatDetail;
