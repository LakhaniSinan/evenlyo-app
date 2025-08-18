import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {width, height} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {useTranslation} from '../../../hooks';

// Dummy messages data
const messagesData = [
  {
    id: '1',
    text: 'Hi! I wanted to follow up on our previous discussion about the project timeline.',
    isMe: false,
    time: '10:30 AM',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  },
  {
    id: '2',
    text: 'Hello! Of course, I\'ve been working on the revised timeline. Let me share the updated schedule with you.',
    isMe: true,
    time: '10:32 AM',
  },
  {
    id: '3',
    text: 'That sounds great! When can we schedule the next meeting?',
    isMe: false,
    time: '10:35 AM',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  },
];

const ChatDetail = ({navigation, route}) => {
  const {t} = useTranslation();
  const {chat} = route.params;
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(messagesData);

  const sendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        isMe: true,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const renderMessage = ({item}) => {
    return (
      <View style={[
        styles.messageContainer,
        item.isMe ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!item.isMe && (
          <Image source={{uri: item.avatar}} style={styles.messageAvatar} />
        )}
        <View style={[
          styles.messageBubble,
          item.isMe ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isMe ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          item.isMe ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Image source={ICONS.leftArrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Image source={{uri: chat.avatar}} style={styles.headerAvatar} />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{chat.name}</Text>
              <Text style={styles.headerStatus}>
                {chat.isOnline ? t('Online') : t('Offline')}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Image source={ICONS.menuIcon} style={styles.moreIcon} />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.emojiButton}>
              <Text style={styles.emojiText}>😀</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder={t('Reply to johnam here...')}
              placeholderTextColor={COLORS.textLight}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity style={styles.attachButton}>
              <Image source={ICONS.editIcon} style={styles.attachIcon} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!messageText.trim()}>
            <Image 
              source={ICONS.rightArrow} 
              style={[
                styles.sendIcon,
                messageText.trim() ? styles.sendIconActive : styles.sendIconInactive
              ]} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    minHeight: height(8),
  },
  backButton: {
    padding: width(2),
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
    marginLeft: width(2),
  },
  headerAvatar: {
    width: width(10),
    height: width(10),
    borderRadius: width(5),
    marginRight: width(3),
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: screenWidth > 400 ? 16 : 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  headerStatus: {
    fontSize: screenWidth > 400 ? 12 : 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginTop: height(0.3),
  },
  moreButton: {
    padding: width(2),
  },
  moreIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.textDark,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: width(4),
    paddingVertical: height(2),
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: height(2),
    alignItems: 'flex-end',
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
    borderRadius: width(4),
    marginRight: width(2),
  },
  messageBubble: {
    maxWidth: screenWidth > 400 ? '75%' : '70%',
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    borderRadius: width(5),
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    marginRight: width(2),
  },
  otherMessageBubble: {
    backgroundColor: COLORS.backgroundLight,
    marginLeft: width(2),
  },
  messageText: {
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    lineHeight: screenWidth > 400 ? 20 : 18,
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: screenWidth > 400 ? 10 : 8,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginTop: height(0.5),
  },
  myMessageTime: {
    textAlign: 'right',
  },
  otherMessageTime: {
    textAlign: 'left',
    marginLeft: width(10),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    minHeight: height(8),
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(6),
    paddingHorizontal: width(4),
    paddingVertical: height(1),
    marginRight: width(2),
    minHeight: height(5.5),
  },
  emojiButton: {
    padding: width(1),
    marginRight: width(2),
  },
  emojiText: {
    fontSize: screenWidth > 400 ? 20 : 18,
  },
  textInput: {
    flex: 1,
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    maxHeight: height(12),
    paddingVertical: height(1),
  },
  attachButton: {
    padding: width(1),
    marginLeft: width(2),
  },
  attachIcon: {
    width: width(5),
    height: width(5),
    tintColor: COLORS.textLight,
  },
  sendButton: {
    width: width(11),
    height: width(11),
    borderRadius: width(5.5),
    justifyContent: 'center',
    alignItems: 'center',
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
