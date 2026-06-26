import {pick, types, errorCodes, isErrorWithCode} from '@react-native-documents/picker';
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
  Modal,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import EmojiPickerPopup from '../../../components/emojiModal';
import ReportUserModal from '../../../components/reportClient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../../constants';
import {SocketContext} from '../../../context';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {formatEuro, formatPrice} from '../../../utils';
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

const formatFileSize = bytes => {
  const size = Number(bytes);
  if (!bytes || Number.isNaN(size) || size <= 0) {
    return null;
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const PdfAttachmentCard = ({
  fileName,
  fileSize,
  isOwn,
  isSending,
  onDownload,
  containerStyle,
}) => {
  const displayName = fileName || 'PDF Document';
  const sizeLabel = formatFileSize(fileSize);
  const metaText = sizeLabel ? `PDF • ${sizeLabel}` : 'PDF';
  const gradientColors = isOwn
    ? BRAND_BUTTON_GRADIENT_COLORS
    : ['#FF295D', '#E31B95', '#7A3FF2'];
  const gradientLocations = isOwn
    ? BRAND_BUTTON_GRADIENT_LOCATIONS
    : [0, 0.5, 1];

  return (
    <LinearGradient
      colors={gradientColors}
      locations={gradientLocations}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.pdfAttachmentCard, containerStyle]}>
      <View style={styles.pdfAttachmentRow}>
        <View style={styles.pdfFileIconContainer}>
          <Icon name="file-document-outline" size={28} color="#D1D5DB" />
          <View style={styles.pdfFileTypeBadge}>
            <Text style={styles.pdfFileTypeText}>PDF</Text>
          </View>
        </View>

        <View style={styles.pdfAttachmentInfo}>
          <Text style={styles.pdfAttachmentName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.pdfAttachmentMeta} numberOfLines={1}>
            {isSending ? 'Sending...' : metaText}
          </Text>
        </View>

        {!isSending && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDownload}
            style={styles.pdfDownloadButton}>
            <Icon name="download" size={20} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const ChatDetail = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const data = route?.params || {};
  const dispatch = useDispatch();
  const {socket} = useContext(SocketContext);
  const {user} = useSelector(state => state.LoginSlice);
  const {activeChat} = useSelector(state => state.activeChat);
  const {t, currentLanguage} = useTranslation();
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
  const [offerDetailsVisible, setOfferDetailsVisible] = useState(false);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState(null);

  // refs
  const flatListRef = useRef(null);
  const allMessagesRef = useRef([]);
  const lastInjectedOfferMessageIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastConversationIdRef = useRef(data?.conversationId);

  // keep ref synced
  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    const sentOfferMessage = route?.params?.sentOfferMessage;
    if (!sentOfferMessage?._id) {
      return;
    }

    if (lastInjectedOfferMessageIdRef.current === sentOfferMessage._id) {
      return;
    }

    const alreadyExists = allMessagesRef.current.some(
      message =>
        message?._id === sentOfferMessage._id ||
        message?.offerObject?.uniqueId ===
          sentOfferMessage?.offerObject?.uniqueId,
    );

    if (!alreadyExists) {
      setAllMessages(prev => {
        const next = [...prev, sentOfferMessage];
        allMessagesRef.current = next;
        return next;
      });
      setTimeout(scrollToBottom, 100);
    }

    lastInjectedOfferMessageIdRef.current = sentOfferMessage._id;
  }, [route?.params?.sentOfferMessage, scrollToBottom]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelectEmoji = emoji => {
    setMessageText(prev => prev + emoji);
  };

  const handleOpenOfferDetails = offerObject => {
    if (!offerObject) {
      return;
    }
    setSelectedOfferDetails(offerObject);
    setOfferDetailsVisible(true);
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

    socket.emit('vendor_connected', {vendorId: user.vendorId});

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
          currentLanguage,
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
        activeChat?.participants?.user?.userId ||
        data?.participants?.user?.userId;
      const conversationType = 'vender-to-user';
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage = {
        _id: tempId,
        conversationId: activeChat?.conversationId || data?.conversationId,
        senderId: user?.vendorId,
        receiverId,
        senderRole: 'vendor',
        receiverRole: 'user',
        senderRefrence: 'Vendor',
        receiverRefrence: 'User',
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

    if (Platform.Version >= 33) {
      const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const alreadyGranted = await PermissionsAndroid.check(permission);
      if (alreadyGranted) {
        return true;
      }

      await PermissionsAndroid.request(permission, {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to select media',
      });

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
      Alert.alert('Error', 'App needs access to your storage to select media');
      return;
    }

    launchImageLibrary({mediaType: 'photo', selectionLimit: 1}, response => {
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
      const isOfferMessage = Boolean(item?.isOffer || item?.offerObject);

      const clientPhoto = data?.participants?.user?.photo;
      const vendorPhoto = data?.participants?.vendor?.photo;
      const avatarUri = !isOwn
        ? clientPhoto && String(clientPhoto).trim()
          ? String(clientPhoto).trim()
          : null
        : vendorPhoto && String(vendorPhoto).trim()
        ? String(vendorPhoto).trim()
        : null;
      const messageAvatarSource = avatarUri ? {uri: avatarUri} : ICONS.userIcon;

      const isSending = item?.isPending && item?.attachment;
      const isImage =
        item?.attachment?.type?.startsWith?.('image') ||
        item?.attachment?.type === 'image' ||
        item?.attachment?.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
      const isPDF =
        item?.attachment?.type === 'file' ||
        item?.attachment?.type?.includes?.('pdf') ||
        item?.attachment?.url?.toLowerCase?.().endsWith('.pdf') ||
        item?.attachment?.url?.includes?.('/raw/upload');
      const offerObject = item?.offerObject || {};
      const firstOfferItem = offerObject?.items?.[0] || {};
      const offerTitle =
        firstOfferItem?.title?.en ||
        firstOfferItem?.title?.nl ||
        firstOfferItem?.title ||
        'Custom Offer';
      const offerDisplayPrice =
        firstOfferItem?.offerPrice ||
        firstOfferItem?.pricingBreakdown?.offerPrice ||
        firstOfferItem?.pricingBreakdown?.subtotal ||
        firstOfferItem?.discountedPrice ||
        0;
      const offerFinalTotal = offerObject?.finalTotal || offerDisplayPrice || 0;
      const offerStatus = offerObject?.status || 'PENDING';
      const offerImage =
        firstOfferItem?.images?.[0] ||
        firstOfferItem?.image ||
        firstOfferItem?.featuredImage;

      // ✅ Replaced with RNFS-based download from URL
      const handleDownloadPDF = async (url, name = 'Document') => {
        try {
          if (!url) {
            Alert.alert('Error', 'No PDF URL found.');
            return;
          }

          if (Platform.OS === 'android') {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
          }

          const timeStamp = moment().format('YYYYMMDD_HHmmss');
          const pdfFileName = `${(name || 'Document').replace(/\.pdf$/i, '')}_${timeStamp}.pdf`;

          const isAndroid = Platform.OS === 'android';
          const folderPath = isAndroid
            ? RNFetchBlob.fs.dirs.DownloadDir
            : RNFetchBlob.fs.dirs.DocumentDir;
          const destinationPath = `${folderPath}/${pdfFileName}`;

          const res = await RNFetchBlob.config({
            trusty: true,
            path: destinationPath,
            fileCache: true,
            appendExt: 'pdf',
          }).fetch('GET', url);

          const status = res.info().status;

          if (status === 200 || status === 302) {
            if (isAndroid) {
              RNFetchBlob.android.addCompleteDownload({
                title: pdfFileName,
                description: 'PDF download',
                mime: 'application/pdf',
                path: destinationPath,
                showNotification: true,
              });
              Alert.alert(
                'Download Complete',
                `Saved to Downloads/${pdfFileName}`,
              );
            } else {
              await Share.share({
                url: `file://${destinationPath}`,
                title: 'Share PDF Document',
              });
            }
          } else {
            Alert.alert('Error', 'Failed to download PDF.');
          }
        } catch (error) {
          console.log('PDF Download Error:', error);
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
                resizeMode="contain"
                source={messageAvatarSource}
                style={styles.messageAvatar}
              />
            )}

            {isOwn ? (
              isOfferMessage ? (
                <View style={[styles.offerMessageCard]}>
                  <View style={styles.offerMessageHeader}>
                    <View style={styles.offerMessageIconWrap}>
                      <Image
                        source={ICONS.giftIcon || ICONS.cartIcon}
                        style={styles.offerMessageIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.offerMessageHeaderText}>
                      Custom Offer
                    </Text>
                  </View>

                  <View style={styles.offerMessageItemRow}>
                    <Image
                      source={offerImage ? {uri: offerImage} : ICONS.event2}
                      style={styles.offerMessageItemImage}
                      resizeMode="contain"
                    />
                    <View style={{flex: 1, marginLeft: width(2)}}>
                      <Text
                        style={styles.offerMessageItemTitle}
                        numberOfLines={2}>
                        {offerTitle}
                      </Text>
                      <Text style={styles.offerMessageItemPrice}>
                        {formatEuro(offerDisplayPrice || 0, {decimals: 0, space: false})}
                      </Text>
                      <Text style={styles.offerMessageItemStatus}>
                        Status: {offerStatus}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.offerMessageDivider} />

                  <View style={styles.offerMessageTotalRow}>
                    <Text style={styles.offerMessageTotalLabel}>Total</Text>
                    <Text style={styles.offerMessageTotalAmount}>
                      {formatEuro(offerFinalTotal || 0, {decimals: 0, space: false})}
                    </Text>
                  </View>
                  <Text style={styles.offerMessageSubText}>
                    Valid for 24 hours
                  </Text>
                  <Text style={styles.offerMessageSubText}>
                    Status: {offerStatus}
                  </Text>

                  <LinearGradient
                    colors={['#FF295D', '#E31B95', '#7A3FF2']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.offerViewBtnGradient}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.offerViewBtn}
                      onPress={() => handleOpenOfferDetails(offerObject)}>
                      <Text style={styles.offerViewBtnText}>View Offer</Text>
                      <Text style={styles.offerViewBtnArrow}>{'->'}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ) : isPDF ? (
                <PdfAttachmentCard
                  isOwn
                  isSending={isSending}
                  fileName={item?.attachment?.name}
                  fileSize={item?.attachment?.size}
                  onDownload={() =>
                    handleDownloadPDF(
                      item?.attachment?.url,
                      item?.attachment?.name,
                    )
                  }
                  containerStyle={{
                    maxWidth: width(85),
                    alignSelf: 'flex-end',
                  }}
                />
              ) : isImage && item?.attachment?.url && !isSending ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setPreviewImage(item?.attachment?.url);
                    setPreviewVisible(true);
                  }}
                  style={[
                    styles.myMessageImageWrap,
                    {maxWidth: width(80), alignSelf: 'flex-end'},
                  ]}>
                  <Image
                    source={{uri: item.attachment.url}}
                    resizeMode="cover"
                    style={styles.myMessageImage}
                  />
                  {item?.message ? (
                    <Text style={styles.myMessageImageCaption}>
                      {item.message}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.myMessageBubble,
                    {maxWidth: width(80), alignSelf: 'flex-end'},
                  ]}>
                  <LinearGradient
                    colors={BRAND_BUTTON_GRADIENT_COLORS}
                    locations={BRAND_BUTTON_GRADIENT_LOCATIONS}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    pointerEvents="none"
                    style={styles.myMessageBubbleGradient}
                  />
                  <View style={styles.myMessageBubbleContent}>
                    {isSending ? (
                      <Text style={styles.sendingText}>Sending...</Text>
                    ) : (
                      <Text style={[styles.messageText, styles.myMessageText]}>
                        {item?.message}
                      </Text>
                    )}
                  </View>
                </View>
              )
            ) : (
              <View
                style={[
                  styles.otherMessageBubble,
                  {maxWidth: width(80), alignSelf: 'flex-start'},
                ]}>
                {isOfferMessage ? (
                  <View style={[styles.offerMessageCard]}>
                    <View style={styles.offerMessageHeader}>
                      <View style={styles.offerMessageIconWrap}>
                        <Image
                          source={ICONS.giftIcon || ICONS.cartIcon}
                          style={styles.offerMessageIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.offerMessageHeaderText}>
                        Custom Offer
                      </Text>
                    </View>

                    <View style={styles.offerMessageItemRow}>
                      <Image
                        source={offerImage ? {uri: offerImage} : ICONS.event2}
                        style={styles.offerMessageItemImage}
                        resizeMode="cover"
                      />
                      <View style={{flex: 1, marginLeft: width(2)}}>
                        <Text
                          style={styles.offerMessageItemTitle}
                          numberOfLines={2}>
                          {offerTitle}
                        </Text>
                        <Text style={styles.offerMessageItemPrice}>
                          {formatEuro(offerDisplayPrice || 0, {decimals: 0, space: false})}
                        </Text>
                        <Text style={styles.offerMessageItemStatus}>
                          Status: {offerStatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.offerMessageDivider} />

                    <View style={styles.offerMessageTotalRow}>
                      <Text style={styles.offerMessageTotalLabel}>Total</Text>
                      <Text style={styles.offerMessageTotalAmount}>
                        {formatEuro(offerFinalTotal || 0, {decimals: 0, space: false})}
                      </Text>
                    </View>
                    <Text style={styles.offerMessageSubText}>
                      Valid for 24 hours
                    </Text>
                    <Text style={styles.offerMessageSubText}>
                      Status: {offerStatus}
                    </Text>

                    <LinearGradient
                      colors={['#FF295D', '#E31B95', '#7A3FF2']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.offerViewBtnGradient}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.offerViewBtn}
                        onPress={() => handleOpenOfferDetails(offerObject)}>
                        <Text style={styles.offerViewBtnText}>View Offer</Text>
                        <Text style={styles.offerViewBtnArrow}>{'->'}</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                ) : isImage ? (
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
                  <PdfAttachmentCard
                    isOwn={false}
                    fileName={item?.attachment?.name}
                    fileSize={item?.attachment?.size}
                    onDownload={() =>
                      handleDownloadPDF(
                        item?.attachment?.url,
                        item?.attachment?.name,
                      )
                    }
                    containerStyle={{maxWidth: width(85)}}
                  />
                ) : (
                  <Text style={[styles.messageText, styles.otherMessageText]}>
                    {item?.message}
                  </Text>
                )}
              </View>
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
    [user?.vendorId, data?.participants, getMessageTime, navigation],
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
        mode: 'open',
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
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
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
            Icon: data?.participants?.user?.photo || null,
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
          contentContainerStyle={{padding: width(2), paddingBottom: width(4)}}
          keyboardShouldPersistTaps="handled"
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

        {activeChat?.isBlocked ? (
          <View
            style={{
              padding: width(3),
              paddingBottom: width(3) + insets.bottom,
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
              {isBlockedByMe
                ? 'You have blocked this user. You can’t send messages.'
                : 'This conversation has been blocked by client.'}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreateCustomOffer', {chatParams: data})
              }
              style={{
                height: width(10),
                width: width(10),
                borderRadius: 12,
                position: 'absolute',
                bottom: insets.bottom + width(18),
                right: width(3),
                zIndex: 10,
                elevation: 10,
                backgroundColor: COLORS.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={ICONS.plusIcon}
                resizeMode="contain"
                style={{height: width(6), width: width(6)}}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.inputWrapper,
                {flexDirection: 'column', paddingBottom: insets.bottom},
              ]}>
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
      <Modal
        visible={offerDetailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOfferDetailsVisible(false)}>
        <View style={styles.offerDetailsOverlay}>
          <View style={styles.offerDetailsCard}>
            <View style={styles.offerDetailsHeader}>
              <View style={styles.offerDetailsTitleWrap}>
                <View style={styles.offerDetailsIconWrap}>
                  <Image
                    source={ICONS.giftIcon || ICONS.cartIcon}
                    style={styles.offerDetailsIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.offerDetailsTitle}>Offer Details</Text>
              </View>
              <TouchableOpacity onPress={() => setOfferDetailsVisible(false)}>
                <Text style={styles.offerDetailsClose}>x</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.offerDetailsItemsHeading}>
              Items ({selectedOfferDetails?.items?.length || 0})
            </Text>

            <View style={styles.offerDetailsItemCard}>
              <Image
                source={
                  selectedOfferDetails?.items?.[0]?.images?.[0]
                    ? {uri: selectedOfferDetails.items[0].images[0]}
                    : ICONS.event2
                }
                style={styles.offerDetailsItemImage}
                resizeMode="cover"
              />
              <View style={{flex: 1, marginLeft: width(2.5)}}>
                <Text style={styles.offerDetailsItemTitle} numberOfLines={2}>
                  {selectedOfferDetails?.items?.[0]?.title?.en ||
                    selectedOfferDetails?.items?.[0]?.title?.nl ||
                    selectedOfferDetails?.items?.[0]?.title ||
                    'Offer Item'}
                </Text>
                <Text style={styles.offerDetailsItemType}>Booking</Text>
                <Text style={styles.offerDetailsSecurityText}>
                  Security fee included
                </Text>
              </View>
              <Text style={styles.offerDetailsItemPrice}>
                {formatEuro(
                  selectedOfferDetails?.items?.[0]?.offerPrice ||
                    selectedOfferDetails?.items?.[0]?.pricingBreakdown
                      ?.offerPrice ||
                    selectedOfferDetails?.items?.[0]?.discountedPrice ||
                    0,
                  {space: false},
                )}
              </Text>
            </View>

            <View style={styles.offerDetailsSummaryCard}>
              <Text style={styles.offerDetailsSummaryTitle}>
                Pricing Summary
              </Text>
              <View style={styles.offerDetailsRow}>
                <Text style={styles.offerDetailsLabel}>Subtotal</Text>
                <Text style={styles.offerDetailsValue}>
                  {formatEuro(selectedOfferDetails?.subtotal || 0, {space: false})}
                </Text>
              </View>
              <View style={styles.offerDetailsRow}>
                <Text style={[styles.offerDetailsLabel, {color: '#1D4ED8'}]}>
                  Security Fees
                </Text>
                <Text style={[styles.offerDetailsValue, {color: '#1D4ED8'}]}>
                  +{formatEuro(selectedOfferDetails?.totalSecurity || 0, {space: false})}
                </Text>
              </View>
              <View style={styles.offerDetailsDivider} />
              <View style={styles.offerDetailsRow}>
                <Text style={styles.offerDetailsTotalLabel}>Total Amount</Text>
                <Text style={styles.offerDetailsTotalValue}>
                  {formatEuro(selectedOfferDetails?.finalTotal || 0, {space: false})}
                </Text>
              </View>
            </View>

            <Text style={styles.offerDetailsStatusText}>
              Status: {selectedOfferDetails?.status || 'PENDING'}
            </Text>
            <Text style={styles.offerDetailsExpiryText}>
              Valid for 24 hours
            </Text>
          </View>
        </View>
      </Modal>
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
    maxWidth: '100%',
  },
  messageAvatar: {
    width: width(8),
    height: width(8),
    marginHorizontal: width(2),
    borderRadius: 100,
  },
  myMessageBubble: {
    borderRadius: width(3),
    padding: width(2.5),
    overflow: 'hidden',
  },
  myMessageBubbleGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width(3),
  },
  myMessageBubbleContent: {
    zIndex: 1,
  },
  myMessageImageWrap: {
    borderRadius: width(3),
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundLight,
  },
  myMessageImage: {
    height: width(55),
    width: width(70),
    borderRadius: width(3),
  },
  myMessageImageCaption: {
    color: COLORS.textDark,
    fontSize: 13,
    padding: width(2),
    backgroundColor: COLORS.white,
  },
  pdfAttachmentCard: {
    borderRadius: width(4),
    paddingHorizontal: width(3),
    paddingVertical: width(2.8),
    minWidth: width(72),
  },
  pdfAttachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfFileIconContainer: {
    width: width(12),
    height: width(14),
    borderRadius: width(1.5),
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2.5),
  },
  pdfFileTypeBadge: {
    position: 'absolute',
    bottom: width(1.2),
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pdfFileTypeText: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pdfAttachmentInfo: {
    flex: 1,
    marginRight: width(2),
  },
  pdfAttachmentName: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pdfAttachmentMeta: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'rgba(255,255,255,0.75)',
  },
  pdfDownloadButton: {
    width: width(9),
    height: width(9),
    borderRadius: width(4.5),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  otherMessageBubble: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    padding: width(2.5),
    overflow: 'hidden',
    flexShrink: 1,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: COLORS.textDark,
    flexShrink: 1,
  },
  messageText: {
    fontSize: 14,
    flexShrink: 1,
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
  offerMessageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F7B2DA',
    borderRadius: 18,
    padding: width(3),
    width: width(70),
  },
  offerMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width(2.5),
  },
  offerMessageIconWrap: {
    height: width(9),
    width: width(9),
    borderRadius: width(4.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginRight: width(2),
  },
  offerMessageIcon: {
    height: width(4.2),
    width: width(4.2),
    tintColor: COLORS.white,
  },
  offerMessageHeaderText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerMessageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerMessageItemImage: {
    width: width(16),
    height: width(16),
    borderRadius: 10,
    backgroundColor: COLORS.backgroundLight,
  },
  offerMessageItemTitle: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerMessageItemPrice: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textDecorationLine: 'line-through',
  },
  offerMessageItemStatus: {
    marginTop: 1,
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerMessageDivider: {
    marginVertical: width(2.6),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  offerMessageTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerMessageTotalLabel: {
    fontSize: 17,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerMessageTotalAmount: {
    fontSize: 17,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerMessageSubText: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerViewBtnGradient: {
    borderRadius: 14,
    marginTop: width(3),
  },
  offerViewBtn: {
    minHeight: width(10.5),
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerViewBtnText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerViewBtnArrow: {
    marginLeft: width(2),
    fontSize: 15,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: width(4),
  },
  offerDetailsCard: {
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    padding: width(4),
  },
  offerDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDetailsTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerDetailsIconWrap: {
    width: width(11),
    height: width(11),
    borderRadius: width(5.5),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2),
  },
  offerDetailsIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.white,
  },
  offerDetailsTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsClose: {
    fontSize: 28,
    color: COLORS.textLight,
    lineHeight: 28,
  },
  offerDetailsItemsHeading: {
    marginTop: width(4),
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsItemCard: {
    marginTop: width(3),
    backgroundColor: '#ECEEF2',
    borderRadius: 14,
    padding: width(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerDetailsItemImage: {
    width: width(18),
    height: width(18),
    borderRadius: 10,
  },
  offerDetailsItemTitle: {
    fontSize: 15,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsItemType: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerDetailsSecurityText: {
    marginTop: 4,
    fontSize: 12,
    color: '#1D4ED8',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerDetailsItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
    alignSelf: 'flex-end',
  },
  offerDetailsSummaryCard: {
    marginTop: width(4),
    backgroundColor: '#ECEEF2',
    borderRadius: 14,
    padding: width(3),
  },
  offerDetailsSummaryTitle: {
    fontSize: 17,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  offerDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width(1.2),
  },
  offerDetailsLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerDetailsValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerDetailsDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginTop: width(2),
    marginBottom: width(1),
  },
  offerDetailsTotalLabel: {
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsTotalValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerDetailsStatusText: {
    marginTop: width(4),
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  offerDetailsExpiryText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

export default ChatDetail;
