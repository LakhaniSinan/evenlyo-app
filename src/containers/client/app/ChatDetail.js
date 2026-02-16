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
import {useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import ChatCard from '../../../components/chatCard';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {messageService} from '../../../services/Chat';
import GradientButton from '../../../components/button';
import CustomOfferModal from '../../../components/modals/CustomOffers';
const ChatDetail = ({navigation, route}) => {
  const data = route.params;
  const {socket} = useContext(SocketContext);
  const {user} = useSelector(state => state.LoginSlice);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showViewOfferModal, setShowViewOfferModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {t, currentLanguage} = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [offerObject, setOfferObject] = useState(null);

  useEffect(() => {
    if (socket && user) {
      socket.emit('user_connected', {userId: user.id});

      const handleEmitNewConversation = data => {
        setAllConversations(prev => updateConversations(prev, data));
      };

      socket.on('new_conversation', handleEmitNewConversation);

      // socket.on('conversation_blocked', handleEmitBlockedConversation);

      // socket.on('conversation_unblocked', handleEmitUnblockedConversation);

      return () => {
        socket.off('new_conversation');
        socket.off('conversation_blocked');
        socket.off('conversation_unblocked');
      };
    }
  }, [
    user,
    socket,
    // handleEmitBlockedConversation,
    // handleEmitUnblockedConversation,
  ]);

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
    if (user && data?.conversationId) {
      fetchAllMessages();
    }
  }, [user, data?.participants?.vendor?.userId]);

  useEffect(() => {
    if (socket && user && data?.participants?.vendor?.userId) {
      socket.emit('reset_unread_count', {
        conversationId: data?.conversationId,
        userType: 'user',
        userId: user?.id,
      });
    }
  }, [data?.participants?.vendor?.userId, socket, allMessages]);

  const handleReceiveMessage = useCallback(
    newMessage => {
      setIsTyping(false);
      if (newMessage.conversationId === data?.conversationId) {
        setAllMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      }
    },
    [data?.conversationId],
  );

  useEffect(() => {
    if (!socket || !data?.participants?.vendor?.userId || !user) {
      return;
    }

    socket.emit('join_conversation_room', {
      conversationId: data?.conversationId,
    });

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user, data?.conversationId, handleReceiveMessage]);

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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [allMessages]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (showOptionsMenu && !event.target.closest('.options-menu')) {
        setShowOptionsMenu(false);
      }
    };

    // document.addEventListener('click', handleClickOutside);
    // return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptionsMenu]);

  const emojis = [
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
    }
  };
  const fetchAllMessages = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getAllMessages(
        data?.conversationId,
        user?.id,
      );

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

      console.log(isOffer ? item : '', 'asdkasdaskljdalksjjdlaskdjlasdkj');

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
                source={{uri: data?.participants?.vendor?.photo}}
                style={styles.messageAvatar}
              />
            )}

            {isOwn ? (
              <ChatCard style={styles.myMessageBubble}>
                {item?.attachment ? (
                  <Image
                    source={{uri: item?.attachment?.url}}
                    resizeMode="cover"
                    style={{height: '100%', width: '100%'}}
                  />
                ) : (
                  <Text style={styles.myMessageText}>{item.message}</Text>
                )}
              </ChatCard>
            ) : (
              <View style={styles.otherMessageBubble}>
                {item?.attachment && (
                  <Image
                    source={{uri: item?.attachment?.url}}
                    resizeMode="cover"
                    style={{height: 180, width: '100%', borderRadius: width(5)}}
                  />
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
    [user?.id, data?.participants?.vendor?.photo],
  );

  const handleSend = async e => {
    e.preventDefault();

    if (isError) {
      return;
    }
    if (!messageText.trim() && !attachedFile) {
      return;
    }

    const receiverId = data?.participants?.vendor?.userId;
    const conversationType = 'user-to-vendor';

    // 🆕 Set Temporary local message for optimistic UI
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = {
      _id: tempId,
      conversationId: data?.conversationId,
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

    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel || response.errorCode) {
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }
      const asset = response?.assets[0];
      if (!asset) {
        return;
      }
      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `upload.${asset.type.split('/')[1]}`,
      };
      try {
        setIsLoading(true);
        const uploadRes = await helper.uploadMediaToCloudinary(file);
        if (uploadRes?.secure_url) {
          setter(uploadRes?.secure_url);
        } else {
          Alert.alert('Error', 'Image upload failed. Please try again.');
        }
      } catch (err) {
        console.log('Upload error:', err);
        Alert.alert('Error', 'Something went wrong during upload.');
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.container}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          onLeftIconPress={() => navigation.goBack()}
          rightIcon={ICONS.menuIcon}
          onRightIconPress={() => {}}
          chatHeaderData={{
            Icon: data?.participants?.vendor?.photo,
            name: data?.participants?.vendor?.name,
            lastSeen: 'Thanks for the quick res....',
          }}
        />
        <FlatList
          data={memoizedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item._id || item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: width(2)}}
        />

        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiText}>😀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => handleUpload(setAttachedFile)}>
            <Image
              source={ICONS.attachmentIcon}
              style={{height: width(5), width: width(5)}}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.textLight,
              borderRadius: width(3),
              overflow: 'hidden',
            }}>
            <TextInput
              placeholder={t(
                `Reply to ${data?.participants?.vendor?.name} here...`,
              )}
              placeholderTextColor={COLORS.textLight}
              value={messageText}
              onChangeText={setMessageText}
              maxLength={500}
              style={styles.textInput}
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
    height: width(12),
    width: width(12),
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  emojiText: {fontSize: Math.max(20, screenWidth * 0.05)},
  textInput: {
    width: width(55),
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    height: width(12),
    paddingHorizontal: width(5),
  },
});

export default ChatDetail;
