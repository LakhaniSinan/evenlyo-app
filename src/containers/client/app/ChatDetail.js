import {pick, types} from '@react-native-documents/picker';
import moment from 'moment';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import EmojiPickerPopup from '../../../components/emojiModal';
import CustomOfferModal from '../../../components/modals/CustomOffers';
import NewRequestModal from '../../../components/modals/RequestModal';
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
import {conversationService, messageService} from '../../../services/Chat';

const ChatDetail = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const modalRef = useRef();
  const data = route.params;
  const {socket} = useContext(SocketContext);
  const [visible, setVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const {t, currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    vendor: isDutch ? 'Leverancier' : 'Vendor',
    sending: isDutch ? 'Verzenden...' : 'Sending...',
    pdfDocument: isDutch ? 'PDF-document' : 'PDF Document',
    customOffer: isDutch ? 'Aangepaste offerte' : 'Custom Offer',
    status: isDutch ? 'Status' : 'Status',
    total: isDutch ? 'Totaal' : 'Total',
    validFor24Hours: isDutch ? '24 uur geldig' : 'Valid for 24 hours',
    accepted: isDutch ? 'GEACCEPTEERD' : 'ACCEPTED',
    viewAcceptOffer: isDutch ? 'Bekijk & accepteer offerte' : 'View & Accept Offer',
    storagePermissionTitle: isDutch
      ? 'Opslagtoestemming vereist'
      : 'Storage Permission Required',
    storagePermissionMsg: isDutch
      ? 'App heeft toegang nodig tot je opslag om media te selecteren'
      : 'App needs access to your storage to select media',
    error: isDutch ? 'Fout' : 'Error',
    fileSelected: isDutch ? 'Bestand geselecteerd' : 'File Selected',
    selectFileFailed: isDutch ? 'Selecteren van bestand mislukt' : 'Failed to select file',
    deleteChat: isDutch ? 'Chat verwijderen' : 'Delete Chat',
    blockVendor: isDutch ? 'Leverancier blokkeren' : 'Block Vendor',
    unblockVendor: isDutch ? 'Leverancier deblokkeren' : 'Unblock Vendor',
    reportVendor: isDutch ? 'Leverancier melden' : 'Report Vendor',
    deleteChatConfirm: isDutch
      ? 'Weet je zeker dat je deze chat wilt verwijderen? Alle berichten in dit gesprek worden permanent verwijderd en kunnen niet worden hersteld.'
      : 'Are you sure you want to delete this chat? All messages in this conversation will be permanently deleted and cannot be recovered.',
    blockVendorConfirm: isDutch
      ? 'Weet je zeker dat je deze leverancier wilt blokkeren? Je kunt geen berichten meer verzenden of ontvangen totdat je deblokkert.'
      : 'Are you sure you want to block this vendor? You will no longer be able to send or receive messages from them until you unblock.',
    unblockVendorConfirm: isDutch
      ? 'Wil je deze leverancier deblokkeren? Je kunt weer berichten verzenden en ontvangen.'
      : 'Do you want to unblock this vendor? You will be able to send and receive messages again.',
    blockedByMe: isDutch
      ? 'Je hebt deze leverancier geblokkeerd. Je kunt geen berichten verzenden.'
      : 'You have blocked this vendor. You can’t send messages.',
    blockedByVendor: isDutch
      ? 'Dit gesprek is geblokkeerd door de leverancier.'
      : 'This conversation has been blocked by vendor.',
    remove: isDutch ? 'Verwijderen' : 'Remove',
    messageToVendor: isDutch ? 'Bericht aan leverancier' : 'Message to vendor',
    todayAt: isDutch ? 'Vandaag om' : 'Today at',
    yesterdayAt: isDutch ? 'Gisteren om' : 'Yesterday at',
    at: isDutch ? 'om' : 'at',
  };
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commentType, setCommentType] = useState('');
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offerObject, setOfferObject] = useState(null);
  const {user} = useSelector(state => state.LoginSlice);
  const [attachedFile, setAttachedFile] = useState(null);
  const [conversation, setConversation] = useState(data);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [showViewOfferModal, setShowViewOfferModal] = useState(false);
  const currentConversationId =
    conversation?.conversationId || conversation?._id;
  const vendorDisplayName = useMemo(() => {
    const rawName =
      conversation?.participants?.vendor?.name ||
      conversation?.participants?.vendor?.businessName ||
      '';

    const normalized = String(rawName)
      .replace(/\b(undefined|null)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return normalized || localizedText.vendor;
  }, [conversation?.participants?.vendor?.name]);

  useEffect(() => {
    setConversation(data);
  }, [data]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('user_connected', {userId: user.id});
    }
  }, [socket, user]);

  const handleOfferAccepted = useCallback((data, allMessages) => {
    const findIndex = allMessages.findIndex(
      message => message?.offerObject?.uniqueId === data?.offerObject?.uniqueId,
    );

    if (findIndex !== -1) {
      const newMessages = [...allMessages];
      newMessages[findIndex] = data;
      setAllMessages(newMessages);
      toast.success('Offer accepted!');
    }
  }, []);

  useEffect(() => {
    if (user && currentConversationId) {
      fetchAllMessages();
    }
  }, [user, currentConversationId]);

  useEffect(() => {
    if (socket && user && currentConversationId) {
      socket.emit('reset_unread_count', {
        conversationId: currentConversationId,
        userType: 'user',
        userId: user?.id,
      });
    }
  }, [currentConversationId, socket, allMessages, user]);

  const handleReceiveMessage = useCallback(
    newMessage => {
      setIsTyping(false);
      if (newMessage.conversationId === currentConversationId) {
        setAllMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      }
    },
    [currentConversationId],
  );

  useEffect(() => {
    if (!socket || !currentConversationId || !user) {
      return;
    }

    socket.emit('join_conversation_room', {
      conversationId: currentConversationId,
    });

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user, currentConversationId, handleReceiveMessage]);

  const flatListRef = useRef(null);
  const allMessagesRef = useRef([]);
  const memoizedMessages = useMemo(() => allMessages, [allMessages]);

  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleOfferAcceptedWrapper = data => {
      handleOfferAccepted(data, allMessagesRef.current);
      setIsAcceptingOffer(false);
      setShowViewOfferModal(false);
      setOfferObject(null);
      fetchAllMessages();
    };

    const handleOfferErrorWrapper = error => {
      setIsAcceptingOffer(false);
    };

    socket.on('offer_accepted', handleOfferAcceptedWrapper);
    socket.on('accept_offer_error', handleOfferErrorWrapper);

    return () => {
      socket.off('offer_accepted', handleOfferAcceptedWrapper);
      socket.off('accept_offer_error', handleOfferErrorWrapper);
    };
  }, [socket, handleOfferAccepted]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConversationBlocked = payload => {
      const currentConversationId =
        conversation?.conversationId || conversation?._id;
      const payloadConversationId = payload?.conversationId || payload?._id;
      if (
        !currentConversationId ||
        currentConversationId !== payloadConversationId
      ) {
        return;
      }

      setConversation(prev => ({
        ...prev,
        isBlocked: true,
        blockedBy: payload?.blockedBy,
        blockedByRefrence: payload?.blockedByRefrence,
        ...(payload?.isReported && {
          isReported: true,
          reportedBy: payload?.reportedBy,
          reportedByRefrence: payload?.reportedByRefrence,
        }),
      }));
    };

    const handleConversationUnblocked = payload => {
      const currentConversationId =
        conversation?.conversationId || conversation?._id;
      const payloadConversationId = payload?.conversationId || payload?._id;
      if (
        !currentConversationId ||
        currentConversationId !== payloadConversationId
      ) {
        return;
      }

      setConversation(prev => ({
        ...prev,
        isBlocked: false,
        blockedBy: null,
        blockedByRefrence: null,
        isReported: false,
        reportedBy: null,
        reportedByRefrence: null,
      }));
    };

    socket.on('conversation_blocked', handleConversationBlocked);
    socket.on('conversation_unblocked', handleConversationUnblocked);

    return () => {
      socket.off('conversation_blocked', handleConversationBlocked);
      socket.off('conversation_unblocked', handleConversationUnblocked);
    };
  }, [socket, conversation?.conversationId, conversation?._id]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('user_typing', ({senderId}) => {
      setIsTyping(true);
      scrollToBottom();
    });

    socket.on('user_stop_typing', ({senderId}) => {
      setIsTyping(false);
      scrollToBottom();
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket]);

  const scrollToBottom = () => {
    if (!flatListRef.current || !allMessages.length) {
      return;
    }

    const lastIndex = allMessages.length - 1;

    try {
      flatListRef.current.scrollToIndex({
        index: lastIndex,
        animated: true,
        viewPosition: 1,
      });
    } catch (err) {
      // fallback if the list hasn't measured layout yet
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  useEffect(() => {
    // Ensure scroll happens after render
    const handle = setTimeout(() => scrollToBottom(), 20);
    return () => clearTimeout(handle);
  }, [allMessages]);

  const commonEmojis = [
    '😀',
    '😂',
    '😍',
    '😎',
    '👍',
    '🎉',
    '🙏',
    '🥳',
    '😢',
    '🔥',
    '❤️',
    '😇',
    '🤔',
    '😅',
    '🙌',
    '👏',
    '😡',
  ];

  const handleSelectEmoji = emoji => {
    setMessageText(prev => prev + emoji);
  };

  const fetchAllMessages = async () => {
    if (!currentConversationId || !user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await messageService.getAllMessages(
        currentConversationId,
        user?.id,
      );

      const responseMessages = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      const isValidMessagesResponse =
        response?.success ||
        Array.isArray(response?.data) ||
        Array.isArray(response);

      if (isValidMessagesResponse) {
        setAllMessages(responseMessages);
        setIsError(false);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageTime = timestamp => {
    if (!timestamp) {
      return '';
    }

    const messageTime = moment(timestamp);
    const now = moment();

    // Agar same din ka message hai
    if (messageTime.isSame(now, 'day')) {
      return `${localizedText.todayAt} ${messageTime.format('hh:mm A')}`;
    }

    // Agar kal ka message hai
    if (messageTime.isSame(moment().subtract(1, 'day'), 'day')) {
      return `${localizedText.yesterdayAt} ${messageTime.format('hh:mm A')}`;
    }

    // Agar iss week me hai
    if (messageTime.isAfter(moment().subtract(7, 'days'))) {
      return `${messageTime.format('dddd')} ${localizedText.at} ${messageTime.format(
        'hh:mm A',
      )}`;
    }

    // Agar purana hai
    return messageTime.format(
      `MMM DD, YYYY [${localizedText.at}] hh:mm A`,
    );
  };

  const onViewOffer = offerObject => {
    setOfferObject(offerObject);
    setShowViewOfferModal(true);
  };

  const handleCloseOfferModal = () => {
    // Web behavior: while accept request is in-flight, keep modal open.
    if (isAcceptingOffer) {
      return;
    }
    setShowViewOfferModal(false);
    setOfferObject(null);
    fetchAllMessages();
  };

  const handleAcceptOffer = (
    obj,
    evenlyoProtectByItem = [],
    selectedItems = [],
  ) => {
    const hasSelection = selectedItems.some(Boolean);
    if (!hasSelection) {
      return;
    }

    setIsAcceptingOffer(true);

    const items = (obj?.items || []).map((offerItem, idx) => {
      const isProtectEnabled = Boolean(evenlyoProtectByItem[idx]);
      const protectFee = isProtectEnabled
        ? Number(offerItem?.pricingBreakdown?.evenlyoProtectFee || 0)
        : 0;
      const baseTotal = Number(offerItem?.pricingBreakdown?.total || 0);
      const subTotal = Number(obj?.subtotal || 0);
      const rawDistanceKm = Number(offerItem?.distanceKm || 0);
      const pricePerKm = Number(offerItem?.pricing?.pricePerKm || 0);
      const distanceCost = Number(
        offerItem?.pricingBreakdown?.distanceCost ||
          offerItem?.distanceCost ||
          0,
      );
      const derivedDistanceKm =
        rawDistanceKm > 0
          ? rawDistanceKm
          : pricePerKm > 0 && distanceCost > 0
          ? distanceCost / pricePerKm
          : 0;
      const safeDistanceKm =
        offerItem?.type === 'booking'
          ? Number((derivedDistanceKm > 0 ? derivedDistanceKm : 0.1).toFixed(2))
          : rawDistanceKm;

      return {
        ...offerItem,
        distanceKm: safeDistanceKm,
        offerStatus: selectedItems[idx] ? 'ACCEPTED' : 'REJECTED',
        pricingBreakdown: {
          ...offerItem?.pricingBreakdown,
          evenlyoProtectFee: protectFee,
          total: baseTotal + protectFee,
          subtotal: subTotal,
        },
      };
    });

    const totalProtectFee = items.reduce(
      (sum, i) => sum + Number(i?.pricingBreakdown?.evenlyoProtectFee || 0),
      0,
    );
    const itemsTotal = items.reduce(
      (sum, i) => sum + Number(i?.pricingBreakdown?.total || 0),
      0,
    );
    const subTotal = Number(obj?.subtotal || 0);

    const finalObject = {
      ...obj,
      userId: user?.id,
      items,
      status: 'ACCEPTED',
      finalTotal: itemsTotal,
      pricingBreakdown: {
        ...obj?.pricingBreakdown,
        evenlyoProtectFee: totalProtectFee,
        total: itemsTotal,
        subtotal: subTotal,
      },
    };

    socket?.emit?.('accept_offer', finalObject);

    // Fallback: if socket success event is delayed/missed, poll latest messages
    // and close modal once this offer is marked ACCEPTED on server.
    const targetOfferId = finalObject?.uniqueId;
    let attempts = 0;
    const maxAttempts = 5;
    const intervalId = setInterval(async () => {
      attempts += 1;
      try {
        const response = await messageService.getAllMessages(
          currentConversationId,
          user?.id,
        );
        if (response?.success) {
          const latestMessages = response?.data || [];
          setAllMessages(latestMessages);
          const acceptedOfferMessage = latestMessages.find(
            msg =>
              msg?.offerObject?.uniqueId === targetOfferId &&
              msg?.offerObject?.status === 'ACCEPTED',
          );
          if (acceptedOfferMessage) {
            clearInterval(intervalId);
            setIsAcceptingOffer(false);
            setShowViewOfferModal(false);
            setOfferObject(null);
            return;
          }
        }
      } catch (error) {}

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 1200);
  };

  const renderMessage = useCallback(
    ({item}) => {
      const isOwn = item.senderId === user?.id;
      const isOfferMessage = Boolean(item?.isOffer || item?.offerObject);
      const offerObjectData = item?.offerObject || {};
      const firstOfferItem = offerObjectData?.items?.[0] || {};
      const offerTitle =
        currentLanguage === 'en'
          ? firstOfferItem?.title?.en
          : firstOfferItem?.title?.nl;
      const offerDisplayPrice =
        firstOfferItem?.offerPrice ||
        firstOfferItem?.pricingBreakdown?.offerPrice ||
        firstOfferItem?.pricingBreakdown?.subtotal ||
        firstOfferItem?.discountedPrice ||
        0;
      const offerFinalTotal =
        offerObjectData?.finalTotal || offerDisplayPrice || 0;
      const offerStatus = offerObjectData?.status || 'PENDING';
      const offerImage =
        firstOfferItem?.images?.[0] ||
        firstOfferItem?.image ||
        firstOfferItem?.featuredImage;

      const isImage =
        item?.attachment?.type?.startsWith?.('image') ||
        item?.attachment?.type === 'image' ||
        item?.attachment?.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
      const isPDF =
        item?.attachment?.type === 'file' ||
        item?.attachment?.url?.endsWith('.pdf');

      console.log(item, 'itemitemitemitemitemitemitem');

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
                source={
                  conversation?.participants?.vendor?.photo &&
                  String(conversation.participants.vendor.photo).trim()
                    ? {
                        uri: String(
                          conversation.participants.vendor.photo,
                        ).trim(),
                      }
                    : ICONS.userIcon
                }
                style={styles.messageAvatar}
              />
            )}

            {isOwn ? (
              isImage && item?.attachment?.url && !item?.isPending ? (
                <View
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
                </View>
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
                    {item?.isPending ? (
                      <Text style={styles.sendingText}>{localizedText.sending}</Text>
                    ) : isPDF ? (
                      <View style={styles.myMessagePdf}>
                        <Icon name="file-pdf-box" size={28} color="#FF0000" />
                        <Text style={styles.myMessagePdfName} numberOfLines={1}>
                          {item?.attachment?.name || localizedText.pdfDocument}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.myMessageText}>{item.message}</Text>
                    )}
                  </View>
                </View>
              )
            ) : (
              <View style={styles.otherMessageBubble}>
                {isImage && (
                  <Image
                    source={{uri: item?.attachment?.url}}
                    resizeMode="contain"
                    style={{height: 180, width: '100%', borderRadius: width(5)}}
                  />
                )}
                {isPDF && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      backgroundColor: '#f4f4f4',
                      borderRadius: width(2),
                    }}>
                    <Icon name="file-pdf-box" size={28} color="#FF0000" />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: 'bold',
                        color: '#000',
                        maxWidth: width(60),
                      }}
                      numberOfLines={1}>
                      {item?.attachment?.name || localizedText.pdfDocument}
                    </Text>
                  </View>
                )}
                {!item?.attachment && (
                  <Text style={[styles.myMessageText, {color: COLORS.black}]}>
                    {item.message}
                  </Text>
                )}
                {isOfferMessage && (
                  <View style={styles.offerMessageCard}>
                    <View style={styles.offerMessageHeader}>
                      <View style={styles.offerMessageIconWrap}>
                        <Image
                          source={ICONS.giftIcon || ICONS.cartIcon}
                          style={styles.offerMessageIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.offerMessageHeaderText}>
                        {localizedText.customOffer}
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
                          €{Number(offerDisplayPrice || 0).toFixed(0)}
                        </Text>
                        <Text style={styles.offerMessageItemStatus}>
                          {localizedText.status}: {offerStatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.offerMessageDivider} />
                    <View style={styles.offerMessageTotalRow}>
                      <Text style={styles.offerMessageTotalLabel}>
                        {localizedText.total}
                      </Text>
                      <Text style={styles.offerMessageTotalAmount}>
                        €{Number(offerFinalTotal || 0).toFixed(0)}
                      </Text>
                    </View>
                    <Text style={styles.offerMessageSubText}>
                      {localizedText.validFor24Hours}
                    </Text>
                    <Text style={styles.offerMessageSubText}>
                      {localizedText.status}: {offerStatus}
                    </Text>

                    {offerStatus === 'ACCEPTED' ? (
                      <View style={styles.clientOfferAcceptedBtn}>
                        <Text style={styles.clientOfferAcceptedBtnText}>
                          {localizedText.accepted}
                        </Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#FF295D', '#E31B95', '#7A3FF2']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.offerViewBtnGradient}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.offerViewBtn}
                          onPress={() => onViewOffer(offerObjectData)}>
                          <Text style={styles.offerViewBtnText}>
                            {localizedText.viewAcceptOffer}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                  </View>
                )}
              </View>
            )}

            {isOwn && (
              <Image
                resizeMode="contain"
                source={
                  user?.profileImage && String(user.profileImage).trim()
                    ? {uri: String(user.profileImage).trim()}
                    : ICONS.userIcon
                }
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
    [user?.id, conversation?.participants?.vendor?.photo, currentLanguage],
  );

  const handleSend = async e => {
    e.preventDefault();

    if (isError) {
      return;
    }
    if (!messageText.trim() && !attachedFile) {
      return;
    }

    const receiverId = conversation?.participants?.vendor?.userId;
    const conversationType = 'user-to-vendor';

    // 🆕 Set Temporary local message for optimistic UI
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = {
      _id: tempId,
      conversationId: currentConversationId,
      senderId: user?.id,
      receiverId,
      senderRole: 'user',
      receiverRole: 'vendor',
      senderRefrence: 'User',
      receiverRefrence: 'Vendor',
      message: messageText || '',
      conversationType,
      timestamp: new Date().toISOString(),
      isPending: true,
      ...(attachedFile && {attachment: {name: attachedFile.name}}),
    };

    setAllMessages(prev => [...prev, tempMessage]);

    setTimeout(() => {
      scrollToBottom();
    }, 100);

    setMessageText('');
    setAttachedFile(null);

    try {
      let fileUrl = null;

      if (attachedFile) {
        fileUrl = await helper.uploadMediaToCloudinary(attachedFile);
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

      // Send via socket
      socket.emit('send_message', finalMessage);

      setAllMessages(prev =>
        prev.map(msg => (msg._id === tempId ? finalMessage : msg)),
      );
    } catch (error) {
      //   message as failed
      setAllMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? {...msg, isPending: false, error: true} : msg,
        ),
      );
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: localizedText.storagePermissionTitle,
          message: localizedText.storagePermissionMsg,
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUpload = async setter => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel || response.errorCode) {
        if (response.errorMessage) {
          Alert.alert(localizedText.error, response.errorMessage);
        }
        return;
      }

      const asset = response?.assets?.[0];
      if (!asset) {
        return;
      }

      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
        size: asset.fileSize,
      };

      setter(file);
    });
  };

  const handleSelectFile = useCallback(async () => {
    try {
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
        Alert.alert(localizedText.fileSelected, selectedFile.name);
      }
    } catch (error) {
      if (error?.message?.includes('canceled')) {
        return;
      }
      console.log('Document Picker Error:', error);
      Alert.alert(localizedText.error, localizedText.selectFileFailed);
    }
  }, []);

  const isBlockedByMe =
    conversation?.blockedBy && conversation?.blockedByRefrence === 'User';

  const menuContent = [
    {icon: ICONS.deleteIcon, title: localizedText.deleteChat},
    {
      icon: ICONS.viewIcon,
      title: isBlockedByMe
        ? localizedText.unblockVendor
        : localizedText.blockVendor,
    },
    {icon: ICONS.editGridientIcon, title: localizedText.reportVendor},
  ];

  const handleSelectOption = type => {
    if (type === localizedText.deleteChat) {
      modalRef.current.show({
        status: 'alert',
        message:
          localizedText.deleteChatConfirm,
        handlePressOk: () => {
          modalRef.current.hide();
          handleDeleteChat();
        },
      });
    } else if (type === localizedText.blockVendor) {
      modalRef.current.show({
        status: 'alert',
        message:
          localizedText.blockVendorConfirm,
        handlePressOk: () => {
          modalRef.current.hide();
          handleBlockConversation();
        },
      });
    } else if (type === localizedText.unblockVendor) {
      modalRef.current.show({
        status: 'alert',
        message:
          localizedText.unblockVendorConfirm,
        handlePressOk: () => {
          modalRef.current.hide();
          handleUnblockConversation();
        },
      });
    } else if (type === localizedText.reportVendor) {
      setVisible(true);
    }
  };

  const handleBlockConversation = async () => {
    try {
      setRefreshing(true);
      const conversationId = conversation?._id || conversation?.conversationId;
      const response = await conversationService.blockConversation(
        conversationId,
        {userId: user?.id, userType: 'User'},
      );

      if (response?.success) {
        setConversation(prev => ({
          ...prev,
          isBlocked: true,
          blockedBy: user?.id,
          blockedByRefrence: 'User',
        }));

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
      console.log(error, 'error blocking conversation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnblockConversation = async () => {
    try {
      setRefreshing(true);
      const conversationId = conversation?._id || conversation?.conversationId;
      const response = await conversationService.unblockConversation(
        conversationId,
      );

      if (response?.success) {
        setConversation(prev => ({
          ...prev,
          isBlocked: false,
          blockedBy: null,
          blockedByRefrence: null,
          isReported: false,
          reportedBy: null,
          reportedByRefrence: null,
        }));

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
      console.log(error, 'error unblocking conversation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteChat = async () => {
    try {
      setRefreshing(true);
      const response = await messageService.deleteMessage(
        currentConversationId,
        user?.id,
      );

      if (response?.success) {
        navigation.goBack();
      }
    } catch (error) {
      console.log(error, 'error deleting conversation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleReport = async reason => {
    try {
      setRefreshing(true);
      const conversationId = conversation?._id || conversation?.conversationId;
      const response = await conversationService.reportConversation(
        conversationId,
        {
          userId: user?.id,
          userType: 'User',
          reportReason: reason,
          reporter: conversation?.participants?.user?.name,
          reportedPerson: conversation?.participants?.vendor?.name,
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
      console.log(error, 'error reporting conversation');
    } finally {
      setRefreshing(false);
    }
  };

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
            Icon: conversation?.participants?.vendor?.photo || null,
            name: vendorDisplayName,
            lastSeen: 'Thanks for the quick res....',
          }}
        />
        <FlatList
          ref={flatListRef}
          data={memoizedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item._id || item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: width(2),
            paddingBottom: width(4),
          }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => setTimeout(scrollToBottom, 20)}
        />

        {conversation?.isBlocked ? (
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
                ? localizedText.blockedByMe
                : localizedText.blockedByVendor}
            </Text>
          </View>
        ) : (
          <>
            {attachedFile && attachedFile?.type?.startsWith('image') && (
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

            {attachedFile && !attachedFile?.type?.startsWith('image') && (
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
                  <Text style={{color: 'red'}}>{localizedText.remove}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.inputWrapper,
                {flexDirection: 'column', paddingBottom: insets.bottom},
              ]}>
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
                    placeholder={localizedText.messageToVendor}
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

                        margin: 4,
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
      <NewRequestModal
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(!showRequestModal)}
        navigation={navigation}
      />
      <CustomOfferModal
        offerObject={offerObject}
        isVisible={showViewOfferModal}
        onClose={handleCloseOfferModal}
        onAccept={(evenlyoProtectByItem, selectedItems) =>
          handleAcceptOffer(offerObject, evenlyoProtectByItem, selectedItems)
        }
        isAccepting={isAcceptingOffer}
        navigation={navigation}
      />
      <ReportUserModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSubmit={handleReport}
        userName={vendorDisplayName}
      />
      <EmojiPickerPopup
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        emojis={commonEmojis}
        onSelectEmoji={handleSelectEmoji}
      />
    </View>
  );
};

const {width: screenWidth} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {flex: 1},
  messagesList: {flex: 1},
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: width(1.5),
    paddingHorizontal: width(2),
  },
  myMessageContainer: {justifyContent: 'flex-end', alignSelf: 'flex-end'},
  otherMessageContainer: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: width(8),
    height: width(8),
    marginHorizontal: width(2),
    borderRadius: width(4),
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
  myMessagePdf: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: width(3),
  },
  myMessagePdfName: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#000',
    maxWidth: width(60),
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderRadius: width(3),
    padding: width(2.5),
  },
  myMessageText: {color: '#FFF', fontSize: 14},
  otherMessageText: {color: '#333', fontSize: 14},
  messageTime: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    width: width(72),
    alignSelf: 'center',
  },
  myMessageTime: {textAlign: 'right', marginRight: width(1)},
  otherMessageTime: {textAlign: 'left', marginLeft: width(1)},
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
  emojiText: {
    fontSize: Math.max(20, screenWidth * 0.05),
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    paddingHorizontal: width(4),
  },
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
  clientOfferAcceptedBtn: {
    marginTop: width(3),
    marginBottom: width(1),
    borderWidth: 1,
    borderColor: '#9BE7B1',
    backgroundColor: '#E9F9EE',
    borderRadius: width(2),
    paddingVertical: width(2.6),
  },
  clientOfferAcceptedBtnText: {
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: '#198754',
  },
});

export default ChatDetail;
