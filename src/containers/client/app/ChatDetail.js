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
import {pick, types} from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import EmojiPickerPopup from '../../../components/emojiModal';
import ReportUserModal from '../../../components/reportClient';
import GradientButton from '../../../components/button';
import ChatCard from '../../../components/chatCard';
import CustomOfferModal from '../../../components/modals/CustomOffers';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {conversationService, messageService} from '../../../services/Chat';

const ChatDetail = ({navigation, route}) => {
  const modalRef = useRef();
  const data = route.params;
  const {socket} = useContext(SocketContext);
  const [visible, setVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const {t, currentLanguage} = useTranslation();
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
    if (user && conversation?.conversationId) {
      fetchAllMessages();
    }
  }, [user, conversation?.conversationId]);

  useEffect(() => {
    if (socket && user && conversation?.participants?.vendor?.userId) {
      socket.emit('reset_unread_count', {
        conversationId: conversation?.conversationId,
        userType: 'user',
        userId: user?.id,
      });
    }
  }, [conversation?.participants?.vendor?.userId, socket, allMessages]);

  const handleReceiveMessage = useCallback(
    newMessage => {
      setIsTyping(false);
      if (newMessage.conversationId === conversation?.conversationId) {
        setAllMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      }
    },
    [conversation?.conversationId],
  );

  useEffect(() => {
    if (!socket || !conversation?.participants?.vendor?.userId || !user) {
      return;
    }

    socket.emit('join_conversation_room', {
      conversationId: conversation?.conversationId,
    });

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [
    socket,
    user,
    conversation?.conversationId,
    conversation?.participants?.vendor?.userId,
    handleReceiveMessage,
  ]);

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
    };

    const handleOfferErrorWrapper = error => {
      // toast.error('Something went wrong while accepting the offer');
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
    try {
      setIsLoading(true);
      const response = await messageService.getAllMessages(
        conversation?.conversationId,
        user?.id,
      );

      console.log(response, 'responseresponseresponseresponseresponseasdw');

      if (response?.success) {
        setAllMessages(response.data);
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
      return `Today at ${messageTime.format('hh:mm A')}`;
    }

    // Agar kal ka message hai
    if (messageTime.isSame(moment().subtract(1, 'day'), 'day')) {
      return `Yesterday at ${messageTime.format('hh:mm A')}`;
    }

    // Agar iss week me hai
    if (messageTime.isAfter(moment().subtract(7, 'days'))) {
      return `${messageTime.format('dddd')} at ${messageTime.format(
        'hh:mm A',
      )}`;
    }

    // Agar purana hai
    return messageTime.format('MMM DD, YYYY [at] hh:mm A');
  };

  const onViewOffer = offerObject => {
    setOfferObject(offerObject);
    setShowViewOfferModal(true);
  };

  const renderMessage = useCallback(
    ({item}) => {
      const isOwn = item.senderId === user?.id;
      const isOffer = item.isOffer;

      const isImage =
        item?.attachment?.type?.startsWith('image') ||
        item?.attachment?.url?.endsWith('.jpg') ||
        item?.attachment?.url?.endsWith('.png') ||
        item?.attachment?.url?.endsWith('.jpeg');
      const isPDF =
        item?.attachment?.type === 'file' ||
        item?.attachment?.url?.endsWith('.pdf');

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
                source={{uri: conversation?.participants?.vendor?.photo}}
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
                {item?.isPending ? (
                  <Text style={styles.sendingText}>Sending...</Text>
                ) : isImage ? (
                  <Image
                    source={{uri: item?.attachment?.url}}
                    resizeMode="contain"
                    style={{height: 300, width: '100%', borderRadius: width(5)}}
                  />
                ) : isPDF ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      backgroundColor: '#fff',
                      borderRadius: width(3),
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
                      {item?.attachment?.name || 'PDF Document'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.myMessageText}>{item.message}</Text>
                )}
              </LinearGradient>
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
                      {item?.attachment?.name || 'PDF Document'}
                    </Text>
                  </View>
                )}
                {!item?.attachment && (
                  <Text style={[styles.myMessageText, {color: COLORS.black}]}>
                    {item.message}
                  </Text>
                )}
                {isOffer && (
                  <View style={{}}>
                    <Text
                      style={{
                        color: COLORS.black,
                        fontFamily: fontFamly.PlusJakartaSansBold,
                        fontSize: 16,
                        textAlign: 'center',
                      }}>
                      Custom Offer
                    </Text>
                    {item?.offerObject?.items?.map(vall => {
                      return (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: width(2),
                            backgroundColor: COLORS.white,
                            borderRadius: width(4),
                          }}>
                          <View
                            style={{
                              height: width(15),
                              width: width(15),
                              borderRadius: width(4),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Image
                              style={{height: '60%', width: '60%'}}
                              source={{uri: vall?.images?.[0]}}
                              resizeMode="contain"
                            />
                          </View>
                          <View>
                            <Text
                              style={{
                                fontFamily: fontFamly.PlusJakartaSansBold,
                                fontSize: 12,
                                marginLeft: width(2),
                                color: COLORS.black,
                              }}>
                              {currentLanguage == 'en'
                                ? vall?.title?.en
                                : vall?.title?.nl}
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontFamily: fontFamly.PlusJakartaSansMedium,
                                  fontSize: 12,
                                  marginLeft: width(2),
                                  color: COLORS.green,
                                }}>
                                {vall?.discount}%
                              </Text>
                              <Text
                                style={{
                                  marginLeft: width(2),
                                  color: COLORS.primary,
                                }}>
                                $ {item?.offerObject?.finalTotal}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: width(2),
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontFamily: fontFamly.PlusJakartaSansBold,
                          fontSize: 16,
                          marginLeft: width(2),
                          color: COLORS.black,
                        }}>
                        Discount Amount
                      </Text>
                      <Text
                        style={{
                          fontFamily: fontFamly.PlusJakartaSansBold,
                          fontSize: 16,
                          marginLeft: width(2),
                          color: COLORS.black,
                        }}>
                        ${item?.offerObject?.totalDiscount}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: fontFamly.PlusJakartaSansBold,
                        fontSize: 12,
                        marginLeft: width(2),
                        color: COLORS.textLight,
                      }}>
                      Valid for 24 hours
                    </Text>
                    <View style={{height: width(2)}} />
                    {offerObject?.status == 'ACCEPTED' ? (
                      <View
                        style={{
                          marginBottom: width(2),
                          borderWidth: 1,
                          borderColor: COLORS.green,
                          backgroundColor: '#EFFFF2', // light green background
                          borderRadius: width(2),
                          paddingVertical: width(2),
                        }}>
                        <Text
                          style={{
                            fontFamily: fontFamly.PlusJakartaSansBold,
                            fontSize: 14,
                            color: COLORS.green,
                            textAlign: 'center',
                          }}>
                          ACCEPTED
                        </Text>
                      </View>
                    ) : (
                      <GradientButton
                        text={'View & Accept Offer'}
                        onPress={() => onViewOffer(item?.offerObject)}
                      />
                    )}
                  </View>
                )}
              </View>
            )}

            {isOwn && (
              <Image
                source={{uri: user.profileImage}}
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
    [user?.id, conversation?.participants?.vendor?.photo],
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
      conversationId: conversation?.conversationId,
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
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to select media',
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
          Alert.alert('Error', response.errorMessage);
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
        Alert.alert('File Selected', selectedFile.name);
      }
    } catch (error) {
      if (error?.message?.includes('canceled')) {
        return;
      }
      console.log('Document Picker Error:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  }, []);

  const isBlockedByMe =
    conversation?.blockedBy && conversation?.blockedByRefrence === 'User';

  const menuContent = [
    {icon: ICONS.deleteIcon, title: 'Delete Chat'},
    {
      icon: ICONS.viewIcon,
      title: isBlockedByMe ? 'Unblock Vendor' : 'Block Vendor',
    },
    {icon: ICONS.editGridientIcon, title: 'Report Vendor'},
  ];

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
    } else if (type === 'Block Vendor') {
      modalRef.current.show({
        status: 'alert',
        message:
          'Are you sure you want to block this vendor? You will no longer be able to send or receive messages from them until you unblock.',
        handlePressOk: () => {
          modalRef.current.hide();
          handleBlockConversation();
        },
      });
    } else if (type === 'Unblock Vendor') {
      modalRef.current.show({
        status: 'alert',
        message:
          'Do you want to unblock this vendor? You will be able to send and receive messages again.',
        handlePressOk: () => {
          modalRef.current.hide();
          handleUnblockConversation();
        },
      });
    } else if (type === 'Report Vendor') {
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
        conversation?.conversationId,
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
      <KeyboardAvoidingView style={styles.container}>
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
            Icon: conversation?.participants?.vendor?.photo,
            name: conversation?.participants?.vendor?.name,
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
          }}
          onContentSizeChange={() => setTimeout(scrollToBottom, 20)}
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
              You have blocked this vendor. You can’t send messages.
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
                  <Text style={{color: 'red'}}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.inputWrapper, {flexDirection: 'column'}]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: width(2),
                }}>
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
                    placeholder={t(
                      `Reply to ${conversation?.participants?.vendor?.name} here...`,
                    )}
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
      <NewRequestModal
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(!showRequestModal)}
        navigation={navigation}
      />
      <CustomOfferModal
        offerObject={offerObject}
        isVisible={showViewOfferModal}
        onClose={() => setShowViewOfferModal(!showViewOfferModal)}
        navigation={navigation}
      />
      <CommonAlert ref={modalRef} />
      <ReportUserModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSubmit={handleReport}
        userName={conversation?.participants?.vendor?.name}
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
    alignItems: 'flex-start',
    marginVertical: width(1),
  },
  myMessageContainer: {justifyContent: 'flex-end'},
  otherMessageContainer: {justifyContent: 'flex-start'},
  messageAvatar: {
    width: width(8),
    height: width(8),
    marginHorizontal: width(2),
    borderRadius: width(4),
  },
  myMessageBubble: {
    width: width(70),
    marginTop: width(3),
    padding: width(3),
    borderTopLeftRadius: width(6),
    borderBottomLeftRadius: width(6),
    borderBottomRightRadius: width(6),
  },
  otherMessageBubble: {
    backgroundColor: COLORS.backgroundLight,
    width: width(70),
    padding: width(3),
    marginTop: width(3),
    borderTopRightRadius: width(6),
    borderBottomLeftRadius: width(6),
    borderBottomRightRadius: width(6),
  },
  myMessageText: {color: COLORS.white, fontSize: 12},
  otherMessageText: {color: COLORS.textDark, fontSize: 12},
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
    padding: width(2),
    justifyContent: 'space-between',
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: width(3),
    height: width(11),
    width: width(11),
    borderWidth: 1,
    borderColor: COLORS.textLight,
    marginLeft: width(1),
  },
  emojiText: {
    fontSize: Math.max(20, screenWidth * 0.05),
  },
  textInput: {
    width: width(52),
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    minHeight: width(11),
    paddingHorizontal: width(5),
  },
  inputInner: {
    flexDirection: 'row',
    // alignItems: 'center',
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
});

export default ChatDetail;
