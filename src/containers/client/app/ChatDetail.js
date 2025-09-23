import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import ChatCard from '../../../components/chatCard';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

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

const ChatDetail = ({navigation}) => {
  const {t} = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(messagesData);
  const [showRequestModal, setShowRequestModal] = useState(false);

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
    }
  };

  const renderMessage = ({item}) => (
    <>
      <View
        style={[
          styles.messageContainer,
          item.isMe ? styles.myMessageContainer : styles.otherMessageContainer,
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
    </>
  );

  const onContinueToShipping = () => {
    setShowRequestModal(true);
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
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: width(2)}}
          ListFooterComponent={
            <View
              style={{
                marginVertical: width(3),
                marginHorizontal: width(3),
                padding: width(4),
                backgroundColor: COLORS.white,
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  source={IMAGES.profilePhoto}
                  style={{
                    height: width(13),
                    width: width(13),
                    borderRadius: 100,
                  }}
                />
                <View style={{margin: width(2)}}>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansBold,
                      fontSize: 12,
                      color: COLORS.textDark,
                    }}>
                    Sarah Johnson
                  </Text>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansBold,
                      fontSize: 10,
                      color: COLORS.textLight,
                    }}>
                    Thanks for the quick res....{' '}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  marginTop: width(3),
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
                }}>
                With over 7 years of event experience, DJ Ray...
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  marginVertical: width(3),
                }}>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    fontSize: 14,
                    color: COLORS.textDark,
                  }}>
                  $300
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansBold,
                    fontSize: 9,
                    color: COLORS.textLight,
                  }}>
                  /Day
                </Text>
              </View>
              <GradientButton
                text="View Detail"
                onPress={() => onContinueToShipping()}
                type="filled"
                textStyle={styles.sendRequestText}
              />
            </View>
          }
        />
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
              onPress={sendMessage}
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
