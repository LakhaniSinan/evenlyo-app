import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import ChatCard from '../../../components/chatCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const messagesData = [
  {
    id: '1',
    text: 'Hi! I wanted to follow up on our previous discussion about the project timeline.',
    isMe: false,
    time: '12:30 AM',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
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
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  },
];

const ChatDetail = ({navigation, route}) => {
  const data = route.params;
  console.log(data, 'datadatadatadatadata');

  const {t} = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(messagesData);

  const chat = {
    name: 'Sarah Johnson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    isOnline: true,
    lastSeen: '2 minutes ago',
    typing: false,
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        isMe: true,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');

      setTimeout(() => {
        const replyMessage = {
          id: (Date.now() + 1).toString(),
          text: getRandomReply(),
          isMe: false,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar: chat.avatar,
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  const getRandomReply = () => {
    const replies = [
      "That's a great idea! 👍",
      "I'll look into that right away.",
      'Perfect timing! Let me check the details.',
      'Thanks for letting me know!',
      "I'm on it! Should have an update soon.",
      'That makes perfect sense.',
      "I'll get back to you with more info.",
      'Sounds good to me!',
      "I'll review this and get back to you.",
      'Excellent point!',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const renderMessage = ({item}) => {
    return (
      <View key={item?.id}>
        <View
          style={[
            styles.messageContainer,
            item.isMe
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}>
          {!item.isMe && (
            <Image source={IMAGES.profilePhoto} style={styles.messageAvatar} />
          )}

          {item.isMe ? (
            <ChatCard style={styles.myMessageBubble}>
              <Text style={styles.myMessageText}>{item.text}</Text>
            </ChatCard>
          ) : (
            <View style={styles.otherMessageBubble}>
              <Text style={styles.otherMessageText}>{item.text}</Text>
            </View>
          )}

          {item.isMe && (
            <Image source={IMAGES.profilePhoto} style={styles.messageAvatar} />
          )}
        </View>
        <Text
          style={[
            styles.messageTime,
            item.isMe ? styles.myMessageTime : styles.otherMessageTime,
          ]}>
          {item.time}
        </Text>
      </View>
    );
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
            Icon: IMAGES.profilePhoto,
            name: 'Sarah Johnson',
            lastSeen: 'Thanks for the quick res....',
          }}
        />
        <FlatList
          data={messagesData}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
          contentContainerStyle={{padding: width(2)}}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListFooterComponent={
            data?.offreShow && (
              <View
                style={{
                  padding: width(4),
                  backgroundColor: COLORS.backgroundLight,
                  shadowColor: '#000',
                  margin: width(3),
                  borderRadius: 14,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,

                  elevation: 5,
                }}>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    fontSize: 12,
                    color: COLORS.textDark,
                  }}>
                  New Offer Send
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    fontSize: 10,
                    color: COLORS.textLight,
                    marginTop: width(1),
                  }}>
                  With over 7 years of event experience, DJ Ray...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: width(1),
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: fontFamly.PlusJakartaSansBold,
                      color: COLORS.textDark,
                    }}>
                    $300
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      color: COLORS.textDark,
                    }}>
                    /Day
                  </Text>
                </View>
              </View>
            )
          }
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateCustomOffer')}
          style={{
            height: width(10),
            width: width(10),
            borderRadius: 12,
            position: 'absolute',
            bottom: width(18),
            right: width(3),
          }}>
          <Image
            source={ICONS.plusIcon}
            resizeMode="contain"
            style={{height: '100%', width: '100%'}}
          />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiText}>😀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emojiButton}>
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
              placeholder={t('Reply to Sarah here...')}
              placeholderTextColor={COLORS.textLight}
              value={messageText}
              onChangeText={setMessageText}
              maxLength={500}
              style={styles.textInput}
            />
            <TouchableOpacity
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
    </View>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(4),
    paddingVertical: height(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    minHeight: height(10),
    paddingTop: Platform.OS === 'ios' ? height(2) : height(1),
  },
  otherMessageTime: {
    textAlign: 'left',
    marginLeft: width(1),
    marginTop: height(0.5),
  },
  backButton: {
    padding: width(2),
    marginRight: width(1),
  },
  backIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.textDark,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: width(1),
  },
  headerAvatar: {
    width: width(12),
    height: width(12),
    borderRadius: width(6),
    marginRight: width(3),
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: Math.max(16, screenWidth * 0.04),
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: height(0.5),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: width(1),
  },
  headerStatus: {
    fontSize: Math.max(12, screenWidth * 0.03),
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  moreButton: {
    padding: width(2),
    marginLeft: width(1),
  },
  moreIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.textDark,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: width(1),
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
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
  messageText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    lineHeight: Math.max(20, screenWidth * 0.05),
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    width: width(72),
    alignSelf: 'center',
  },
  myMessageTime: {
    textAlign: 'right',
    marginRight: width(1),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: width(4),
    paddingVertical: height(2),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    minHeight: height(12),
    paddingBottom: Platform.OS === 'ios' ? height(3) : height(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width(2),
    justifyContent: 'space-between',
    bottom: 0,
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
  emojiText: {
    fontSize: Math.max(20, screenWidth * 0.05),
  },
  textInput: {
    width: width(55),
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    height: width(12),
    paddingHorizontal: width(5),
  },
  attachButton: {
    padding: width(1.5),
    marginLeft: width(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.textLight,
  },
  sendButton: {
    width: width(12),
    height: width(12),
    borderRadius: width(6),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.backgroundLight,
  },
  sendIcon: {
    width: width(5),
    height: width(5),
  },
  sendIconActive: {
    tintColor: COLORS.white,
  },
  sendIconInactive: {
    tintColor: COLORS.textLight,
  },
});

export default ChatDetail;
