import React, {useState} from 'react';
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
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const chatData = [
  {
    id: '2',
    name: 'Michael Chen',
    message: 'Thanks for the quick response!',
    time: '3 hrs ago',
    unreadCount: 0,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    message: 'Thanks for the quick response!',
    time: '3 hrs ago',
    unreadCount: 1,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    message: 'Thanks for the quick response!',
    time: '3 hrs ago',
    unreadCount: 0,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    message: 'Thanks for the quick response!',
    time: '3 hrs ago',
    unreadCount: 3,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isOnline: true,
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    message: 'Thanks for the quick response!',
    time: '3 hrs ago',
    unreadCount: 0,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isOnline: false,
  },
];

const Messages = ({navigation}) => {
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState('');

  const renderChatItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', {chat: item})}>
        <View style={styles.avatarContainer}>
          <Image source={{uri: item.avatar}} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.name}</Text>
            <View style={styles.rightSection}>
              <Text style={styles.timeText}>{item.time}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          borderBottomLeftRadius: width(10),
          borderBottomRightRadius: width(10),
        }}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={t('Messages')}
          onLeftIconPress={() => navigation.goBack()}
          showSearchbar={true}
        />

        <View style={styles.searchContainer}>
          <TextField
            startIcon={ICONS.search}
            bgColor={COLORS.white}
            placeholder={t('Search')}
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      <FlatList
        data={chatData}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: width(5),
    paddingVertical: height(2),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    minHeight: height(6),
  },
  searchIcon: {
    width: width(4),
    height: width(4),
    tintColor: COLORS.textLight,
    marginRight: width(3),
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(5),
    paddingVertical: height(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    minHeight: height(9),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: width(3),
  },
  avatar: {
    width: width(12),
    height: width(12),
    borderRadius: width(6),
  },
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
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
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
  rightSection: {
    alignItems: 'flex-end',
    minWidth: width(15),
  },
  timeText: {
    fontSize: screenWidth > 400 ? 12 : 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginBottom: height(0.3),
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: width(2.5),
    minWidth: width(5),
    height: width(5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width(1.5),
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
});

export default Messages;
