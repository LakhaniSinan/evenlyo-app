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
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import ChatCard from '../../../components/chatCard';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {messageService} from '../../../services/Chat';

const messagesData = [
  {
    id: '1',
    text: 'Hi! I wanted to follow up on our previous discussion about the project timeline.',
    isMe: false,
    time: '12:30 AM',
  },
  {
    id: '2',
    text: "Hello! Of course, I've been working on the revised timeline. Let me share the updated schedule with you.",
    isMe: true,
    time: '10:32 AM',
  },
  {
    id: '3',
    text: 'That sounds great! When can we schedule the next meeting?',
    isMe: false,
    time: '10:35 AM',
  },
];

const ChatDetail = ({navigation, route}) => {
  const data = route.params;
  const {socket} = useContext(SocketContext);
  const {user} = useSelector(state => state.LoginSlice);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

  const renderMessage = useCallback(
    ({item}) => {
      const isOwn = item.senderId === user?.id;
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
                source={{uri: data?.participants?.vendor?.photo}}
                style={styles.messageAvatar}
              />
            )}

            {isOwn ? (
              <ChatCard style={styles.myMessageBubble}>
                {item?.attachment ? (
                  <Image
                    source={{uri: item?.attachment?.url}}
                    resizeMode="contain"
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

      // ✅ Update local state (replace temp message with final one)
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
          // ListFooterComponent={
          //   <View
          //     style={{
          //       marginVertical: width(3),
          //       marginHorizontal: width(3),
          //       padding: width(4),
          //       backgroundColor: COLORS.white,
          //       borderRadius: 14,
          //       shadowColor: '#000',
          //       shadowOffset: {
          //         width: 0,
          //         height: 2,
          //       },
          //       shadowOpacity: 0.25,
          //       shadowRadius: 3.84,
          //       elevation: 5,
          //     }}>
          //     <View style={{flexDirection: 'row'}}>
          //       <Image
          //         source={IMAGES.profilePhoto}
          //         style={{
          //           height: width(13),
          //           width: width(13),
          //           borderRadius: 100,
          //         }}
          //       />
          //       <View style={{margin: width(2)}}>
          //         <Text
          //           style={{
          //             fontFamily: fontFamly.PlusJakartaSansBold,
          //             fontSize: 12,
          //             color: COLORS.textDark,
          //           }}>
          //           Sarah Johnson
          //         </Text>
          //         <Text
          //           style={{
          //             fontFamily: fontFamly.PlusJakartaSansBold,
          //             fontSize: 10,
          //             color: COLORS.textLight,
          //           }}>
          //           Thanks for the quick res....{' '}
          //         </Text>
          //       </View>
          //     </View>
          //     <Text
          //       style={{
          //         marginTop: width(3),
          //         fontFamily: fontFamly.PlusJakartaSansBold,
          //         fontSize: 12,
          //         color: COLORS.textDark,
          //       }}>
          //       New Offer Send
          //     </Text>
          //     <Text
          //       style={{
          //         fontFamily: fontFamly.PlusJakartaSansBold,
          //         fontSize: 10,
          //         color: COLORS.textLight,
          //       }}>
          //       With over 7 years of event experience, DJ Ray...
          //     </Text>
          //     <View
          //       style={{
          //         flexDirection: 'row',
          //         alignItems: 'baseline',
          //         marginVertical: width(3),
          //       }}>
          //       <Text
          //         style={{
          //           fontFamily: fontFamly.PlusJakartaSansBold,
          //           fontSize: 14,
          //           color: COLORS.textDark,
          //         }}>
          //         $300
          //       </Text>
          //       <Text
          //         style={{
          //           fontFamily: fontFamly.PlusJakartaSansBold,
          //           fontSize: 9,
          //           color: COLORS.textLight,
          //         }}>
          //         /Day
          //       </Text>
          //     </View>
          //     <GradientButton
          //       text="View Detail"
          //       onPress={() => onContinueToShipping()}
          //       type="filled"
          //       textStyle={styles.sendRequestText}
          //     />
          //   </View>
          // }
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
